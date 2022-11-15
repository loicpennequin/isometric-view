import { StageLayerType } from './enums';

export type Point = { x: number; y: number };
export type Point3D = Point & { z: number };
export type Dimensions = { w: number; h: number };
export type Rectangle = Point & Dimensions;
export type Circle = Point & { r: number };
export type Matrix<T> = T[][];
export type Boundaries<T = number> = { min: T; max: T };
export type Range = Boundaries<number>;
export type Nullable<T> = T | null | undefined;
export type AnyRecord = Record<string, any>;
export type Values<T> = T[keyof T];
export interface TileSetMeta {
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tiles: TileMeta[];
  tilewidth: number;
  type: string;
  version: string;
}

export interface TileMeta {
  id: number;
  properties?: MetaCustomProperty[];
}

export interface MetaCustomProperty {
  name: string;
  type: string;
  value: any;
}
export interface StageMeta {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: StageLayerMeta[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  type: string;
  version: string;
  width: number;
}

export interface StageLayerMeta {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: StageLayerType;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  offsetx?: number;
  offsety?: number;
  draworder?: string;
  objects?: StageLayerObjectsMeta[];
}

export interface StageLayerObjectsMeta {
  class: string;
  height: number;
  id: number;
  name: string;
  rotation: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  properties?: MetaCustomProperty[];
}
