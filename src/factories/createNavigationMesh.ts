import { Direction } from '@/enums';
// import { TileSet } from '@/models/TileSet';
// import { Point3D, StageMeta } from '@/types';

type NavMeshKey = `${string}.${string}.${string}`;

export type NavMeshNode = Record<Direction, NavMeshKey>;

export const createNavMesh = () =>
  // stageMeta: StageMeta,
  // tileSet: TileSet
  {
    // const mesh = new Map<string, NavMeshNode>();
    // const getKey = ({ x, y, z }: Point3D) => `${z}.${y}.${x}`;
    // stageMeta.layers.forEach((layer, layerIndex) => {
    //   layer.data.forEach((tile, index)l => {
    //   })
    // })
    // return {
    //   isWalkable(from: Point3D, to: Point3D): boolean {
    //     return true;
    //   }
    // };
  };
