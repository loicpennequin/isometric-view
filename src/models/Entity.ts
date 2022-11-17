import { EntityOrientation } from '@/enums';
import { Stage } from '@/factories/createStage';
import { Point3D, Spritesheet } from '@/types';

export type CreateEntityOptions = {
  stage: Stage;
  position: Point3D;
  spriteSheet: Spritesheet;
};

export class Entity {
  protected stage!: Stage;

  position!: Point3D;

  spriteSheet!: Spritesheet;

  orientation: EntityOrientation = EntityOrientation.RIGHT;

  constructor(opts: CreateEntityOptions) {
    Object.assign(this, opts);
  }
}
