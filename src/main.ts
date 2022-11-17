import './style.css';
import tilesetUrl from './assets/tilesets/base.png';
import tilesetJSON from './assets/tilesets/tileset.json';
import warriorUrl from './assets/units/warrior.png';
import warriorJson from './assets/units/warrior.json';
import mapJSON from './assets/maps/test-map.json';
import { createCanvas } from './factories/createCanvas';
import { createMouseTracker } from './factories/createMouseTracker';
import { createStage } from './factories/createStage';
import { createCamera } from './factories/createCamera';
import { createControls } from './factories/createControls';
import { StageMeta } from './types';
import { vectorEquals3D } from './utils';
import { Unit } from './models/Unit';
import { TileSet } from './models/TileSet';

const { canvas, ctx } = createCanvas({
  w: window.innerWidth,
  h: window.innerHeight
});
const tileset = new TileSet({ src: tilesetUrl, meta: tilesetJSON });
const camera = createCamera({
  x: window.innerWidth / 2,
  y: 250,
  angle: 0
});
const mousePosition = createMouseTracker(canvas);
const stage = createStage({
  ctx,
  camera,
  meta: mapJSON as StageMeta,
  tileSet: tileset
});

const player = new Unit({
  position: { x: 7, y: 10, z: 0 },
  stage,
  spriteSheet: {
    ...warriorJson,
    src: warriorUrl
  }
});

function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();

  camera.apply(ctx);

  stage.updateHighlightedCell(mousePosition);
  stage.draw(cell => {
    if (vectorEquals3D(player.position, cell.originalPoint)) {
      player.draw(ctx);
    }
  });
  // stage.drawDebug();
  ctx.restore();

  return requestAnimationFrame(draw);
}

document.getElementById('app')?.appendChild(canvas);

Promise.all([player.ready, tileset.ready]).then(() => {
  createControls({ canvas, camera, mousePosition, player });
  player.animate();

  draw();
});
