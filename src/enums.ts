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

export const EntityOrientation = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
} as const;
export type EntityOrientation = Values<typeof EntityOrientation>;

export const EntityState = {
  IDLE: 'idle',
  WALKING: 'walking'
} as const;
export type EntityState = Values<typeof EntityState>;
