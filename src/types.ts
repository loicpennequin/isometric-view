export type Point = { x: number; y: number };
export type Dimensions = { w: number; h: number };
export type Rectangle = Point & Dimensions;
export type Circle = Point & { r: number };
export type Matrix<T> = T[][];
export type Range = { min: number; max: number };
export type Nullable<T> = T | null | undefined;
