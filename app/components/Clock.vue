<template>
  <Page @loaded="loaded">
    <ActionBar :title="'clock.clock' | L">
      <NavigationButton :text="'generics.back' | L" android.systemIcon="ic_menu_back" @tap="stopClock"></NavigationButton>
    </ActionBar>
    <GridLayout columns="*" rows="*, auto, auto, *">
      <Button row="0" col="0" :isEnabled="!finished && !whiteTurn" class="button black upsidedown" @tap="blackTap">
        <FormattedString>
          <Span :text="`${blackText.color}\n`" fontSize="20" />
          <Span :text="'\n'" fontSize="20" />
          <Span :text="'clock.remaining' | L" />
          <Span :text="'\n'" />
          <Span :text="'\n'" fontSize="20" />
          <Span :text="`${blackText.time}\n`" fontSize="45" />
          <Span :text="'\n'" fontSize="20" v-if="clock.type === 2" />
          <Span :text="ticks.delay.black | toSeconds" fontSize="38" v-if="clock.type === 2" />
        </FormattedString>
      </Button>
      <Placeholder v-if="showAd" row="1" col="0" @creatingView="creatingView" id="bannerViewBlack" class="upsidedown" />
      <Placeholder v-if="showAd" row="2" col="0" @creatingView="creatingView" id="bannerViewWhite" />
      <Button row="3" col="0" :isEnabled="!finished && whiteTurn" class="button white" @tap="whiteTap">
        <FormattedString>
          <Span :text="`${whiteText.color}\n`" fontSize="20" />
          <Span :text="'\n'" fontSize="20" />
          <Span :text="'clock.remaining' | L" />
          <Span :text="'\n'" />
          <Span :text="'\n'" fontSize="20" />
          <Span :text="`${whiteText.time}\n`" fontSize="45" />
          <Span :text="'\n'" fontSize="20" v-if="clock.type === 2" />
          <Span :text="ticks.delay.white | toSeconds" fontSize="38" v-if="clock.type === 2" />
        </FormattedString>
      </Button>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { isIOS } from '@nativescript/core';
import { Type } from '@/types/clock';
import { Configuration } from '@/classes/configuration';
import { Dialogs } from '@nativescript/core';

declare let __DEV__: boolean;
declare const com;
declare const GADBannerView;
declare const GADRequest;
declare const kGADAdSizeSmartBannerPortrait;
declare const kGADSimulatorID;

const calcTicks = (ticks: number | { minutes: number; seconds: number }) => {
  if (typeof ticks === 'number') {
    let t = ticks / 1000;
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t - minutes * 60);
    return minutes < 0 ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return (ticks.minutes * 60 + ticks.seconds) * 1000;
  }
};

