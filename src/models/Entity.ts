import { EntityOrientation, EntityState } from '@/enums';
import { Stage } from './Stage';
import { Point3D, Spritesheet } from '@/types';
import { EmptyClass, mixinBuilder } from '@/utils';
import { withEmitter } from '@/mixins/withEmitter';
import { Camera } from './Camera';

export type CreateEntityOptions = {
  stage: Stage;
  position: Point3D;
  spriteSheet: Spritesheet;
  camera: Camera;
};

const mixins = mixinBuilder(EmptyClass).add(withEmitter);
export class Entity extends mixins.build() {
  protected stage!: Stage;

  protected state: EntityState = EntityState.IDLE;

  camera!: Camera;

  position!: Point3D;

  spriteSheet!: Spritesheet;

  orientation: EntityOrientation = EntityOrientation.RIGHT;

  constructor(opts: CreateEntityOptions) {
    super();
    Object.assign(this, opts);
  }

  transitionTo(state: EntityState) {
    this.state = state;
    this.emitter.emit(state);
  }
}
