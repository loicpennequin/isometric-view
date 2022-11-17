import { withMovement } from '@/mixins/withMovement';
import { mixinBuilder } from '@/utils';
import { Sprite } from './Sprite';

const mixins = mixinBuilder(Sprite).add(withMovement);

export class Unit extends mixins.build() {}
