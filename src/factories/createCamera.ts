import { Point } from '@/types';

export type CreateCameraOptions = {
  ctx: CanvasRenderingContext2D;
};

export type CameraView = Point & {
  scale: number;
  angle: number;
};

export type Camera = ReturnType<typeof createCamera>;

export const createCamera = (initialPosition: Partial<CameraView> = {}) => {
  const view: CameraView = {
    x: 0,
    y: 0,
    scale: 1,
    angle: 0,
    ...initialPosition
  };

  const update = (newView: Partial<CameraView>) => {
    Object.assign(view, newView);
  };

  const apply = (ctx: CanvasRenderingContext2D) => {
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
  };

  return {
    view,
    update,
    apply
  };
};
