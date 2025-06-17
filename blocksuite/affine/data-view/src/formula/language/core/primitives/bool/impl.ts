import type { Eq, Not } from '../../op/types.js';
import type { Value } from '../../value.js';
import { BooleanValue } from './bool.js';

export type BoolImplementations = Not & Eq<BooleanValue>;

export const BoolValueImpl: BoolImplementations = {
  not(me: Value): BooleanValue {
    return new BooleanValue(!me.asBoolean());
  },
  eq(me: BooleanValue, other: Value): BooleanValue {
    if (!(me instanceof BooleanValue)) {
      throw new Error(
        `First parameter to BooleanValue.eq must be a BooleanValue but got ${other.typeHint}`
      );
    }

    return new BooleanValue(
      other instanceof BooleanValue && me.value === other.value
    );
  },
} as const;
