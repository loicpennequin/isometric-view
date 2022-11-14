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
        scale: clamp(camera.view.scale + (e.deltaY > 0 ? 0.05 : -0.05), {
          min: 0.25,
          max: 1.5
        })
      });
    },
    false
  );
};
