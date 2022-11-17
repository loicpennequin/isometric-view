import { withImageLoader } from '@/mixins/withImageLoader';
import { AnyRecord, Point, Rectangle, TileSetMeta } from '@/types';
import { mixinBuilder } from '@/utils';

export type TileSetOptions = {
  src: string;
  meta: TileSetMeta;
};

export type TileMeta = Record<number, AnyRecord>;

class TileSetBase {
  meta!: TileSetMeta;
  src!: string;

  constructor(opts: TileSetOptions) {
    Object.assign(this, opts);
  }
}

const mixins = mixinBuilder(TileSetBase).add(withImageLoader);

export class TileSet extends mixins.build() {
  tileMeta!: Readonly<TileMeta>;

  constructor(...args: any[]) {
    // @ts-ignore
    super(...args);
    this.buildTileMeta();
    this.load(this.src);
  }

  private buildTileMeta() {
    const entries = this.meta.tiles.map(tile => [
      tile.id + 1, // map JSON files add one to its layer data
      tile.properties
        ? Object.fromEntries(
            tile.properties.map(prop => [prop.name, prop.value])
          )
        : {}
    ]);

    this.tileMeta = Object.freeze(Object.fromEntries(entries));
  }

  getTileCoords = (n: number): Rectangle => {
    return {
      x: ((n - 1) % this.meta.columns) * this.meta.tilewidth,
      y: Math.floor(n / this.meta.columns) * this.meta.tileheight,
      w: this.meta.tilewidth,
      h: this.meta.tileheight
    };
  };

  draw = (
    ctx: CanvasRenderingContext2D,
    { tile, coords, angle }: { tile: number; coords: Point; angle: number }
  ) => {
    const tileAtAngle = this.tileMeta[tile]?.[angle % 360];
    const tileCoords = this.getTileCoords(tileAtAngle ? tileAtAngle + 1 : tile);

    ctx.drawImage(
      this.img,
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
}
