import { AnyRecord, Point, Rectangle, TileSetMeta } from '@/types';

export type CreateTileSetOptions = {
  src: string;
  meta: TileSetMeta;
  ctx: CanvasRenderingContext2D;
};

export type TileSet = ReturnType<typeof createTileSet>;

type TileMeta = Record<number, AnyRecord>;

export const createTileSet = ({ src, meta, ctx }: CreateTileSetOptions) => {
  const img = Object.assign(new Image(), { src });
  const ready = new Promise(resolve => {
    img.addEventListener('load', resolve);
  });

  const tileMeta: TileMeta = Object.fromEntries(
    meta.tiles.map(tile => {
      return [
        tile.id + 1, // map JSON files add one to its layer data
        tile.properties
          ? Object.fromEntries(
              tile.properties.map(prop => [prop.name, prop.value])
            )
          : {}
      ];
    })
  );

  const getTileCoords = (n: number): Rectangle => {
    return {
      x: ((n - 1) % meta.columns) * meta.tilewidth,
      y: Math.floor(n / meta.columns) * meta.tileheight,
      w: meta.tilewidth,
      h: meta.tileheight
    };
  };

  const draw = (tile: number, coords: Point, angle: number) => {
    const tileAtAngle = tileMeta[tile]?.[angle % 360];
    const tileCoords = getTileCoords(tileAtAngle ? tileAtAngle + 1 : tile);

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
