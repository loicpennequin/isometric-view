import { Point, Rectangle, TileSetMeta } from '@/types';

export type CreateTileSetOptions = {
  src: string;
  meta: TileSetMeta;
  ctx: CanvasRenderingContext2D;
};

export type TileSet = ReturnType<typeof createTileSet>;

export const createTileSet = ({ src, meta, ctx }: CreateTileSetOptions) => {
  const img = Object.assign(new Image(), { src });
  const ready = new Promise(resolve => {
    img.addEventListener('load', resolve);
  });

  const getTileCoords = (n: number): Rectangle => {
    return {
      x: ((n - 1) % meta.columns) * meta.tilewidth,
      y: Math.floor(n / meta.columns) * meta.tileheight,
      w: meta.tilewidth,
      h: meta.tileheight
    };
  };

  const draw = (tile: number, coords: Point) => {
    const tileCoords = getTileCoords(tile);
    ctx.drawImage(
      img,
      tileCoords.x,
      tileCoords.y,
      tileCoords.w,
      tileCoords.h,
      coords.x,
      coords.y,
      tileCoords.w,
      tileCoords.h
    );
  };

  return {
    ready,
    getTileCoords,
    draw
  };
};
