// import { TileSlope } from '@/enums';
import { Direction, TileSlope } from '@/enums';
import { Stage } from '@/factories/createStage';
import { Point3D } from '@/types';
import { addVector3D } from '@/utils';

export type WithMovementBase = {
  stage: Stage;
  position: Point3D;
};

export const withMovement = <T extends WithMovementBase>(base: T) => {
  const getDirection = (from: Point3D, to: Point3D) => {
    if (from.y === to.y) {
      return from.x > to.x ? Direction.NORTH_WEST : Direction.SOUTH_EAST;
    }

    if (from.x === to.x) {
      return from.y > to.y ? Direction.NORTH_EAST : Direction.SOUTH_WEST;
    }

    if (from.x > to.x && from.y > to.y) return Direction.NORTH;
    if (from.x > to.x && from.y < to.y) return Direction.WEST;
    if (from.x < to.x && from.y > to.y) return Direction.EAST;
    if (from.x < to.x && from.y < to.y) return Direction.SOUTH;

    return null;
  };

  const updatePosition = (from: Point3D, to: Point3D) => {
    const { stage } = base;
    const direction = getDirection(from, to);
    if (!direction) return;

    const toCell = stage.getCellInfoByPoint3D(to);
    const fromCell = stage.getCellInfoByPoint3D(from);
    const toCellAbove = stage.getCellInfoByPoint3D({ ...to, z: to.z + 1 });
    const toCellBelow = stage.getCellInfoByPoint3D({ ...to, z: to.z - 1 });
    const toAboveSlope = toCellAbove?.tileMeta.slope;
    const toSlope = toCell?.tileMeta.slope;
    const fromSlope = fromCell?.tileMeta?.slope;

    if (toAboveSlope) {
      const isAvailable =
        toAboveSlope === TileSlope.ALL ||
        (toAboveSlope === TileSlope.NORTH_WEST &&
          direction === Direction.NORTH_WEST) ||
        (toAboveSlope === TileSlope.NORTH_EAST &&
          direction === Direction.NORTH_EAST) ||
        (toAboveSlope === TileSlope.SOUTH_EAST &&
          direction === Direction.SOUTH_EAST) ||
        (toAboveSlope === TileSlope.SOUTH_WEST &&
          direction === Direction.SOUTH_WEST);
      return isAvailable ? toCellAbove.point : from;
    }
    if (toSlope) {
      const isAvailable =
        toSlope === TileSlope.ALL ||
        (toSlope === TileSlope.NORTH_WEST &&
          direction === Direction.SOUTH_EAST) ||
        (toSlope === TileSlope.NORTH_EAST &&
          direction === Direction.SOUTH_WEST) ||
        (toSlope === TileSlope.SOUTH_EAST &&
          direction === Direction.NORTH_WEST) ||
        (toSlope === TileSlope.SOUTH_WEST &&
          direction === Direction.NORTH_EAST);
      return isAvailable ? toCell?.point : from;
    }
    if (fromSlope) {
      const isUpward =
        (fromSlope === TileSlope.NORTH_WEST &&
          direction === Direction.NORTH_WEST) ||
        (fromSlope === TileSlope.NORTH_EAST &&
          direction === Direction.NORTH_EAST) ||
        (fromSlope === TileSlope.SOUTH_EAST &&
          direction === Direction.SOUTH_EAST) ||
        (fromSlope === TileSlope.SOUTH_WEST &&
          direction === Direction.SOUTH_WEST);

      const isDownward =
        (fromSlope === TileSlope.NORTH_WEST &&
          direction === Direction.SOUTH_EAST) ||
        (fromSlope === TileSlope.NORTH_EAST &&
          direction === Direction.SOUTH_WEST) ||
        (fromSlope === TileSlope.SOUTH_EAST &&
          direction === Direction.NORTH_WEST) ||
        (fromSlope === TileSlope.SOUTH_WEST &&
          direction === Direction.NORTH_EAST);

      if (fromSlope === TileSlope.ALL) {
        return toCell?.tile === 0 ? toCellBelow?.point : toCell?.point;
      }
      if (isUpward) return toCell?.point;
      if (isDownward) return toCellBelow?.point;

      return from;
    }

    if (toCell?.tile === 0) return from;
    if (toCellAbove?.tile !== 0) return from;
    return to;
  };

  const move = (diff: Point3D) => {
    const target = addVector3D(base.position, diff);
    Object.assign(base.position, updatePosition(base.position, target));
  };

  return Object.assign({}, base, { move });
};
