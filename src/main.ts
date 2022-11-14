import './style.css';
import tilesetUrl from './assets/tilesets/base.png';
import tilesetJSON from './assets/tilesets/tileset.json';
import mapJSON from './assets/maps/map1.json';
import { createCanvas } from './factories/createCanvas';
import { createMouseTracker } from './factories/createMouseTracker';
import { createTileSet } from './factories/createTileSet';
import { createStage } from './factories/createStage';
import { createCamera } from './factories/createCamera';
import { createControls } from './factories/createControls';

const { canvas, ctx } = createCanvas({
  w: window.innerWidth,
  h: window.innerHeight
});
const tileset = createTileSet({ src: tilesetUrl, meta: tilesetJSON, ctx });
const camera = createCamera({
  x: window.innerWidth / 2,
  y: 250
});
const mousePosition = createMouseTracker(canvas);
const map = createStage({
  ctx,
  camera,
  meta: mapJSON,
  tileSet: tileset
});

function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  // ctx.translate(camera.view.x, camera.view.y);

  camera.apply(ctx);

  map.updateHighlightedCell(mousePosition);
  map.draw();
  ctx.restore();

  return requestAnimationFrame(draw);
}

document.getElementById('app')?.appendChild(canvas);

tileset.ready.then(() => {
  createControls({ canvas, camera, mousePosition });

  draw();
});
