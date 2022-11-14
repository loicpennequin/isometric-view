import {
  CAMERA_MAX_SCALE,
  CAMERA_MIN_SCALE,
  CAMERA_ROTATE_SCALE
} from '@/constants';
import { Point } from '@/types';
import { addVector, clamp, mulVector, subVector } from '@/utils';
import { Camera } from './createCamera';

export type CreateControlsOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
  mousePosition: Point;
};

export const createControls = ({
  canvas,
  camera,
  mousePosition
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

  canvas.addEventListener('mousedown', e => {
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
};
