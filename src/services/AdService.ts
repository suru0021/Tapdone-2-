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

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    try {
      await AdMob.initialize({ initializeForTesting: true });
      this.initialized = true;
    } catch (e) { console.error('AdMob Init Error', e); }
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

  // Single rewarded ad with proper dismiss handling
  private async showOneRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      await new Promise(r => setTimeout(r, 1500));
      return true;
    }
    if (!this.initialized) await this.initialize();
    return new Promise(async (resolve) => {
      let rewarded = false;
      let settled = false;
      const settle = (val: boolean) => {
        if (settled) return;
        settled = true;
        AdMob.removeAllListeners().catch(() => {});
        resolve(val);
      };
      try {
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { rewarded = true; });
        await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => settle(rewarded));
        await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => settle(false));
        await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: true });
        await AdMob.addListener(RewardAdPluginEvents.Loaded, async () => {
          await AdMob.showRewardVideoAd();
        });
        setTimeout(() => settle(rewarded), 60000);
      } catch (e) { console.error('Rewarded Ad Error', e); settle(false); }
    });
  }

  // Show 3-5 ads one by one for premium preview unlock
  // onProgress(current, total) — callback for UI progress
  async showRewardedSequence(
    count: number = 4,
    onProgress?: (current: number, total: number) => void
  ): Promise<boolean> {
    let successCount = 0;
    for (let i = 0; i < count; i++) {
      onProgress?.(i + 1, count);
      const result = await this.showOneRewardedAd();
      if (result) successCount++;
      else break; // stop if ad failed
      // small delay between ads
      if (i < count - 1) await new Promise(r => setTimeout(r, 800));
    }
    return successCount >= Math.ceil(count / 2); // at least half must succeed
  }
}

export const adService = new AdService();
