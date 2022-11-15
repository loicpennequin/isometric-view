import { Values } from './types';

export const StageLayerType = {
  TILES: 'tilelayer',
  OBJECTS: 'objectgroup'
} as const;
export type StageLayerType = Values<typeof StageLayerType>;

export const TileSlope = {
  ALL: 'all',
  NORTH_EAST: 'ne',
  EAST: 'e',
  SOUTH_EAST: 'se',
  SOUTH: 's',
  SOUTH_WEST: 'sw',
  WEST: 'w',
  NORTH_WEST: 'nw'
} as const;
export type Tileslope = Values<typeof TileSlope>;

export const Direction = {
  NORTH: 'n',
  NORTH_EAST: 'ne',
  EAST: 'e',
  SOUTH_EAST: 'se',
  SOUTH: 's',
  SOUTH_WEST: 'sw',
  WEST: 'w',
  NORTH_WEST: 'nw'
};
export type Direction = Values<typeof Direction>;
