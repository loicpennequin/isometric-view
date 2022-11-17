import { StageLayerType } from '@/enums';
import { Camera } from '@/models/Camera';
import { TileSet } from '@/models/TileSet';
import { StageMeta, StageLayerMeta, Point, Point3D, Rectangle } from '@/types';
import {
  addVector,
  cartesianToIsometric,
  createMatrix,
  diamond,
  divVector,
  floorVector,
  memoize,
  mulVector,
  rotateMatrix,
  subVector
} from '@/utils';

export type CreateStageOptions = {
  ctx: CanvasRenderingContext2D;
  meta: StageMeta;
  tileSet: TileSet;
  camera: Camera;
};

export type CellInfos = Rectangle & {
  isHighlighted: boolean;
  point: Point3D;
  originalPoint: Point3D;
  tile: number;
};

type DrawLayersOptions = {
  drawCell: (opts: CellInfos) => void;
  debug?: boolean;
};

type DepthSortedCell = {
  point: Point3D;
  originalPoint: Point3D;
  tile: number;
};

export type StageOptions = {
  meta: StageMeta;
  tileSet: TileSet;
  camera: Camera;
};

export class Stage {
  private meta!: StageMeta;

  private camera!: Camera;

  private highlightedCell: Point3D = { x: -1, y: -1, z: -1 };

  tileSet!: TileSet;

