import grass from './assets/tiles/grass.png';
import dirt from './assets/tiles/dirt.png';
import grassSlopeRight from './assets/tiles/grass-slope-right.png';
import grassSlopeLeft from './assets/tiles/grass-slope-left.png';

export const tiles = {
  grass: Object.assign(new Image(), { src: grass }),
  grassSlopeRight: Object.assign(new Image(), { src: grassSlopeRight }),
  grassSlopeLeft: Object.assign(new Image(), { src: grassSlopeLeft }),
  dirt: Object.assign(new Image(), { src: dirt })
};
