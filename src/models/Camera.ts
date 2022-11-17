import { Point } from '@/types';

export type CameraView = Point & {
  scale: number;
  angle: number;
};

export class Camera {
  view: CameraView = {
    x: 0,
    y: 0,
    scale: 1,
    angle: 0
  };

  constructor(defaults: Partial<CameraView>) {
    Object.assign(this.view, defaults);
  }

  update(newView: Partial<CameraView>) {
    Object.assign(this.view, newView);
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.view.x, this.view.y);
    ctx.scale(this.view.scale, this.view.scale);
  }
}
