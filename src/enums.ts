import { Values } from './types';

export const StageLayerType = {
  TILES: 'tilelayer',
  OBJECTS: 'objectgroup'
} as const;
export type StageLayerType = Values<typeof StageLayerType>;