export default {
  data() {
    const cfg = Configuration.copy;
    return {
      clock: cfg.clock,
      timer: null,
      started: false,
      finished: false,
      whiteTurn: false,
      ticks: {
        last: 0,
        delay: { white: cfg.clock.delay.bronstein * 1000, black: cfg.clock.delay.bronstein * 1000 },
        player: {
          white: calcTicks(cfg.timers.player.white),
          black: cfg.timers.same ? calcTicks(cfg.timers.player.white) : calcTicks(cfg.timers.player.black),
        },
      },
      showAd: !cfg.ad.rewarded,
    };
  },
  computed: {
    whiteText() {
      return {
        color: this.$localize('clock.white'),
        time: calcTicks(this.ticks.player.white),
      };
    },
    blackText() {
      return {
        color: this.$localize('clock.black'),
        time: calcTicks(this.ticks.player.black),
      };
    },
  },
  methods: {
    whiteTap(changePlayer = true) {
      if (this.started && this.whiteTurn) {
        const ticks = this.getTicks();
        if (this.clock.type !== Type.BRONSTEIN) {
          this.ticks.player.white -= ticks;
          if (this.clock.type === Type.FISCHER && changePlayer) {
            this.ticks.player.white += this.clock.delay.fischer * 1000;
          }
        } else {
          if (this.ticks.delay.white > 0) {
            this.ticks.delay.white -= ticks;
            if (this.ticks.delay.white < 0) {
              this.ticks.player.white -= this.ticks.delay.white;
            }
          } else {
            this.ticks.player.white -= ticks;
          }
          if (changePlayer) {
            this.ticks.delay.white = this.clock.delay.bronstein * 1000;
          }
        }
        if (changePlayer) {
          this.whiteTurn = false;
        }
      }
    },
    blackTap(changePlayer = true) {
      if (this.started && !this.whiteTurn) {
        const ticks = this.getTicks();
        if (this.clock.type !== Type.BRONSTEIN) {
          this.ticks.player.black -= ticks;
          if (this.clock.type === Type.FISCHER && changePlayer) {
            this.ticks.player.black += this.clock.delay.fischer * 1000;
          }
        } else {
          if (this.ticks.delay.black > 0) {
            this.ticks.delay.black -= ticks;
            if (this.ticks.delay.black < 0) {
              this.ticks.player.black -= this.ticks.delay.black;
            }
          } else {
            this.ticks.player.black -= ticks;
          }
          if (changePlayer) {
            this.ticks.delay.black = this.clock.delay.bronstein * 1000;
          }
        }
        if (changePlayer) {
          this.whiteTurn = true;
        }
      }
      this.startClock();
    },
    startClock() {
      if (!this.started) {
        this.whiteTurn = true;
        this.ticks.last = new Date().getTime();
        this.timer = setInterval(() => {
          if (this.ticks.player.white <= 0) {
            this.cleanup(this.$localize('clock.winner.black'));
          } else if (this.ticks.player.black <= 0) {
            this.cleanup(this.$localize('clock.winner.white'));
          } else {
            if (this.whiteTurn) {
              this.whiteTap(false);
            } else {
              this.blackTap(false);
            }
          }
        }, 100);
        this.started = true;
      }
    },
    stopClock() {
      this.cleanup();
      this.$navigateBack();
    },
    cleanup(message?: string) {
      this.finished = true;
      clearInterval(this.timer);
      this.timer = null;
      if (message) {
        Dialogs.alert({
          title: this.$localize('clock.winner.alert.title'),
          message,
          okButtonText: this.$localize('clock.winner.alert.close'),
          cancelable: false,
        });
      }
    },
    getTicks() {
      const time = new Date().getTime();
      const t = time - this.ticks.last;
      this.ticks.last = time;
      return t;
    },
    creatingView(args) {
      if (isIOS) {
        const bannerView = GADBannerView.alloc().initWithAdSize(kGADAdSizeSmartBannerPortrait);
        args.view = bannerView;
      } else {
        const bannerView = new com.google.android.gms.ads.AdView(args.object._context);
        bannerView.setAdSize(com.google.android.gms.ads.AdSize.SMART_BANNER);
        args.view = bannerView;
      }
    },
    loaded(args) {
      if (this.showAd) {
        const page = args.object;
        const placeholderWhite = page.getViewById('bannerViewWhite');
        const placeholderBlack = page.getViewById('bannerViewBlack');
        const placeholderIOS = (bannerView, placeholder) => {
          if (!bannerView) {
            bannerView = placeholder.ios;
            bannerView.adUnitID = __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-7255006190009562/7375727569';
            bannerView.rootViewController = page.ios;
            const request = GADRequest.request();
            request.testDevices = [kGADSimulatorID];
            this.bannerView.loadRequest(request);
          }
        };
        const placeholderAndroid = (bannerView, placeholder) => {
          if (!bannerView) {
            const View = android.view.View;
            bannerView = placeholder.android;
            bannerView.setAdUnitId(__DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-7255006190009562/2187376848');
            const adRequest = new com.google.android.gms.ads.AdRequest.Builder();
            adRequest.addTestDevice(com.google.android.gms.ads.AdRequest.DEVICE_ID_EMULATOR);
            const requestBuild = adRequest.build();
            bannerView.loadAd(requestBuild);
          }
        };
        if (isIOS) {
          placeholderIOS(this.bannerViewWhite, placeholderWhite);
          placeholderIOS(this.bannerViewBlack, placeholderBlack);
        } else {
          placeholderAndroid(this.bannerViewWhite, placeholderWhite);
          placeholderAndroid(this.bannerViewBlack, placeholderBlack);
        }
      }
    },
  },
  filters: {
    toSeconds(value: number) {
      return Math.max(0, Math.floor(value / 1000));
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  height: 100%;
  margin: 0;

  &.white {
    color: #000000;
    background-color: #ffffff;
  }

  &.black {
    color: #ffffff;
    background-color: #666666;
  }
}

.upsidedown {
  transform: rotate(180 deg);
}
</style>