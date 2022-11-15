import { Point3D } from '@/types';
import { circle } from '@/utils';
import { Stage } from './createStage';

export type Entity = ReturnType<typeof createEntity>;

export type CreateEntityOptions = {
  position: Point3D;
  stage: Stage;
};

export const createEntity = ({ position, stage }: CreateEntityOptions) => {
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const { x, y, w } = stage.getCellInfoByPoint3D(position);

    circle(ctx, { x: x + w / 2, y, r: 16 });
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
  };

  return {
    position,
    draw
  };
};
