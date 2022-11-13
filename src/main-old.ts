// import './style.css';
// import { Point } from './types';
// import {
//   addVector,
//   cartesianToIsometric,
//   clamp,
//   divVector,
//   isometricToCartesian,
//   matrixForEach,
//   floorVector,
//   subVector,
//   mulVector,
//   pointRectCollision,
//   vectorEquals,
//   circle,
//   clampVector
// } from './utils';
// import tilesetUrl from './assets/tiles/tileset.png';
// import tileset from './assets/tilesets/tileset.json';
// import map from './assets/maps/map1.json';
// const tilessetSprite = Object.assign(new Image(), { src: tilesetUrl });
// tilessetSprite.addEventListener('load', draw);

// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d');
// document.getElementById('app')?.appendChild(canvas);
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// const SPRITE_SIZE = 128;
// const CELL_SIZE = SPRITE_SIZE / 2;
// const CELL_OFFSET = { x: -CELL_SIZE / 2, y: 0 };

// let scale = 1;
// canvas.addEventListener(
//   'wheel',
//   e => {
//     scale = clamp(scale + (e.deltaY > 0 ? 0.05 : -0.05), {
//       min: 0.25,
//       max: 1.5
//     });
//   },
//   false
// );

// let selectedCell: Point = { x: -1, y: -1 };

// canvas.addEventListener('mousemove', e => {
//   const { top, left } = canvas.getBoundingClientRect();
//   const mousePosition = subVector(
//     {
//       x: e.clientX - left,
//       y: e.clientY - top
//     },
//     sceneOrigin
//   );

//   const iso = divVector(mousePosition, scale);
//   const cart = isometricToCartesian(iso);

//   const cellIndex = floorVector(divVector(cart, CELL_SIZE));
//   for (let x = cellIndex.x, y = cellIndex.y; y < map.length; x++, y++) {
//     const cell = map[y]?.[x];
//     if (!cell) {
//       continue;
//     }

//     const height = (cell.length - 1) * CELL_SIZE;
//     const cellCoords = cartesianToIsometric(mulVector({ x, y }, CELL_SIZE));
//     const rect = {
//       x: cellCoords.x,
//       y: cellCoords.y - height,
//       w: CELL_SIZE,
//       h: CELL_SIZE
//     };
//     const isMouseOnCell = pointRectCollision(iso, rect);

//     if (isMouseOnCell) {
//       selectedCell = { x, y };
//     }
//   }
//   // console.log(selectedCell);
// });

// canvas.addEventListener(
//   'wheel',
//   e => {
//     scale = clamp(scale + (e.deltaY > 0 ? 0.05 : -0.05), {
//       min: 0.25,
//       max: 1.5
//     });
//   },
//   false
// );

// const sceneOrigin = {
//   x: window.innerWidth / 2,
//   y: 250
// };

// let player = {
//   x: 0,
//   y: 0
// };

// let controls = {
//   x: 0,
//   y: 0
// };

// const handleKeyboard = (e: KeyboardEvent) => {
//   switch (e.code) {
//     case 'ArrowUp':
//       controls.x--;
//       controls.y--;
//       break;
//     case 'ArrowDown':
//       controls.x++;
//       controls.y++;
//       break;
//     case 'ArrowLeft':
//       controls.x--;
//       controls.y++;
//       break;
//     case 'ArrowRight':
//       controls.y--;
//       controls.x++;
//       break;
//   }

//   controls = clampVector(controls, {
//     min: { x: -1, y: -1 },
//     max: { x: 1, y: 1 }
//   });
// };
// document.addEventListener('keydown', handleKeyboard);
// document.addEventListener('keyup', e => {
//   console.log('========');
//   console.log(player);
//   player = addVector(player, controls);
//   console.log(player);
//   controls = { x: 0, y: 0 };
// });

// function draw() {
//   if (!ctx) return;

//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//   ctx.save();
//   ctx.translate(sceneOrigin.x, sceneOrigin.y);
//   ctx.scale(scale, scale);

//   matrixForEach(map, (cell, { x, y }) => {
//     const iso = addVector(
//       cartesianToIsometric({
//         x: x * CELL_SIZE,
//         y: y * CELL_SIZE
//       }),
//       CELL_OFFSET
//     );

//     ctx.save();
//     if (x === selectedCell.x && y === selectedCell.y) {
//       ctx.filter = 'hue-rotate(100DEG)';
//     }
//     cell.forEach((layer, i) => {
//       ctx.drawImage(
//         layer,
//         iso.x,
//         iso.y - i * CELL_SIZE,
//         CELL_SIZE * 2,
//         CELL_SIZE * 2
//       );
//     });

//     if (vectorEquals({ x, y }, player)) {
//       circle(ctx, {
//         x: iso.x + CELL_SIZE,
//         y: iso.y - (cell.length - 1) * CELL_SIZE,
//         r: 32
//       });
//       ctx.fillStyle = 'red';
//       ctx.fill();
//     }
//     ctx.restore();
//   });

//   if (import.meta.env.VITE_DEBUG) {
//     matrixForEach(map, (_, { x, y }) => {
//       const iso = cartesianToIsometric({
//         x: x * CELL_SIZE,
//         y: y * CELL_SIZE
//       });

//       ctx.strokeStyle = 'white';
//       ctx.lineWidth = 2;
//       ctx.fillStyle = 'rgba(0,0,255,0.2)';
//       ctx.textBaseline = 'top';
//       ctx.strokeRect(iso.x, iso.y, CELL_SIZE, CELL_SIZE);
//       if (x === selectedCell.x && y === selectedCell.y) {
//         ctx.fillRect(iso.x, iso.y, CELL_SIZE, CELL_SIZE);
//       }

//       ctx.fillStyle = 'rgba(0,0,0,0.6)';
//       ctx.beginPath();
//       ctx.fillRect(iso.x, iso.y, CELL_SIZE, 30);
//       ctx.closePath();
//       ctx.fillStyle = 'white';
//       ctx.font = '14px Helvetica';
//       ctx.fillText(
//         `${Math.round(iso.x * scale)} : ${Math.round(iso.y * scale)}`,
//         iso.x,
//         iso.y
//       );
//       ctx.fillText(`${x} : ${y}`, iso.x, iso.y + 15);
//     });
//   }

//   ctx.restore();
//   return requestAnimationFrame(draw);
// }
