import {
  AdMob, BannerAdPosition, BannerAdSize,
  InterstitialAdPluginEvents, RewardAdPluginEvents
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AD_IDS = {
  banner:       'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded:     'ca-app-pub-3940256099942544/5224354917',
};

class AdService {
  private initialized = false;
  private habitCount = 0;
  private bannerShown = false;
  private rewardedReady = false;
  private interstitialReady = false;
  private preloadingRewarded = false;
  private preloadingInterstitial = false;
  private initPromise: Promise<void> | null = null;

  // Single init promise — prevent double-init
  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        await AdMob.initialize({ initializeForTesting: true });
        this.initialized = true;
        // Preload both in background — no await
        this._preloadRewarded();
        this._preloadInterstitial();
      } catch (e) {
        console.error('AdMob init', e);
      }
    })();
    return this.initPromise;
  }

  private async _preloadRewarded() {
    if (this.rewardedReady || this.preloadingRewarded || !this.initialized) return;
    this.preloadingRewarded = true;
    try {
      const loaded = AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        this.rewardedReady = true;
        this.preloadingRewarded = false;
      });
      const failed = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        this.rewardedReady = false;
        this.preloadingRewarded = false;
        setTimeout(() => this._preloadRewarded(), 20000);
      });
      await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: true });
    } catch (e) {
      this.preloadingRewarded = false;
      setTimeout(() => this._preloadRewarded(), 20000);
    }
  }

  private async _preloadInterstitial() {
    if (this.interstitialReady || this.preloadingInterstitial || !this.initialized) return;
    this.preloadingInterstitial = true;
    try {
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        this.interstitialReady = true;
        this.preloadingInterstitial = false;
      });
      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
        this.interstitialReady = false;
        this.preloadingInterstitial = false;
        setTimeout(() => this._preloadInterstitial(), 20000);
      });
      await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: true });
    } catch (e) {
      this.preloadingInterstitial = false;
    }
  }

  async showBanner() {
    if (!Capacitor.isNativePlatform() || this.bannerShown) return;
    if (!this.initialized) await this.initialize();
    try {
      await AdMob.showBanner({
        adId: AD_IDS.banner,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 80,
        isTesting: true,
      });
      this.bannerShown = true;
    } catch (e) { console.error('Banner', e); }
  }

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try { await AdMob.removeBanner(); this.bannerShown = false; } catch (_) {}
  }

  async onHabitCompleted() {
    this.habitCount++;
    if (this.habitCount % 3 === 0) this._showInterstitial();
  }

  private async _showInterstitial() {
    if (!Capacitor.isNativePlatform() || !this.initialized) return;
    try {
      if (this.interstitialReady) {
        this.interstitialReady = false;
        await AdMob.showInterstitial();
        setTimeout(() => this._preloadInterstitial(), 1000);
      } else {
        // Load + show with 10s timeout
        await new Promise<void>((resolve) => {
          let done = false;
          const finish = () => { if (!done) { done = true; resolve(); } };
          AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
            await AdMob.showInterstitial().catch(() => {});
            finish();
          });
          AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, finish);
          AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: true }).catch(finish);
          setTimeout(finish, 10000);
        });
      }
    } catch (e) { console.error('Interstitial', e); }
  }

  // Single rewarded — uses preloaded if ready
  private async _showOneRewarded(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      await new Promise(r => setTimeout(r, 600));
      return true;
    }
    if (!this.initialized) await this.initialize();

    return new Promise(async (resolve) => {
      let rewarded = false;
      let settled = false;

      const settle = (val: boolean) => {
        if (settled) return;
        settled = true;
        resolve(val);
        this.rewardedReady = false;
        this.preloadingRewarded = false;
        setTimeout(() => this._preloadRewarded(), 1000);
      };

      try {
        AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { rewarded = true; });
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => settle(rewarded));
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => settle(false));
        AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => settle(false));

        if (this.rewardedReady) {
          // Already preloaded → instant!
          this.rewardedReady = false;
          await AdMob.showRewardVideoAd().catch(() => settle(false));
        } else {
          // Not ready → load now, 15s timeout
          AdMob.addListener(RewardAdPluginEvents.Loaded, async () => {
            await AdMob.showRewardVideoAd().catch(() => settle(false));
          });
          await AdMob.prepareRewardVideoAd({
            adId: AD_IDS.rewarded, isTesting: true
          }).catch(() => settle(false));
          setTimeout(() => settle(false), 15000);
        }
        setTimeout(() => settle(rewarded), 60000);
      } catch (e) {
        settle(false);
      }
    });
  }

  async showRewardedSequence(
    count = 4,
    onProgress?: (current: number, total: number) => void
  ): Promise<boolean> {
    let success = 0;
    for (let i = 0; i < count; i++) {
      onProgress?.(i + 1, count);
      const ok = await this._showOneRewarded();
      if (ok) success++;
      else break;
      if (i < count - 1) await new Promise(r => setTimeout(r, 500));
    }
    return success >= Math.ceil(count / 2);
  }
}

export const adService = new AdService();
