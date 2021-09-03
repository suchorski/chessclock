import { Type } from '@/types/clock'

export const configVersion = '2';

export interface IConfiguration {
  version: '2',
  timers: { player: { white: { minutes: number, seconds: number }, black: { minutes: number, seconds: number } }, same: boolean },
  clock: { type: Type, delay: { fischer: number, bronstein: number } },
  ad: { rewarded: boolean }
}