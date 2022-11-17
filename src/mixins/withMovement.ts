// import { TileSlope } from '@/enums';
import { ENTITY_MOVEMENT_DURATION } from '@/constants';
import { Direction, EntityState, Tileslope, TileSlope } from '@/enums';
import { Entity } from '@/models/Entity';
import { Constructor, Point3D } from '@/types';
import { addVector3D, lerpVector, vectorEquals } from '@/utils';

export const withMovement = <TBase extends Constructor<Entity>>(
  Base: TBase
) => {
  return class Movable extends Base {
    protected movementStartedAt = 0;
    prevPosition: Point3D = { x: -9999, y: -9999, z: -9999 };

    private isWalkable(cell: any) {
      if (!cell) return false;
      return cell.tile !== 0 && cell.tileMeta?.walkable !== false;
    }

    private getDirection(from: Point3D, to: Point3D) {
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
    }

    private isSlopeAndDirectionEqual(slope: Tileslope, direction: Direction) {
      return (
        (slope === TileSlope.NORTH_WEST &&
          direction === Direction.NORTH_WEST) ||
        (slope === TileSlope.NORTH_EAST &&
          direction === Direction.NORTH_EAST) ||
        (slope === TileSlope.SOUTH_EAST &&
          direction === Direction.SOUTH_EAST) ||
        (slope === TileSlope.SOUTH_WEST && direction === Direction.SOUTH_WEST)
      );
    }

    private isSlopeAndDirectionInverted(
      slope: Tileslope,
      direction: Direction
    ) {
      return (
        (slope === TileSlope.NORTH_WEST &&
          direction === Direction.SOUTH_EAST) ||
        (slope === TileSlope.NORTH_EAST &&
          direction === Direction.SOUTH_WEST) ||
        (slope === TileSlope.SOUTH_EAST &&
          direction === Direction.NORTH_WEST) ||
        (slope === TileSlope.SOUTH_WEST && direction === Direction.NORTH_EAST)
      );
    }

    updatePosition(from: Point3D, to: Point3D): Point3D {
      const direction = this.getDirection(from, to);
      if (!direction) return from;

      const fromCell = this.stage.getCellInfoByPoint3D(from);
      const toCell = this.stage.getCellInfoByPoint3D(to);
      const toCellAbove = this.stage.getCellInfoByPoint3D({
        ...to,
        z: to.z + 1
      });
      const toCellBelow = this.stage.getCellInfoByPoint3D({
        ...to,
        z: to.z - 1
      });
      const upwardSlope = toCellAbove?.tileMeta.slope;
      const downwardSlope = toCell?.tileMeta.slope;
      const fromSlope = fromCell?.tileMeta?.slope;

      if (upwardSlope) {
        const isAvailable =
          upwardSlope === TileSlope.ALL ||
          this.isSlopeAndDirectionEqual(upwardSlope, direction);

        return isAvailable ? toCellAbove.point : from;
      }
      if (downwardSlope) {
        const isAvailable =
          downwardSlope === TileSlope.ALL ||
          this.isSlopeAndDirectionInverted(downwardSlope, direction);

        return isAvailable ? toCell.point : from;
      }
      if (fromSlope) {
        const isUpward = this.isSlopeAndDirectionEqual(fromSlope, direction);

        const isDownward = this.isSlopeAndDirectionInverted(
          fromSlope,
          direction
        );

        if (fromSlope === TileSlope.ALL) {
          return !this.isWalkable(toCell) ? toCellBelow!.point : toCell!.point;
        }
        if (isUpward) {
          return !this.isWalkable(toCellAbove) ? toCell!.point : from;
        }
        if (isDownward) {
          return toCellBelow?.tileMeta?.slope === fromSlope ||
            !this.isWalkable(toCell)
            ? toCellBelow!.point
            : from;
        }

        return from;
      }

      if (!this.isWalkable(toCell)) return from;
      if (toCellAbove?.tile !== 0) return from;

      return to;
    }

    protected get interpolatedCoords() {
      const cellInfos = this.stage.getCellInfoByPoint3D(this.position);

      if (!cellInfos) {
        throw new Error('Out of bond cell when interpolating position');
      }
      if (this.state !== EntityState.WALKING) return cellInfos;

      const prevCellInfos = this.stage.getCellInfoByPoint3D(this.prevPosition);
      if (!prevCellInfos) return cellInfos;

      const now = performance.now();
      const elapsed = now - this.movementStartedAt;

      const coords = lerpVector(
        prevCellInfos,
        cellInfos,
        elapsed / ENTITY_MOVEMENT_DURATION
      );

      return coords;
    }

    move(diff: Point3D) {
      const target = addVector3D(this.position, diff);
      const newPosition = this.updatePosition(this.position, target);

      if (vectorEquals(this.position, newPosition)) {
        return;
      }

      this.transitionTo(EntityState.WALKING);
      setTimeout(() => {
        this.transitionTo(EntityState.IDLE);
      }, ENTITY_MOVEMENT_DURATION);
      this.movementStartedAt = performance.now();
      this.prevPosition = this.position;
      this.position = newPosition;
    }
  };
};

export type Movable = ReturnType<typeof withMovement>;
