import './style.css';
import tilesetUrl from './assets/tilesets/tileset.png';
import tilesetJSON from './assets/tilesets/tileset.json';
import map from './assets/maps/map1.json';
import { addVector, cartesianToIsometric, mulVector } from './utils';
import { TileSet } from './models/TileSet';
import { createCanvas } from './factories/createCanvas';

const tileset = new TileSet(tilesetJSON);
tileset.load(tilesetUrl).then(draw);

const { canvas, ctx } = createCanvas({
  w: window.innerWidth,
  h: window.innerHeight
});
document.getElementById('app')?.appendChild(canvas);

const sceneOrigin = {
  x: window.innerWidth / 2,
  y: 250
};

function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.translate(sceneOrigin.x, sceneOrigin.y);

  map.layers.forEach(layer => {
    layer.data.forEach((cell, cellIndex) => {
      const pos = mulVector(
        {
          x: cellIndex % layer.width,
          y: Math.floor(cellIndex / layer.height)
        },
        { x: map.tileheight, y: map.tileheight }
      );
      const iso = addVector(
        cartesianToIsometric({
          x: pos.x,
          y: pos.y
        }),
        // CELL_OFFSET
        { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 }
      );

      tileset.draw({ tile: cell, ctx, coords: iso });
    });
  });

  // return requestAnimationFrame(draw);
}
