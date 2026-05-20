import { AdMob, BannerAdPosition, BannerAdSize, InterstitialAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AD_IDS = {
  banner:       'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded:     'ca-app-pub-3940256099942544/5224354917',
};

class AdService {
  private initialized = false;
  private habitCompletionCount = 0;
  private bannerShown = false;
  private rewardedReady = false;  // preloaded flag
  private preloading = false;

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    try {
      await AdMob.initialize({ initializeForTesting: true });
      this.initialized = true;
      // Preload first rewarded ad immediately after init
      this.preloadRewarded();
    } catch (e) { console.error('AdMob Init Error', e); }
  }

  // Preload ad in background — so it's ready instantly when user taps
  private async preloadRewarded() {
    if (this.rewardedReady || this.preloading || !Capacitor.isNativePlatform()) return;
    if (!this.initialized) return;
    this.preloading = true;
    try {
      await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        this.rewardedReady = true;
        this.preloading = false;
      });
      await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        this.rewardedReady = false;
        this.preloading = false;
        // Retry after 10s
        setTimeout(() => this.preloadRewarded(), 10000);
      });
      await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: true });
    } catch (e) {
      this.preloading = false;
      this.rewardedReady = false;
    }
  }

  async showBanner() {
    if (!Capacitor.isNativePlatform() || this.bannerShown) return;
    if (!this.initialized) await this.initialize();
    try {
      await AdMob.showBanner({
        adId: AD_IDS.banner, adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER, margin: 80, isTesting: true,
      });
      this.bannerShown = true;
    } catch (e) { console.error('Banner Error', e); }
  }

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try { await AdMob.removeBanner(); this.bannerShown = false; } catch (e) {}
  }

  async onHabitCompleted() {
    this.habitCompletionCount++;
    if (this.habitCompletionCount % 3 === 0) await this.showInterstitial();
  }

  private async showInterstitial() {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.initialized) await this.initialize();
    try {
      await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: true });
      await new Promise<void>((resolve) => {
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
          await AdMob.showInterstitial();
          resolve();
        });
        setTimeout(resolve, 5000);
      });
    } catch (e) { console.error('Interstitial Error', e); }
  }

  // Show one rewarded ad — uses preloaded if available
  private async showOneRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      // Web/dev simulate — instant
      await new Promise(r => setTimeout(r, 500));
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
        // Preload next ad immediately after dismiss
        this.rewardedReady = false;
        this.preloading = false;
        AdMob.removeAllListeners().catch(() => {});
        setTimeout(() => this.preloadRewarded(), 500);
      };

      try {
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { rewarded = true; });
        await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => settle(rewarded));
        await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => settle(false));
        await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => settle(false));

        if (this.rewardedReady) {
          // Ad already loaded — show instantly!
          this.rewardedReady = false;
          await AdMob.showRewardVideoAd();
        } else {
          // Not preloaded — load now with timeout
          await AdMob.addListener(RewardAdPluginEvents.Loaded, async () => {
            await AdMob.showRewardVideoAd();
          });
          await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: true });
          // 15s timeout — don't keep user waiting forever
          setTimeout(() => settle(false), 15000);
        }

        // Safety 60s max
        setTimeout(() => settle(rewarded), 60000);

      } catch (e) {
        console.error('Rewarded Ad Error', e);
        settle(false);
      }
    });
  }

  // Show 4 ads sequentially for premium preview
  async showRewardedSequence(
    count: number = 4,
    onProgress?: (current: number, total: number) => void
  ): Promise<boolean> {
    let successCount = 0;
    for (let i = 0; i < count; i++) {
      onProgress?.(i + 1, count);
      const result = await this.showOneRewardedAd();
      if (result) {
        successCount++;
      } else {
        break; // stop if ad failed/skipped
      }
      // Small gap between ads
      if (i < count - 1) await new Promise(r => setTimeout(r, 600));
    }
    return successCount >= Math.ceil(count / 2);
  }
}

export const adService = new AdService();
