<template>
  <Page>
    <ActionBar :title="'clock.clock' | L">
      <NavigationButton :text="'generics.back' | L" android.systemIcon="ic_menu_back" @tap="stopClock"></NavigationButton>
    </ActionBar>
    <GridLayout columns="*" rows="*, *">
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
      <Button row="1" col="0" :isEnabled="!finished && whiteTurn" class="button white" @tap="whiteTap">
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
import { Type } from '@/types/clock';
import { Configuration } from '@/classes/configuration';
import { Dialogs } from '@nativescript/core';

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
</style>