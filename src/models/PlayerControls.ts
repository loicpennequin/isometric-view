import {
  CAMERA_MAX_SCALE,
  CAMERA_MIN_SCALE,
  CAMERA_ROTATE_SCALE
} from '@/constants';
import { Camera } from '@/models/Camera';
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

export type PlayerControlsOptions = {
  canvas: HTMLCanvasElement;
  camera: Camera;
  mousePosition: Point;
  player: Unit;
};

export class PlayerControls {
  private canvas!: HTMLCanvasElement;

  private camera!: Camera;

  private mousePosition!: Point;

  private player!: Unit;

  private isCameraEnabled = false;

  private isPlayerMovementEnabled = false;

  constructor(opts: PlayerControlsOptions) {
    Object.assign(this, opts);

    this.handleCameraControls();
    this.handlePlayerMovement();
  }

  enableCamera() {
    this.isCameraEnabled = true;
    return this;
  }

  enablePlayerMovement() {
    this.isPlayerMovementEnabled = true;
    return this;
  }

  disableCamera() {
    this.isCameraEnabled = false;
    return this;
  }

  disablePlayerMovement() {
    this.isPlayerMovementEnabled = false;
    return this;
  }

  private handleCameraScale() {
    this.canvas.addEventListener(
      'wheel',
      e => {
        if (!this.isCameraEnabled) return;
        this.camera.update({
          scale: clamp(this.camera.view.scale + (e.deltaY > 0 ? 0.1 : -0.1), {
            min: CAMERA_MIN_SCALE,
            max: CAMERA_MAX_SCALE
          })
        });
      },
      false
    );
  }

  private handleCameraRotation() {
    document.addEventListener('keyup', e => {
      if (!this.isCameraEnabled) return;
      switch (e.code) {
        case 'KeyQ':
          this.camera.update({
            angle: (this.camera.view.angle -= CAMERA_ROTATE_SCALE)
          });
          break;
        case 'KeyE':
          this.camera.update({
            angle: (this.camera.view.angle += CAMERA_ROTATE_SCALE)
          });
          break;
      }
    });
  }

  private handleCameraPosition() {
    this.canvas.addEventListener('mousedown', () => {
      if (!this.isCameraEnabled) return;

      let currentPosition = { ...this.mousePosition };

      const update = () => {
        const diff = mulVector(
          subVector(currentPosition, this.mousePosition),
          -1
        );
        this.camera.update(addVector(this.camera.view, diff));
        currentPosition = { ...this.mousePosition };
      };

      const stop = () => {
        this.canvas.removeEventListener('mousemove', update);
        this.canvas.removeEventListener('mouseup', stop);
      };

      this.canvas.addEventListener('mousemove', update);
      this.canvas.addEventListener('mouseup', stop);
    });
  }

  private handleCameraControls() {
    this.handleCameraPosition();
    this.handleCameraScale();
    this.handleCameraRotation();
  }

  private handlePlayerMovement() {
    let controls = {
      x: 0,
      y: 0
    };

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.isPlayerMovementEnabled) return;
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
    });

    document.addEventListener('keyup', () => {
      if (controls.x === 0 && controls.y === 0) return;

      this.player.move({
        ...rotateVector(controls, this.camera.view.angle),
        z: 0
      });
      controls = { x: 0, y: 0 };
    });
  }
}