  constructor(opts: StageOptions) {
    Object.assign(this, opts);
    this.getDepthSortedData = memoize(this.getDepthSortedData.bind(this));
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

  private getLayerOffset(layer: StageLayerMeta, debug?: boolean): Point {
    return addVector(
      { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 },
      debug ? { x: 0, y: 0 } : this.stageOffset
    );
  }

  private getLayerData(layer: StageLayerMeta) {
    const matrix = createMatrix(
      { w: this.meta.width, h: this.meta.height },
      ({ x, y }) => layer.data[x * this.meta.height + y]
    );

    return rotateMatrix<number>(matrix, this.camera.view.angle).flat();
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

  private isCellHighlighted(layerIndex: number, index: number) {
    return (
      layerIndex == this.highlightedCell.z &&
      index ===
        this.highlightedCell.y * this.tileLayers[layerIndex].width +
          this.highlightedCell.x
    );
  }

  private getRotatedLayers(angle: number) {
    return this.tileLayers.map((layer, index) => {
      const matrix = createMatrix(
        { w: this.meta.width, h: this.meta.height },
        ({ x, y }) => ({
          tile: layer.data[x * this.meta.height + y],
          originalPoint: {
            x: y,
            y: x % this.meta.height,
            z: index
          }
        })
      );

      return rotateMatrix<{ originalPoint: Point3D; tile: number }>(
        matrix,
        angle
      ).flat();
    });
  }

  private getDepthSortedData(angle: number) {
    const rotatedLayers = this.getRotatedLayers(angle);
    const sorted: DepthSortedCell[] = [];

    rotatedLayers.forEach((layer, layerIndex) => {
      layer.forEach(({ tile, originalPoint }, cellIndex) => {
        const i = cellIndex * rotatedLayers.length + layerIndex;

        const point = {
          x: cellIndex % this.meta.width,
          y: Math.floor(cellIndex / this.meta.height),
          z: layerIndex
        };
        sorted[i] = {
          tile,
          point,
          originalPoint
        };
      });
    });

    return sorted;
  }

  private drawLayers({ drawCell, debug = false }: DrawLayersOptions) {
    this.getDepthSortedData(this.camera.view.angle).forEach(
      ({ originalPoint, point, tile }, index) => {
        const z = index % this.tileLayers.length;
        if (debug && z > 0) return;
        const layer = this.tileLayers[z];
        const layerCellIndex = Math.floor(index / this.tileLayers.length);
        const isHighlighted = this.isCellHighlighted(z, layerCellIndex);
        const { w, h } = this.tileSet.getTileCoords(tile);

        const { x, y } = addVector(
          this.toIsometric(point),
          this.getLayerOffset(layer, debug)
        );

        drawCell({ tile, isHighlighted, point, originalPoint, x, y, w, h });
      }
    );
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

  private isWithinBounds({ x, y, z }: Point3D) {
    const layer = this.tileLayers[z];

    return layer && x >= 0 && y >= 0 && x < layer.width && y < layer.height;
  }

  getCellInfoByPoint3D(point: Point3D) {
    if (!this.isWithinBounds(point)) {
      return null;
    }

    const rotatedPoint = this.getRotatedPoint(point);
    const layer = this.tileLayers[rotatedPoint.z];
    const layerData = this.getLayerData(layer);
    const index = rotatedPoint.y * layer.width + rotatedPoint.x;
    const tile = layerData[index];
    const isHighlighted = this.isCellHighlighted(rotatedPoint.z, index);
    const { w, h } = this.tileSet.getTileCoords(tile);
    const { x, y } = addVector(
      this.toIsometric(rotatedPoint),
      this.getLayerOffset(layer)
    );
    const tileMeta = this.tileSet.tileMeta[tile] ?? {};

    return { tile, tileMeta, point, isHighlighted, x, y, w, h };
  }

  drawDebug(ctx: CanvasRenderingContext2D) {
    this.drawLayers({
      debug: true,
      drawCell: ({ point, x, y, w, h }) => {
        diamond(ctx, {
          x,
          y: y + this.meta.tileheight,
          w: this.meta.tilewidth,
          h: this.meta.tileheight
        });
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        diamond(ctx, {
          x,
          y: y,
          w: this.meta.tilewidth,
          h: this.meta.tileheight
        });
        ctx.stroke();
        ctx.fillStyle = 'white';

        ctx.strokeStyle = 'red';
        ctx.strokeRect(x - this.meta.tilewidth / 2, y, w, h);

        ctx.textBaseline = 'top';
        ctx.font = '12px Helvetica';
        ctx.fillText(`${point.x} : ${point.y}`, x - this.halfSize.x, y);
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D, cb: (cell: CellInfos) => void) {
    this.drawLayers({
      drawCell: cell => {
        const { tile, isHighlighted, x, y } = cell;
        ctx.save();
        if (isHighlighted) {
          ctx.filter = 'brightness(200%)';
          // ctx.fillStyle = 'rgba(255,255,255,0.5)';
          // ctx.fillRect(x, y, w, h);
        }
        this.tileSet.draw(ctx, {
          tile,
          coords: { x, y },
          angle: this.camera.view.angle
        });
        ctx.restore();
        cb(cell);
      }
    });
  }

  updateHighlightedCell(point: Point) {
    const isoCoords = floorVector(
      divVector(
        subVector(point, addVector(this.camera.view, this.stageOffset)),
        this.camera.view.scale
      )
    );
    const cellCoords = floorVector(this.toCartesian(isoCoords));

    this.highlightedCell = this.tileLayers.reduce(
      (acc, layer, i) => {
        // with an isometric view, a cell that is shifted by 1 in all 3 dimensions will appear on top visually
        // ie {x:0 , y: 0, z: 0} will appear behind {x:1, y: 1, z: 1} and so on
        // we wanto highlight the highest possible cell since it's the one hovered by the moue cursor
        const pos = addVector(cellCoords, {
          x: i,
          y: i
        });
        const isOutOfBounds = this.isWithinBounds({ ...point, z: i });
        if (isOutOfBounds) return acc;

        const cellIndex = pos.y * layer.width + pos.x;
        const cellAtLayer = this.getLayerData(layer)[cellIndex];
        const hasSpaceAbove = this.tileLayers[i + 1]
          ? this.getLayerData(this.tileLayers[i + 1])[cellIndex] === 0
          : true;

        return cellAtLayer && hasSpaceAbove ? { ...pos, z: i } : acc;
      },
      { x: -1, y: -1, z: -1 }
    );
  }
}
