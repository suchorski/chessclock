import { Type } from '@/types/clock'

export const configVersion = '3';

export interface IConfiguration {
  version: '3',
  timers: { player: { white: { minutes: number, seconds: number }, black: { minutes: number, seconds: number } }, same: boolean },
  clock: { type: Type, delay: { fischer: number, bronstein: number } },
}