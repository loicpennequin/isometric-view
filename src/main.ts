import './style.css';
import tilesetUrl from './assets/tilesets/tileset.png';
import tilesetJSON from './assets/tilesets/tileset.json';
import mapJSON from './assets/maps/map1.json';
import { TileSet } from './models/TileSet';
import { createCanvas } from './factories/createCanvas';
import { GameMap } from './models/GameMap';
import { createMouseTracker } from './factories/createMouseTracker';

const tileset = new TileSet(tilesetJSON);
const { canvas, ctx } = createCanvas({
  w: window.innerWidth,
  h: window.innerHeight
});
const sceneOrigin = {
  x: window.innerWidth / 2,
  y: 250
};
const map = new GameMap({ ctx, meta: mapJSON, tileSet: tileset, sceneOrigin });
const mousePosition = createMouseTracker(canvas);

function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(sceneOrigin.x, sceneOrigin.y);

  map.updateHighlightedCellByMousePosition(mousePosition);
  map.draw();
  // map.drawDebug();
  ctx.restore();

  return requestAnimationFrame(draw);
}

// document.addEventListener('click', () => {
//   map.updateHighlightedCellByMousePosition(mousePosition);
// });
document.getElementById('app')?.appendChild(canvas);
tileset.load(tilesetUrl).then(draw);
