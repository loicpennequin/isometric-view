import {
  Boundaries,
  Circle,
  Dimensions,
  Matrix,
  Point,
  Point3D,
  Range,
  Rectangle
} from './types';

export const cartesianToIsometric = (point: Point) => ({
  x: point.x - point.y,
  y: point.x + point.y
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
  Array.from({ length: dimensions.h }, (_, x) =>
    Array.from({ length: dimensions.w }, (_, y) => initialValue({ x, y }))
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

export const addVector3D = (vec1: Point3D, vec2: Point3D) => ({
  x: vec1.x + vec2.x,
  y: vec1.y + vec2.y,
  z: vec1.z + vec2.z
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

export const clampVector = (
  { x, y }: Point,
  { min, max }: Boundaries<Point>
): Point => ({
  x: clamp(x, { min: min.x, max: max.x }),
  y: clamp(y, { min: min.y, max: max.y })
});

export const vectorEquals = (vec1: Point, vec2: Point) =>
  vec1.x === vec2.x && vec1.y === vec2.y;

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

export const diamond = (
  ctx: CanvasRenderingContext2D,
  { x, y, w, h }: Rectangle
) => {
  ctx.beginPath();
  ctx.moveTo(x, y);

  ctx.lineTo(x - w / 2, y + h / 2);

  ctx.lineTo(x, y + h);

  ctx.lineTo(x + w / 2, y + h / 2);

  ctx.closePath();
};

export const rotateMatrix = <T>(
  matrix: Matrix<T>,
  angle: number
): Matrix<T> => {
  if (angle % 90 !== 0) {
    throw new Error('Invalid input; degrees must be a multiple of 90');
  }

  const deg = ((angle % 360) + 360) % 360;
  const w = matrix.length;
  const h = matrix[0].length;

  let newMatrix = new Array(h);

  if (deg === 90) {
    for (let y = 0; y < h; y++) {
      newMatrix[y] = new Array(w);
      for (let x = 0; x < w; x++) {
        newMatrix[y][x] = matrix[w - 1 - x][y];
      }
    }
  } else if (deg === 180) {
    for (let y = 0; y < h; y++) {
      let n = h - 1 - y;
      newMatrix[n] = new Array(w);
      for (let x = 0; x < w; x++) {
        newMatrix[n][w - 1 - x] = matrix[y][x];
      }
    }
  } else if (deg === 270) {
    for (let y = 0; y < h; y++) {
      newMatrix[y] = new Array(w);
      for (let x = 0; x < w; x++) {
        newMatrix[y][x] = matrix[x][h - 1 - y];
      }
    }
  } else {
    newMatrix = matrix;
  }

  return newMatrix;
};
