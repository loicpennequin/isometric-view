import { withMovement } from '@/mixins/withMovement';
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
    const cellInfos = stage.getCellInfoByPoint3D(position);
    if (!cellInfos) return;
    const { x, y, w, h, tileMeta } = cellInfos;
    circle(ctx, {
      x: x + w / 2,
      y: tileMeta.slope ? y + h / 3 : y,
      r: 16
    });
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
  };

  return withMovement({
    position,
    stage,
    draw
  });
};
