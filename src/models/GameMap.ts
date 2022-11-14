import { MapMeta, MapMetaLayer, Point, Point3D } from '@/types';
import {
  addVector,
  cartesianToIsometric,
  diamond,
  divVector,
  floorVector,
  mulVector,
  subVector
} from '@/utils';
import { TileSet } from './TileSet';

export type GameMapOptions = {
  ctx: CanvasRenderingContext2D;
  meta: MapMeta;
  tileSet: TileSet;
  sceneOrigin: Point;
};

export class GameMap {
  private ctx!: CanvasRenderingContext2D;
  private meta!: MapMeta;
  private tileSet!: TileSet;
  private sceneOrigin!: Point;
  private highlightedCell: Point3D = { x: -1, y: -1, z: -1 };

  constructor(options: GameMapOptions) {
    Object.assign(this, options);
  }

  private get size(): Point {
    return {
      x: this.meta.tilewidth,
      y: this.meta.tileheight
    };
  }

  private get halfSize(): Point {
    return divVector(this.size, 2);
  }

  get mapOffset() {
    return {
      x: -this.meta.tilewidth / 2,
      y: 0
    };
  }

  private getLayerOffset(layer: MapMetaLayer, debug?: boolean): Point {
    return addVector(
      { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 },
      debug ? { x: 0, y: 0 } : this.mapOffset
    );
  }

  private getCellCoords(layer: MapMetaLayer, index: number): Point {
    return {
      x: index % layer.width,
      y: Math.floor(index / layer.height)
    };
  }

  private toIsometric({ x, y }: Point) {
    return mulVector(cartesianToIsometric({ x, y }), this.halfSize);
  }

  private toCartesian({ x, y }: Point) {
    return divVector(
      {
        x: x / this.halfSize.x + y / this.halfSize.y,
        y: y / this.halfSize.y - x / this.halfSize.x
      },
      2
    );
  }

  isHighlighted(layerIndex: number, index: number) {
    return (
      layerIndex == this.highlightedCell.z &&
      index ===
        this.highlightedCell.y * this.meta.layers[layerIndex].width +
          this.highlightedCell.x
    );
  }

  drawDebug() {
    this.meta.layers.forEach((layer, layerIndex) => {
      if (layerIndex > 0) return;
      layer.data.forEach((cell, index) => {
        const isHighlighted = this.isHighlighted(layerIndex, index);
        const { w, h } = this.tileSet.getTileCoords(cell);
        const point = this.getCellCoords(layer, index);
        const { x, y } = addVector(
          this.toIsometric(point),
          this.getLayerOffset(layer, true)
        );

        diamond(this.ctx, {
          x,
          y: y + this.meta.tileheight,
          w: this.meta.tilewidth,
          h: this.meta.tileheight
        });
        this.ctx.strokeStyle = 'blue';
        this.ctx.stroke();
        diamond(this.ctx, {
          x,
          y: y,
          w: this.meta.tilewidth,
          h: this.meta.tileheight
        });
        this.ctx.stroke();
        this.ctx.fillStyle = 'white';

        this.ctx.strokeStyle = 'red';
        this.ctx.strokeRect(x - this.meta.tilewidth / 2, y, w, h);

        if (isHighlighted) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
          this.ctx.fillRect(x - this.meta.tilewidth / 2, y, w, h);
        }

        this.ctx.textBaseline = 'top';
        this.ctx.font = '12px Helvetica';
        this.ctx.fillText(`${point.x} : ${point.y}`, x - this.halfSize.x, y);
      });
    });
  }

  draw() {
    this.ctx.save();
    // this.ctx.globalAlpha = 0.5;

    this.meta.layers.forEach((layer, layerIndex) => {
      layer.data.forEach((cell, index) => {
        this.ctx.save();
        const isHighlighted = this.isHighlighted(layerIndex, index);
        const point = this.getCellCoords(layer, index);
        const isoCoords = addVector(
          this.toIsometric(point),
          this.getLayerOffset(layer)
        );

        if (isHighlighted) {
          this.ctx.filter = 'hue-rotate(180DEG) brightness(200%)';
        }

        this.tileSet.draw({
          tile: cell,
          ctx: this.ctx,
          coords: isoCoords
        });
        this.ctx.restore();
      });
    });
    this.ctx.restore();
  }

  updateHighlightedCellByMousePosition(mousePosition: Point) {
    const isoCoords = floorVector(
      divVector(
        subVector(mousePosition, this.sceneOrigin),
        // scale
        1
      )
    );
    const cellCoords = floorVector(this.toCartesian(isoCoords));

    this.highlightedCell = this.meta.layers.reduce(
      (acc, layer, i) => {
        const pos = addVector(cellCoords, {
          x: i,
          y: i
        });
        const isOutOfBounds =
          pos.x < 0 ||
          pos.x > layer.width - 1 ||
          pos.y < 0 ||
          pos.y > layer.height - 1;

        if (isOutOfBounds) return acc;

        const cellIndex = pos.y * layer.width + pos.x;
        const cellAtLayer = layer.data[cellIndex];

        return cellAtLayer ? { ...pos, z: i } : acc;
      },
      { x: -1, y: -1, z: -1 }
    );
  }
}
