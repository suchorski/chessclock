<template>
  <Page>
    <ActionBar :title="'home.configurations' | L">
      <NavigationButton :text="'generics.back' | L" android.systemIcon="ic_menu_back" @tap="$navigateBack"></NavigationButton>
      <ActionItem :text="'generics.save' | L" ios.position="right" android.systemIcon="ic_menu_save" @tap="save" />
    </ActionBar>
    <StackLayout margin="8">
      <Label class="h2" :text="'configurations.clock.timers' | L" textWrap="true" />
      <DockLayout stretchLastChild="true">
        <TextField dock="right" class="text-center" width="14%" :hint="'generics.seconds' | L" v-model="cfg.timers.player.white.seconds" keyboardType="number" />
        <Label style.verticalAlignment="center" dock="right" class="h2" width="2%" text=":" textWrap="true" />
        <TextField dock="right" class="text-center" width="14%" :hint="'generics.minutes' | L" v-model="cfg.timers.player.white.minutes" keyboardType="number" />
        <Label style.verticalAlignment="center" :text="'configurations.player.white' | L" textWrap="true" />
      </DockLayout>
      <DockLayout stretchLastChild="true">
        <Switch v-model="cfg.timers.same" dock="right" width="25%" />
        <Label style.verticalAlignment="center" :text="'configurations.clock.same' | L" textWrap="true" />
      </DockLayout>
      <DockLayout stretchLastChild="true" v-if="!cfg.timers.same">
        <TextField dock="right" class="text-center" width="14%" :hint="'generics.seconds' | L" v-model="cfg.timers.player.black.seconds" keyboardType="number" />
        <Label style.verticalAlignment="center" dock="right" class="h2" width="2%" text=":" textWrap="true" />
        <TextField dock="right" class="text-center" width="14%" :hint="'generics.minutes' | L" v-model="cfg.timers.player.black.minutes" keyboardType="number" />
        <Label style.verticalAlignment="center" :text="'configurations.player.black' | L" textWrap="true" />
      </DockLayout>
      <Label class="h2" :text="'configurations.clock.type' | L" textWrap="true" marginTop="20" />
      <SegmentedBar v-model="cfg.clock.type">
        <SegmentedBarItem :title="types[0].name | L" />
        <SegmentedBarItem :title="types[1].name | L" />
        <SegmentedBarItem :title="types[2].name | L" />
      </SegmentedBar>
      <DockLayout stretchLastChild="true" v-if="cfg.clock.type > 0">
        <TextField dock="right" v-if="cfg.clock.type === 1" class="text-center" width="20%" :hint="'generics.seconds' | L" v-model="cfg.clock.delay.fischer" keyboardType="number" />
        <Label style.verticalAlignment="bottom" v-if="cfg.clock.type === 1" :text="'configurations.bonus' | L" textWrap="true" />
        <TextField dock="right" v-if="cfg.clock.type === 2" class="text-center" width="20%" :hint="'generics.seconds' | L" v-model="cfg.clock.delay.bronstein" keyboardType="number" />
        <Label style.verticalAlignment="bottom" v-if="cfg.clock.type === 2" :text="'configurations.delay' | L" textWrap="true" />
      </DockLayout>
      <Label class="h2" :text="'configurations.clock.info' | L" textWrap="true" marginTop="20" />
      <Label :text="types[cfg.clock.type].description | L" textWrap="true" />
      <Label class="h2" :text="'configurations.ad.title' | L" textWrap="true" marginTop="20" />
      <DockLayout stretchLastChild="true">
        <Switch v-model="cfg.ad.rewarded" dock="right" width="25%" />
        <Label style.verticalAlignment="center" :text="'configurations.ad.question' | L" textWrap="true" />
      </DockLayout>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
import { types } from '@/types/clock';
import { Configuration } from '@/classes/configuration';
import { Toasty } from '@triniwiz/nativescript-toasty';

export default {
  data() {
    return {
      cfg: Configuration.copy,
    };
  },
  computed: {
    types() {
      return types;
    },
  },
  methods: {
    save() {
      Configuration.save(this.cfg);
      new Toasty({ text: this.$localize('configurations.saved') }).show();
      this.$navigateBack();
    },
  },
};
</script>