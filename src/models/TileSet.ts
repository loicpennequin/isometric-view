import { Point, Rectangle, TileSetMeta } from '@/types';

export class TileSet {
  private image = new Image();

  constructor(private meta: TileSetMeta) {}

  load(url: string) {
    return new Promise<void>(res => {
      this.image = Object.assign(new Image(), { src: url, onload: res });
    });
  }

  getTileCoords(n: number): Rectangle {
    return {
      x: ((n - 1) % this.meta.columns) * this.meta.tilewidth,
      y: Math.floor(n / this.meta.columns) * this.meta.tileheight,
      w: this.meta.tilewidth,
      h: this.meta.tileheight
    };
  }

  draw({
    tile,
    coords,
    ctx
  }: {
    tile: number;
    coords: Point;
    ctx: CanvasRenderingContext2D;
  }) {
    const tileCoords = this.getTileCoords(tile);
    ctx.drawImage(
      this.image,
      tileCoords.x,
      tileCoords.y,
      tileCoords.w,
      tileCoords.h,
      coords.x,
      coords.y,
      tileCoords.w,
      tileCoords.h
    );
  }
}
