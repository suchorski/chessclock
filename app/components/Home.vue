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

declare let __DEV__: boolean;

export default {
  components: { Clock, Options },
  data() {
    return {
      adLoaded: false,
      canStart: false,
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
          this.$navigateTo(Clock);
        }
      }
    },
    onNavigatedFrom() {
      this.adLoaded = false;
      this.canStart = false;
    },
    onNavigatedTo() {
      const keywords = ['chess', 'clock'];
      this.$firebase.admob
        .preloadRewardedVideoAd({
          androidAdPlacementId: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : process.env.ANDROID_ADMOB_REWARDED_VIDEO_ID,
          iosAdPlacementId: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : process.env.IOS_ADMOB_REWARDED_VIDEO_ID,
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
    },
  },
};
</script>