import { withMovement } from '@/mixins/withMovement';
import { withSprite } from '@/mixins/withSprite';
import { mixinBuilder } from '@/utils';
import { Entity } from './Entity';

const mixins = mixinBuilder(Entity).add(withSprite).add(withMovement);

export class Unit extends mixins.build() {}
