import { Entity } from '@/models/Entity';
import { Constructor, Nullable, Point, SpritesheetTag } from '@/types';
import { ImageLoader } from './withImageLoader';

export const withSprite = <T extends Constructor<Entity> & ImageLoader>(
  Base: T
) => {
  return class Sprite extends Base {
    private currentFrameIndex = 0;

    private animationTimeout: Nullable<ReturnType<typeof setTimeout>>;

    constructor(...args: any[]) {
      super(...args);
      this.load(this.spriteSheet.src);

      this.emitter.on('*', () => {
        const tag = this.spriteSheet.meta.frameTags.find(
          tag => tag.name === this.state
        );
        if (!tag) {
          return;
        }

        this.currentFrameIndex = tag.from;
        this.animate();
      });
    }

    private get currentAnimation(): SpritesheetTag {
      return this.spriteSheet.meta.frameTags.find(
        tag => tag.name === this.state
      )!;
    }

    private get currentFrame() {
      return this.spriteSheet.frames[this.currentFrameIndex];
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

    renderSprite(ctx: CanvasRenderingContext2D, { x, y }: Point) {
      ctx.save();

      const xOffset = this.currentFrame.frame.w / 4;
      const yOffset = this.currentFrame.frame.h / 2;

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

export type Sprite = ReturnType<typeof withSprite>;
