import { AdMob, BannerAdPosition, BannerAdSize, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const AD_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

class AdService {
  private initialized = false;
  private habitCompletionCount = 0;
  private bannerShown = false;

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: true,
      });
      this.initialized = true;
    } catch (e) {
      console.error('AdMob Init Error', e);
    }
  }

  async showBanner() {
    if (!Capacitor.isNativePlatform()) return;
    if (this.bannerShown) return;
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
    } catch (e) {
      console.error('Banner Error', e);
    }
  }

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.removeBanner();
      this.bannerShown = false;
    } catch (e) {
      console.error('Hide Banner Error', e);
    }
  }

  async onHabitCompleted() {
    this.habitCompletionCount++;
    if (this.habitCompletionCount % 3 === 0) {
      await this.showInterstitial();
    }
  }

  private async showInterstitial() {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.initialized) await this.initialize();
    try {
      await AdMob.prepareInterstitial({
        adId: AD_IDS.interstitial,
        isTesting: true,
      });
      // Wait for ready then show
      await new Promise<void>((resolve) => {
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, async () => {
          await AdMob.showInterstitial();
          resolve();
        });
        // timeout fallback
        setTimeout(resolve, 5000);
      });
    } catch (e) {
      console.error('Interstitial Error', e);
    }
  }

  async showRewarded(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    if (!this.initialized) await this.initialize();
    try {
      await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: true });
      const reward = await AdMob.showRewardVideoAd();
      return !!reward;
    } catch (e) {
      console.error('Rewarded Ad Error', e);
      return false;
    }
  }
}

export const adService = new AdService();
