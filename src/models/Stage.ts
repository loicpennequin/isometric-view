import { StageLayerType } from '@/enums';
import { Camera } from '@/models/Camera';
import { TileMeta, TileSet } from '@/models/TileSet';
import { StageMeta, StageLayerMeta, Point, Point3D, Rectangle } from '@/types';
import {
  addVector,
  cartesianToIsometric,
  createMatrix,
  divVector,
  mulVector,
  rotateMatrix
} from '@/utils';

export type CreateStageOptions = {
  ctx: CanvasRenderingContext2D;
  meta: StageMeta;
  tileSet: TileSet;
  camera: Camera;
};

export type CellInfos = Rectangle & {
  point: Point3D;
  originalPoint: Point3D;
  tile: number;
  tileMeta: TileMeta;
};

export type StageOptions = {
  meta: StageMeta;
  tileSet: TileSet;
  camera: Camera;
};

export class Stage {
  private meta!: StageMeta;

  private camera!: Camera;

  tileSet!: TileSet;

  constructor(opts: StageOptions) {
    Object.assign(this, opts);
  }

  private get size(): Point {
    return { x: this.meta.tilewidth, y: this.meta.tileheight };
  }

  private get halfSize(): Point {
    return divVector(this.size, 2);
  }

  private get stageOffset(): Point {
    return { x: this.meta.tilewidth / 2, y: 0 };
  }

  private get tileLayers() {
    return this.meta.layers.filter(
      layer => layer.type === StageLayerType.TILES
    );
  }

  private getLayerOffset(layer: StageLayerMeta): Point {
    return addVector(
      { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 },
      this.stageOffset
    );
  }

  private rotateLayer(layerIndex: number) {
    const layer = this.tileLayers[layerIndex];

    const matrix = createMatrix(
      { w: this.meta.width, h: this.meta.height },
      ({ x, y }) => {
        const tile = layer.data[x * this.meta.height + y];

        return {
          tile,
          tileMeta: this.tileSet.tileMeta[tile],
          originalPoint: {
            x: y,
            y: x % this.meta.height,
            z: layerIndex
          }
        };
      }
    );

    return rotateMatrix<{
      originalPoint: Point3D;
      tileMeta: TileMeta;
      tile: number;
    }>(matrix, this.camera.view.angle);
  }

  private toIsometric({ x, y }: Point) {
    return mulVector(cartesianToIsometric({ x, y }), this.halfSize);
  }

  private isWithinBounds({ x, y, z }: Point3D) {
    const layer = this.tileLayers[z];

    return layer && x >= 0 && y >= 0 && x < layer.width && y < layer.height;
  }

  private getRotatedPoint(point: Point3D) {
    const layer = this.tileLayers[point.z];

    const rotatedMatrix = rotateMatrix<Point>(
      createMatrix({ w: layer.width, h: layer.height }, coords => coords),
      this.camera.view.angle
    );

    const rotatedPoint = { x: 0, y: 0, z: point.z };
    rotatedMatrix.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col.x === point.y && col.y === point.x) {
          Object.assign(rotatedPoint, { x: colIndex, y: rowIndex });
        }
      });
    });

    return rotatedPoint;
  }

  draw(ctx: CanvasRenderingContext2D, cb: (cell: CellInfos) => void) {
    this.tileLayers.forEach((layer, layerIndex) => {
      const cells = this.rotateLayer(layerIndex);
      cells.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          const point = { x: cellIndex, y: rowIndex, z: layerIndex };
          const { w, h } = this.tileSet.getTileCoords(cell.tile);

          const { x, y } = addVector(
            this.toIsometric(point),
            this.getLayerOffset(layer)
          );

          ctx.save();
          this.tileSet.draw(ctx, {
            tile: cell.tile,
            coords: { x, y },
            angle: this.camera.view.angle
          });
          ctx.restore();

          cb({ ...cell, x, y, w, h, point });
        });
      });
    });
  }

  getCellInfoByPoint3D(point: Point3D) {
    if (!this.isWithinBounds(point)) {
      return null;
    }

    const rotatedPoint = this.getRotatedPoint(point);
    const layer = this.tileLayers[rotatedPoint.z];
    const layerData = this.rotateLayer(point.z);
    const { originalPoint, tile } = layerData[point.y][point.x];
    const { w, h } = this.tileSet.getTileCoords(tile);
    const { x, y } = addVector(
      this.toIsometric(rotatedPoint),
      this.getLayerOffset(layer)
    );
    const tileMeta = this.tileSet.tileMeta[tile] ?? {};

    return { tile, tileMeta, originalPoint, point, x, y, w, h };
  }
}
