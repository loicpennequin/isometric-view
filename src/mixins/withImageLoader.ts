import { AnyConstructor, Nullable } from '@/types';

export const withImageLoader = <T extends AnyConstructor>(Base: T) => {
  return class ImageLoader extends Base {
    public ready!: Promise<void>;

    private _img: Nullable<HTMLImageElement>;

    protected get img() {
      if (!this._img)
        throw new Error('You need to call .load() before accessing this.img');

      return this._img;
    }

    load(src: string) {
      this.ready = new Promise<void>(resolve => {
        this._img = Object.assign(new Image(), { src });
        this._img.addEventListener('load', () => {
          resolve();
        });
      });
    }
  };
};

export type ImageLoader = ReturnType<typeof withImageLoader>;
