import base from './assets/tiles/base.png';
import baseSlopeL from './assets/tiles/base-slope-left.png';
import baseSlopeR from './assets/tiles/base-slope-right.png';
import grass from './assets/tiles/grass.png';
import dirt from './assets/tiles/dirt.png';
import grassSlopeR from './assets/tiles/grass-slope-right.png';
import grassSlopeL from './assets/tiles/grass-slope-left.png';

export const tiles = {
  base: Object.assign(new Image(), { src: base }),
  baseSlopeL: Object.assign(new Image(), { src: baseSlopeL }),
  baseSlopeR: Object.assign(new Image(), { src: baseSlopeR }),

  grass: Object.assign(new Image(), { src: grass }),
  grassSlopeR: Object.assign(new Image(), { src: grassSlopeR }),
  grassSlopeL: Object.assign(new Image(), { src: grassSlopeL }),

  dirt: Object.assign(new Image(), { src: dirt })
};
