<template>
  <Page @navigatedFrom="onNavigatedFrom" @navigatedTo="onNavigatedTo">
    <ActionBar :title="'app.name' | L"></ActionBar>
    <DockLayout stretchLastChild="true">
      <StackLayout dock="bottom">
        <Button :text="'home.configurations' | L" @tap="configure"></Button>
        <Button :text="'home.start' | L" @tap="startClock" :isEnabled="canStart"></Button>
      </StackLayout>
      <Image dock="top" width="100%" src="res://logo" stretch="aspectFit"></Image>
    </DockLayout>
  </Page>
</template>

<script lang="ts">
import Clock from '@/components/Clock.vue';
import Options from '@/components/Options.vue';
import { Configuration } from '@/classes/configuration';

declare let __DEV__: boolean;

export default {
  components: { Clock, Options },
  data() {
    return {
      adLoaded: false,
      canStart: false,
      reward: Configuration.copy.ad.rewarded,
      rewarded: false,
    };
  },
  methods: {
    configure() {
      this.$navigateTo(Options);
    },
    startClock() {
      if (this.canStart) {
        this.canStart = false;
        if (this.adLoaded) {
          this.adLoaded = false;
          if (this.reward) {
            this.$firebase.admob.showRewardedVideoAd({
              onRewarded: () => {
                this.rewarded = true;
              },
              onClosed: () => {
                if (this.rewarded) {
                  this.$navigateTo(Clock);
                } else {
                  this.onNavigatedFrom();
                  this.onNavigatedTo();
                }
              },
            });
          } else {
            this.$firebase.admob.showInterstitial();
          }
        } else {
          this.$navigateTo(Clock);
        }
      }
    },
    onNavigatedFrom() {
      this.adLoaded = false;
      this.canStart = false;
    },
    onNavigatedTo() {
      this.reward = Configuration.copy.ad.rewarded;
      const keywords = ['chess', 'clock'];
      if (this.reward) {
        this.$firebase.admob
          .preloadRewardedVideoAd({
            androidAdPlacementId: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-7255006190009562/7140961251',
            iosAdPlacementId: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-7255006190009562/3345703394',
            testing: __DEV__,
            keywords,
          })
          .then(
            () => {
              this.adLoaded = true;
              this.canStart = true;
            },
            () => {
              this.adLoaded = false;
              this.canStart = true;
            }
          );
      } else {
        this.$firebase.admob
          .preloadInterstitial({
            androidInterstitialId: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-7255006190009562/8454042921',
            iosInterstitialId: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-7255006190009562/6659984642',
            testing: __DEV__,
            keywords,
            onClosed: () => {
              this.$navigateTo(Clock);
            },
          })
          .then(
            () => {
              this.adLoaded = true;
              this.canStart = true;
            },
            () => {
              this.adLoaded = false;
              this.canStart = true;
            }
          );
      }
    },
  },
};
</script>