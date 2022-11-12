import { Circle, Dimensions, Matrix, Point, Range, Rectangle } from './types';

export const cartesianToIsometric = (point: Point) => ({
  x: point.x - point.y,
  y: (point.x + point.y) / 2
});

export const isometricToCartesian = (point: Point) => ({
  x: (2 * point.y + point.x) / 2,
  y: (2 * point.y - point.x) / 2
});

export const deg2rad = (angle: number) => {
  return (angle * Math.PI) / 180;
};

export const createMatrix = <T>(
  dimensions: Dimensions,
  initialValue: (point: Point) => T
): Matrix<T> =>
  Array.from({ length: dimensions.w }, (_, x) =>
    Array.from({ length: dimensions.h }, (_, y) => initialValue({ x, y }))
  );

export const matrixForEach = <T>(
  matrix: Matrix<T>,
  cb: (el: T, i: Point) => void
) =>
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      cb(cell, { x, y });
    });
  });

export const addVector = (vec1: Point, vec2: Point) => ({
  x: vec1.x + vec2.x,
  y: vec1.y + vec2.y
});

export const subVector = (vec1: Point, vec2: Point) => ({
  x: vec1.x - vec2.x,
  y: vec1.y - vec2.y
});

export const mulVector = (vec: Point, val: Point | number) => {
  if (typeof val === 'number') {
    return {
      x: vec.x * val,
      y: vec.y * val
    };
  }

  return {
    x: vec.x * val.x,
    y: vec.y * val.y
  };
};

export const divVector = (vec: Point, val: Point | number) => {
  if (typeof val === 'number') {
    return {
      x: vec.x / val,
      y: vec.y / val
    };
  }

  return {
    x: vec.x / val.x,
    y: vec.y / val.y
  };
};

export const floorVector = (vec: Point) => ({
  x: Math.floor(vec.x),
  y: Math.floor(vec.y)
});

export const circle = (ctx: CanvasRenderingContext2D, { x, y, r }: Circle) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  ctx.closePath();
};

export const clamp = (num: number, { min, max }: Range) =>
  Math.min(Math.max(num, min), max);

export const pointRectCollision = (point: Point, rect: Rectangle) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.w &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.h;
