import { SpriteAnimationState } from '@/enums';
import { Entity } from '@/models/Entity';
import { Constructor, Nullable, SpritesheetTag } from '@/types';

export const withSprite = <T extends Constructor<Entity>>(Base: T) => {
  return class Sprite extends Base {
    private animationState: SpriteAnimationState = SpriteAnimationState.IDLE;

    private currentFrameIndex = 0;

    private animationTimeout: Nullable<ReturnType<typeof setTimeout>>;

    private img!: HTMLImageElement;

    public ready!: Promise<void>;

    constructor(...args: any[]) {
      super(...args);
      this.load();
    }

    private load() {
      this.img = Object.assign(new Image(), { src: this.spriteSheet.src });
      this.ready = new Promise<void>(resolve => {
        this.img.addEventListener('load', () => {
          resolve();
        });
      });
    }

    private get currentAnimation(): SpritesheetTag {
      return this.spriteSheet.meta.frameTags.find(
        tag => tag.name === this.animationState
      )!;
    }

    private get currentFrame() {
      return this.spriteSheet.frames[this.currentFrameIndex];
    }

    transitionTo(state: SpriteAnimationState) {
      const tag = this.spriteSheet.meta.frameTags.find(
        tag => tag.name === state
      );
      if (!tag) {
        console.warn(`Unavailable state for sprite`, state);
        return;
      }

      this.animationState = state;
      this.currentFrameIndex = tag.from;
    }

    animate() {
      if (this.animationTimeout) clearTimeout(this.animationTimeout);
      const { from, to } = this.currentAnimation;

      const next = () => {
        this.animationTimeout = setTimeout(() => {
          this.currentFrameIndex =
            this.currentFrameIndex === to ? from : this.currentFrameIndex + 1;
          next();
        }, this.currentFrame.duration);
      };

      next();
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      const cellInfos = this.stage.getCellInfoByPoint3D(this.position);
      if (!cellInfos) return;

      const { x, y, h, tileMeta } = cellInfos;
      const xOffset = this.currentFrame.frame.w / 4;
      const yOffset =
        this.currentFrame.frame.h / 2 - (tileMeta.slope ? h / 3 : 0);

      ctx.drawImage(
        this.img,
        this.currentFrame.frame.x,
        this.currentFrame.frame.y,
        this.currentFrame.frame.w,
        this.currentFrame.frame.h,
        x - xOffset,
        y - yOffset,
        this.currentFrame.frame.w,
        this.currentFrame.frame.h
      );
      ctx.restore();
    }
  };
};

export type Spritable = ReturnType<typeof withSprite>;
