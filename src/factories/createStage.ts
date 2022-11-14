import { TileSet } from '@/factories/createTileSet';
import { MapMeta, MapMetaLayer, Point, Point3D, Rectangle } from '@/types';
import {
  addVector,
  cartesianToIsometric,
  createMatrix,
  diamond,
  divVector,
  floorVector,
  mulVector,
  rotateMatrix,
  subVector
} from '@/utils';
import { Camera } from './createCamera';

export type CreateStageOptions = {
  ctx: CanvasRenderingContext2D;
  meta: MapMeta;
  tileSet: TileSet;
  camera: Camera;
};

export type Stage = ReturnType<typeof createStage>;

type DrawCellOptions = Rectangle & {
  isHighlighted: boolean;
  cellCoords: Point;
  tile: number;
  index: number;
};

type DrawLayersOptions = {
  drawCell: (opts: DrawCellOptions) => void;
  debug?: boolean;
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
  const stageOffset: Point = { x: -meta.tilewidth / 2, y: 0 };

  const getLayerOffset = (layer: MapMetaLayer, debug?: boolean): Point =>
    addVector(
      { x: layer.offsetx ?? 0, y: layer.offsety ?? 0 },
      debug ? { x: 0, y: 0 } : stageOffset
    );

  const getLayerData = (layer: MapMetaLayer) => {
    const matrix = createMatrix(
      { w: meta.width, h: meta.height },
      ({ x, y }) => layer.data[x * meta.height + y]
    );

    return rotateMatrix<number>(matrix, camera.view.angle).flat();
  };

  const getCellCoords = (layer: MapMetaLayer, index: number): Point => ({
    x: index % layer.width,
    y: Math.floor(index / layer.height)
  });

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
      highlightedCell.y * meta.layers[layerIndex].width + highlightedCell.x;

  const drawLayers = ({ drawCell, debug = false }: DrawLayersOptions) => {
    meta.layers.forEach((layer, layerIndex) => {
      if (debug && layerIndex > 0) return;

      getLayerData(layer).forEach((tile, index) => {
        const isHighlighted = isCellHighlighted(layerIndex, index);
        const { w, h } = tileSet.getTileCoords(tile);
        const cellCoords = getCellCoords(layer, index);
        const { x, y } = addVector(
          toIsometric(cellCoords),
          getLayerOffset(layer, debug)
        );

        drawCell({ tile, index, isHighlighted, cellCoords, x, y, w, h });
      });
    });
  };

  const drawDebug = () => {
    drawLayers({
      debug: true,
      drawCell({ cellCoords, x, y, w, h }) {
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
        ctx.fillText(`${cellCoords.x} : ${cellCoords.y}`, x - halfSize.x, y);
      }
    });
  };

  const draw = () => {
    drawLayers({
      drawCell({ tile, isHighlighted, x, y }) {
        ctx.save();

        if (isHighlighted) ctx.filter = 'brightness(200%)';

        tileSet.draw(tile, { x, y }, camera.view.angle);
        ctx.restore();
      }
    });
  };

  const updateHighlightedCell = (point: Point) => {
    const isoCoords = floorVector(
      divVector(subVector(point, camera.view), camera.view.scale)
    );
    const cellCoords = floorVector(toCartesian(isoCoords));

    highlightedCell = meta.layers.reduce(
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
        const cellAtLayer = getLayerData(layer)[cellIndex];
        const hasSpaceAbove = meta.layers[i + 1]
          ? getLayerData(meta.layers[i + 1])[cellIndex] === 0
          : true;

        return cellAtLayer && hasSpaceAbove ? { ...pos, z: i } : acc;
      },
      { x: -1, y: -1, z: -1 }
    );
  };

  return {
    isCellHighlighted,
    drawDebug,
    draw,
    updateHighlightedCell
  };
};
