import { MapMeta, MapMetaLayer, Point } from '@/types';
import { addVector, cartesianToIsometric, mulVector } from '@/utils';
import { TileSet } from './TileSet';

export type GameMapOptions = {
  ctx: CanvasRenderingContext2D;
  meta: MapMeta;
  tileSet: TileSet;
};

export class GameMap {
  ctx!: CanvasRenderingContext2D;
  meta!: MapMeta;
  tileSet!: TileSet;

  constructor(options: GameMapOptions) {
    Object.assign(this, options);
  }

  private get size(): Point {
    return {
      x: this.meta.tileheight,
      y: this.meta.tileheight
    };
  }

  private getLayerOffset(layer: MapMetaLayer): Point {
    return { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 };
  }

  private drawCell(cell: number, index: number, layer: MapMetaLayer) {
    this.tileSet.draw({
      tile: cell,
      ctx: this.ctx,
      coords: addVector(
        cartesianToIsometric(
          mulVector(
            {
              x: index % layer.width,
              y: Math.floor(index / layer.height)
            },
            this.size
          )
        ),
        this.getLayerOffset(layer)
      )
    });
  }

  draw() {
    this.meta.layers.forEach(layer => {
      layer.data.forEach((cell, index) => this.drawCell(cell, index, layer));
    });
  }

  getCellCoordsAtMousePosition() {}
}
