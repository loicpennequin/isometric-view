import { AnyConstructor } from '@/types';
import mitt, { EventType, Handler } from 'mitt';

export const withEmitter = <
  TBase extends AnyConstructor,
  TEvents extends Record<EventType, unknown>
>(
  Base: TBase
) => {
  return class Emittable extends Base {
    protected emitter = mitt();

    on<Key extends keyof TEvents>(
      type: Key,
      listener: Handler<TEvents[Key]>
    ): void {
      //@ts-ignore
      this.emitter.on(type, listener);
    }

    off<Key extends keyof TEvents>(
      type: Key,
      listener: Handler<TEvents[Key]>
    ): void {
      //@ts-ignore
      this.emitter.off(type, listener);
    }
  };
};

export type Emittable = ReturnType<typeof withEmitter>;
