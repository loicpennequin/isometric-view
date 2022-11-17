import './style.css';
import tilesetUrl from './assets/tilesets/base.png';
import tilesetJSON from './assets/tilesets/tileset.json';
import warriorUrl from './assets/units/warrior.png';
import warriorJson from './assets/units/warrior.json';
import mapJSON from './assets/maps/test-map.json';
import { createCanvas } from './factories/createCanvas';
import { createMouseTracker } from './factories/createMouseTracker';
import { Point3D, StageMeta } from './types';
import { addVector3D, vectorEquals3D } from './utils';
import { Unit } from './models/Unit';
import { TileSet } from './models/TileSet';
import { Camera } from './models/Camera';
import { PlayerControls } from './models/PlayerControls';
import { Stage } from './models/Stage';

const { canvas, ctx } = createCanvas({
  w: window.innerWidth,
  h: window.innerHeight
});
const tileset = new TileSet({ src: tilesetUrl, meta: tilesetJSON });
const camera = new Camera({
  x: window.innerWidth / 2,
  y: 250,
  scale: 1.25,
  angle: 0
});
const mousePosition = createMouseTracker(canvas);
const stage = new Stage({
  camera,
  meta: mapJSON as StageMeta,
  tileSet: tileset
});

const player = new Unit({
  position: { x: 15, y: 16, z: 0 },
  stage,
  camera,
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

  stage.draw(ctx, cell => {
    const shouldDraw = (pos: Point3D) =>
      vectorEquals3D(
        addVector3D(pos, { x: 0, y: 0, z: 1 }),
        cell.originalPoint
      );

    if (shouldDraw(player.position) || shouldDraw(player.prevPosition)) {
      player.draw(ctx);
    }
  });
  ctx.restore();

  return requestAnimationFrame(draw);
}

document.getElementById('app')?.appendChild(canvas);

Promise.all([player.ready, tileset.ready]).then(() => {
  new PlayerControls({ canvas, camera, mousePosition, player })
    .enableCamera()
    .enablePlayerMovement();

  player.animate();

  draw();
});
