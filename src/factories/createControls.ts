import {
  CAMERA_MAX_SCALE,
  CAMERA_MIN_SCALE,
  CAMERA_ROTATE_SCALE
} from '@/constants';
import { clamp } from '@/utils';
import { Camera } from './createCamera';

export type CreateControlsOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
};

export const createControls = ({ canvas, camera }: CreateControlsOptions) => {
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
};
