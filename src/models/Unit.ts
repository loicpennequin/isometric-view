import { withImageLoader } from '@/mixins/withImageLoader';
import { withMovement } from '@/mixins/withMovement';
import { withSprite } from '@/mixins/withSprite';
import { mixinBuilder } from '@/utils';
import { Entity } from './Entity';

const mixins = mixinBuilder(Entity)
  .add(withImageLoader)
  .add(withSprite)
  .add(withMovement);

export class Unit extends mixins.build() {
  draw(ctx: CanvasRenderingContext2D) {
    const cellInfos = this.stage.getCellInfoByPoint3D(this.position);
    if (!cellInfos) return;

    const { x, y, h, tileMeta } = cellInfos;
    this.renderSprite(ctx, { x, y: y + (tileMeta.slope ? h / 3 : 0) });
  }
}
