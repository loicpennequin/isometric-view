// import { TileSlope } from '@/enums';
import { Direction, Tileslope, TileSlope } from '@/enums';
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

  const isSlopeAndDirectionEqual = (slope: Tileslope, direction: Direction) =>
    (slope === TileSlope.NORTH_WEST && direction === Direction.NORTH_WEST) ||
    (slope === TileSlope.NORTH_EAST && direction === Direction.NORTH_EAST) ||
    (slope === TileSlope.SOUTH_EAST && direction === Direction.SOUTH_EAST) ||
    (slope === TileSlope.SOUTH_WEST && direction === Direction.SOUTH_WEST);

  const isSlopeAndDirectionInverted = (
    slope: Tileslope,
    direction: Direction
  ) =>
    (slope === TileSlope.NORTH_WEST && direction === Direction.SOUTH_EAST) ||
    (slope === TileSlope.NORTH_EAST && direction === Direction.SOUTH_WEST) ||
    (slope === TileSlope.SOUTH_EAST && direction === Direction.NORTH_WEST) ||
    (slope === TileSlope.SOUTH_WEST && direction === Direction.NORTH_EAST);

  const updatePosition = (from: Point3D, to: Point3D) => {
    const { stage } = base;
    const direction = getDirection(from, to);
    if (!direction) return;

    const fromCell = stage.getCellInfoByPoint3D(from);
    const toCell = stage.getCellInfoByPoint3D(to);
    const toCellAbove = stage.getCellInfoByPoint3D({ ...to, z: to.z + 1 });
    const toCellBelow = stage.getCellInfoByPoint3D({ ...to, z: to.z - 1 });
    const upwardSlope = toCellAbove?.tileMeta.slope;
    const downwardSlope = toCell?.tileMeta.slope;
    const fromSlope = fromCell?.tileMeta?.slope;

    if (upwardSlope) {
      const isAvailable =
        upwardSlope === TileSlope.ALL ||
        isSlopeAndDirectionEqual(upwardSlope, direction);

      return isAvailable ? toCellAbove.point : from;
    }
    if (downwardSlope) {
      const isAvailable =
        downwardSlope === TileSlope.ALL ||
        isSlopeAndDirectionInverted(downwardSlope, direction);

      return isAvailable ? toCell?.point : from;
    }
    if (fromSlope) {
      const isUpward = isSlopeAndDirectionEqual(fromSlope, direction);

      const isDownward = isSlopeAndDirectionInverted(fromSlope, direction);

      if (fromSlope === TileSlope.ALL) {
        return toCell?.tile === 0 ? toCellBelow?.point : toCell?.point;
      }
      if (isUpward) {
        return toCellAbove?.tile === 0 ? toCell?.point : from;
      }
      if (isDownward) {
        return toCellBelow?.tileMeta?.slope === fromSlope || toCell?.tile === 0
          ? toCellBelow?.point
          : from;
      }

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
