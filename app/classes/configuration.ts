import { ApplicationSettings } from '@nativescript/core';
import { IConfiguration, configVersion } from '@/types/configuration';
import { Type } from '@/types/clock'

const defaultConfig: IConfiguration = {
  version: configVersion,
  timers: { player: { white: { minutes: 10, seconds: 0 }, black: { minutes: 10, seconds: 0 } }, same: true },
  clock: { type: Type.NORMAL, delay: { fischer: 3, bronstein: 15 } },
};

export class Configuration {

  private static _loaded: boolean = false;
  private static _config: IConfiguration;

  public static load(): void {
    if (!Configuration._loaded) {
      Configuration.reload();
    }
  }

  public static reload(): void {
    Configuration._config = JSON.parse(ApplicationSettings.getString('config', JSON.stringify(defaultConfig)));
    Configuration._loaded = true;
  }

  public static persist(): void {
    Configuration.load();
    ApplicationSettings.setString('config', JSON.stringify(Configuration._config));
  }

  public static save(cfg: IConfiguration): void {
    Configuration._config = JSON.parse(JSON.stringify(cfg));
    Configuration.persist();
  }

  static get config(): IConfiguration {
    Configuration.load();
    return Configuration._config;
  }

  static get copy(): IConfiguration {
    return JSON.parse(JSON.stringify(Configuration.config));
  }

  public static reset(): void {
    Configuration.save(defaultConfig);
  }

  public static check(): boolean {
    const cfg = Configuration.config;
    return 'version' in cfg && cfg.version === defaultConfig.version;
  }

}