import {
  CAMERA_MAX_SCALE,
  CAMERA_MIN_SCALE,
  CAMERA_ROTATE_SCALE
} from '@/constants';
import { Unit } from '@/models/Unit';
import { Point } from '@/types';
import {
  addVector,
  clamp,
  clampVector,
  mulVector,
  rotateVector,
  subVector
} from '@/utils';
import { Camera } from './createCamera';

export type CreateControlsOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
  mousePosition: Point;
  player: Unit;
};

export const createControls = ({
  canvas,
  camera,
  mousePosition,
  player
}: CreateControlsOptions) => {
  canvas.addEventListener(
    'wheel',
    e => {
      camera.update({
        scale: clamp(camera.view.scale + (e.deltaY > 0 ? 0.1 : -0.1), {
          min: CAMERA_MIN_SCALE,
          max: CAMERA_MAX_SCALE
        })
      });
    },
    false
  );

  document.addEventListener('keyup', e => {
    switch (e.code) {
      case 'KeyQ':
        camera.update({
          angle: (camera.view.angle -= CAMERA_ROTATE_SCALE)
        });
        break;
      case 'KeyE':
        camera.update({
          angle: (camera.view.angle += CAMERA_ROTATE_SCALE)
        });
        break;
    }
  });

  canvas.addEventListener('mousedown', () => {
    let currentPosition = { ...mousePosition };

    const update = () => {
      const diff = mulVector(subVector(currentPosition, mousePosition), -1);
      camera.update(addVector(camera.view, diff));
      currentPosition = { ...mousePosition };
    };

    const stop = () => {
      canvas.removeEventListener('mousemove', update);
      canvas.removeEventListener('mouseup', stop);
    };

    canvas.addEventListener('mousemove', update);
    canvas.addEventListener('mouseup', stop);
  });

  let controls = {
    x: 0,
    y: 0
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
        controls.x--;
        controls.y--;
        break;
      case 'KeyS':
        controls.x++;
        controls.y++;
        break;
      case 'KeyA':
        controls.x--;
        controls.y++;
        break;
      case 'KeyD':
        controls.y--;
        controls.x++;
        break;
    }

    controls = clampVector(controls, {
      min: { x: -1, y: -1 },
      max: { x: 1, y: 1 }
    });
  };
  document.addEventListener('keydown', handleKeyboard);
  document.addEventListener('keyup', () => {
    if (controls.x === 0 && controls.y === 0) return;

    player.move({ ...rotateVector(controls, camera.view.angle), z: 0 });
    controls = { x: 0, y: 0 };
  });
};
