export enum Type {
  NORMAL,
  FISCHER,
  BRONSTEIN,
}

export const types = [
  { type: Type.NORMAL, name: 'clocks.default.name', description: 'clocks.default.description' },
  { type: Type.FISCHER, name: 'clocks.fischer.name', description: 'clocks.fischer.description' },
  { type: Type.BRONSTEIN, name: 'clocks.bronstein.name', description: 'clocks.bronstein.description' },
]