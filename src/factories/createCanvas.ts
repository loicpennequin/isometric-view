import { Dimensions } from '@/types';

export const createCanvas = (dimensions: Dimensions) => {
  const canvas = Object.assign(document.createElement('canvas'), {
    width: dimensions.w,
    height: dimensions.h
  });

  return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D };
};
