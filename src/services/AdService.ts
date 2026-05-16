import { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents, AdMobBannerSize, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Google Official Test Ad IDs
const AD_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

class AdService {
  private initialized = false;
  private habitCompletionCount = 0; // Every 3 completions = 1 interstitial

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;

    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: true,
      });
      this.initialized = true;
      console.log('AdMob Initialized ✅');
    } catch (e) {
      console.error('AdMob Init Error', e);
    }
  }

  // --- BANNER AD (Bottom) ---
  async showBanner() {
    if (!Capacitor.isNativePlatform()) return;
    if (!this.initialized) await this.initialize();

    try {
      await AdMob.showBanner({
        adId: AD_IDS.banner,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      });
      console.log('Banner shown ✅');
    } catch (e) {
      console.error('Banner Error', e);
    }
  }

  async hideBanner() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await AdMob.removeBanner();
    } catch (e) {
      console.error('Hide Banner Error', e);
    }
  }

  // --- INTERSTITIAL AD (Full Screen) ---
  // Called every 3 habit completions
  async onHabitCompleted() {
    this.habitCompletionCount++;
    console.log(`Habit completions: ${this.habitCompletionCount}`);

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
      await AdMob.showInterstitial();
      console.log('Interstitial shown ✅');
    } catch (e) {
      console.error('Interstitial Error', e);
    }
  }

  // --- REWARDED AD ---
  async showRewarded(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;
    if (!this.initialized) await this.initialize();

    try {
      await AdMob.prepareRewardVideoAd({
        adId: AD_IDS.rewarded,
        isTesting: true,
      });
      const reward = await AdMob.showRewardVideoAd();
      return !!reward;
    } catch (e) {
      console.error('Rewarded Ad Error', e);
      return false;
    }
  }
}

export const adService = new AdService();
