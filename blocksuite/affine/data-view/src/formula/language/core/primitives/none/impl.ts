import type { Eq } from '../../op/types.js';
import type { Value } from '../../value.js';
import { BooleanValue } from '../bool/bool.js';
import { NoneValue } from './none.js';

export const NoneValueImpl: Eq<NoneValue> = {
  eq(me: NoneValue, other: Value): BooleanValue {
    if (!(me instanceof NoneValue)) {
      throw new Error(
        `First parameter to BooleanValue.eq must be a BooleanValue but got ${other.typeHint}`
      );
    }
    return new BooleanValue(other instanceof NoneValue);
  },
} as const;
