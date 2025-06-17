import { CallTrait } from '../../op/index.js';
import type { Value } from '../../value.js';
import { Fn } from './fn.js';

export * from './arguments.js';
export * from './fn.js';

Fn.addImpl(CallTrait, {
  call(me: Value, args: Value[]) {
    if (!(me instanceof Fn)) {
      throw new Error(
        `First parameter to Fn.call must be a Fn but got ${me.typeHint}`
      );
    }
    return me.call(args);
  },
});
