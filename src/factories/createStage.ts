import { StageLayerType } from '@/enums';
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
import { Camera } from './createCamera';

export type CreateStageOptions = {
  ctx: CanvasRenderingContext2D;
  meta: StageMeta;
  tileSet: TileSet;
  camera: Camera;
};

export type Stage = ReturnType<typeof createStage>;

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

export const createStage = ({
  ctx,
  meta,
  tileSet,
  camera
}: CreateStageOptions) => {
  let highlightedCell: Point3D = { x: -1, y: -1, z: -1 };
  const size: Point = { x: meta.tilewidth, y: meta.tileheight };
  const halfSize: Point = divVector(size, 2);
  const stageOffset: Point = { x: meta.tilewidth / 2, y: 0 };

  const tileLayers = meta.layers.filter(
    layer => layer.type === StageLayerType.TILES
  );

  const getLayerOffset = (layer: StageLayerMeta, debug?: boolean): Point =>
    addVector(
      { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 },
      debug ? { x: 0, y: 0 } : stageOffset
    );

  const getLayerData = (layer: StageLayerMeta) => {
    const matrix = createMatrix(
      { w: meta.width, h: meta.height },
      ({ x, y }) => layer.data[x * meta.height + y]
    );

    return rotateMatrix<number>(matrix, camera.view.angle).flat();
  };

  const toIsometric = ({ x, y }: Point) =>
    mulVector(cartesianToIsometric({ x, y }), halfSize);

  const toCartesian = ({ x, y }: Point) =>
    divVector(
      {
        x: x / halfSize.x + y / halfSize.y,
        y: y / halfSize.y - x / halfSize.x
      },
      2
    );

  const isCellHighlighted = (layerIndex: number, index: number) =>
    layerIndex == highlightedCell.z &&
    index ===
      highlightedCell.y * tileLayers[layerIndex].width + highlightedCell.x;

  const getRotatedLayers = (angle: number) => {
    return tileLayers.map((layer, index) => {
      const matrix = createMatrix(
        { w: meta.width, h: meta.height },
        ({ x, y }) => ({
          tile: layer.data[x * meta.height + y],
          originalPoint: {
            x: y,
            y: x % meta.height,
            z: index
          }
        })
      );

      return rotateMatrix<{ originalPoint: Point3D; tile: number }>(
        matrix,
        angle
      ).flat();
    });
  };

  const getDepthSortedData = memoize((angle: number) => {
    const rotatedLayers = getRotatedLayers(angle);
    const sorted: DepthSortedCell[] = [];

    rotatedLayers.forEach((layer, layerIndex) => {
      layer.forEach(({ tile, originalPoint }, cellIndex) => {
        const i = cellIndex * rotatedLayers.length + layerIndex;

        const point = {
          x: cellIndex % meta.width,
          y: Math.floor(cellIndex / meta.height),
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
  });

  const drawLayers = ({ drawCell, debug = false }: DrawLayersOptions) => {
    getDepthSortedData(camera.view.angle).forEach(
      ({ originalPoint, point, tile }, index) => {
        const z = index % tileLayers.length;
        if (debug && z > 0) return;
        const layer = tileLayers[z];
        const layerCellIndex = Math.floor(index / tileLayers.length);
        const isHighlighted = isCellHighlighted(z, layerCellIndex);
        const { w, h } = tileSet.getTileCoords(tile);

        const { x, y } = addVector(
          toIsometric(point),
          getLayerOffset(layer, debug)
        );

        drawCell({ tile, isHighlighted, point, originalPoint, x, y, w, h });
      }
    );
  };

  const drawDebug = () => {
    drawLayers({
      debug: true,
      drawCell({ point, x, y, w, h }) {
        diamond(ctx, {
          x,
          y: y + meta.tileheight,
          w: meta.tilewidth,
          h: meta.tileheight
        });
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        diamond(ctx, {
          x,
          y: y,
          w: meta.tilewidth,
          h: meta.tileheight
        });
        ctx.stroke();
        ctx.fillStyle = 'white';

        ctx.strokeStyle = 'red';
        ctx.strokeRect(x - meta.tilewidth / 2, y, w, h);

        ctx.textBaseline = 'top';
        ctx.font = '12px Helvetica';
        ctx.fillText(`${point.x} : ${point.y}`, x - halfSize.x, y);
      }
    });
  };

  const draw = (cb: (cell: CellInfos) => void) => {
    drawLayers({
      drawCell(cell) {
        const { tile, isHighlighted, x, y } = cell;
        ctx.save();
        if (isHighlighted) {
          ctx.filter = 'brightness(200%)';
          // ctx.fillStyle = 'rgba(255,255,255,0.5)';
          // ctx.fillRect(x, y, w, h);
        }
        tileSet.draw(ctx, { tile, coords: { x, y }, angle: camera.view.angle });
        ctx.restore();
        cb(cell);
      }
    });
  };

  const getRotatedPoint = (point: Point3D) => {
    const layer = tileLayers[point.z];

    const rotatedMatrix = rotateMatrix<Point>(
      createMatrix({ w: layer.width, h: layer.height }, coords => coords),
      camera.view.angle
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
  };

  const isWithinBounds = ({ x, y, z }: Point3D) => {
    const layer = tileLayers[z];
    return layer && x >= 0 && y >= 0 && x < layer.width && y < layer.height;
  };

  const getCellInfoByPoint3D = (point: Point3D) => {
    if (!isWithinBounds(point)) {
      return null;
    }

    const rotatedPoint = getRotatedPoint(point);
    const layer = tileLayers[rotatedPoint.z];
    const layerData = getLayerData(layer);
    const index = rotatedPoint.y * layer.width + rotatedPoint.x;
    const tile = layerData[index];
    const isHighlighted = isCellHighlighted(rotatedPoint.z, index);
    const { w, h } = tileSet.getTileCoords(tile);
    const { x, y } = addVector(
      toIsometric(rotatedPoint),
      getLayerOffset(layer)
    );
    const tileMeta = tileSet.tileMeta[tile] ?? {};

    return { tile, tileMeta, point, isHighlighted, x, y, w, h };
  };

  const updateHighlightedCell = (point: Point) => {
    const isoCoords = floorVector(
      divVector(
        subVector(point, addVector(camera.view, stageOffset)),
        camera.view.scale
      )
    );
    const cellCoords = floorVector(toCartesian(isoCoords));
    highlightedCell = tileLayers.reduce(
      (acc, layer, i) => {
        const pos = addVector(cellCoords, {
          x: i,
          y: i
        });
        const isOutOfBounds = isWithinBounds({ ...point, z: i });
        if (isOutOfBounds) return acc;

        const cellIndex = pos.y * layer.width + pos.x;
        const cellAtLayer = getLayerData(layer)[cellIndex];
        const hasSpaceAbove = tileLayers[i + 1]
          ? getLayerData(tileLayers[i + 1])[cellIndex] === 0
          : true;

        return cellAtLayer && hasSpaceAbove ? { ...pos, z: i } : acc;
      },
      { x: -1, y: -1, z: -1 }
    );
  };

  return {
    // getObject,
    drawDebug,
    draw,
    updateHighlightedCell,
    getCellInfoByPoint3D
  };
};
