export type Point = { x: number; y: number };
export type Dimensions = { w: number; h: number };
export type Rectangle = Point & Dimensions;
export type Circle = Point & { r: number };
export type Matrix<T> = T[][];
export type Boundaries<T = number> = { min: T; max: T };
export type Range = Boundaries<number>;
export type Nullable<T> = T | null | undefined;

export type TileSetMeta = {
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
  tilewidth: number;
  type: string;
  version: string;
};

export type MapMeta = {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: MapMetaLayer[];
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
};

export type MapMetaLayer = {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  offsetx?: number;
  offsety?: number;
  parallaxy?: number;
};
