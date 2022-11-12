import "./style.css";
import { Point } from "./types";
import {
  cartesianToIsometric,
  clamp,
  createMatrix,
  deg2rad,
  matrixForEach,
} from "./utils";
import tileSrc from "./assets/tiles/base.png";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.getElementById("app")?.appendChild(canvas);

const SPRITE_SIZE = 64;
const CELL_SIZE = SPRITE_SIZE / 2;
const GRID_SIZE = 25;

const assets = {
  tile: Object.assign(new Image(), {
    src: tileSrc,
  }),
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sceneOrigin = {
  x: window.innerWidth / 2,
  y: 100,
};

const grid = createMatrix<Point>(
  { w: GRID_SIZE, h: GRID_SIZE },
  ({ x, y }) => ({ x, y })
);

let scale = 1;

window.addEventListener(
  "wheel",
  (e) => {
    scale = clamp(scale + (e.deltaY > 0 ? 0.05 : -0.05), {
      min: 0.25,
      max: 1.5,
    });
  },
  false
);

function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(sceneOrigin.x, sceneOrigin.y);
  ctx.scale(scale, scale);

  matrixForEach(grid, (point) => {
    const iso = cartesianToIsometric({
      x: point.x * CELL_SIZE,
      y: point.y * CELL_SIZE,
    });

    const offset = { x: CELL_SIZE / 2, y: CELL_SIZE };
    ctx.drawImage(assets.tile, iso.x - offset.x, iso.y - offset.y);
  });

  matrixForEach(grid, (point) => {
    const iso = cartesianToIsometric({
      x: point.x * CELL_SIZE,
      y: point.y * CELL_SIZE,
    });
    ctx.strokeStyle = "red";
    ctx.strokeRect(iso.x, iso.y, CELL_SIZE, CELL_SIZE);
  });

  ctx.restore();
  return requestAnimationFrame(draw);
}

assets.tile.addEventListener("load", draw);
