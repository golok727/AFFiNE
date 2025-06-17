import { type Eq, type Ord, Ordering } from '../../op/types.js';
import type { Value } from '../../value.js';
import { BooleanValue } from '../bool/bool.js';
import { NumberValue } from './number.js';

export type NumberImplementations = Ord & Eq<NumberValue>;

export const NumberValueImpl: NumberImplementations = {
  cmp(me: Value, other: Value): Ordering {
    const a = me.asNumber();
    const b = other.asNumber();
    return a === b ? Ordering.Eq : a < b ? Ordering.Lt : Ordering.Gt;
  },
  eq(me: NumberValue, other: Value): BooleanValue {
    if (!(me instanceof NumberValue)) {
      throw new Error(
        `First parameter to NumberValue.eq must be a NumberValue but got ${other.typeHint}`
      );
    }
    return new BooleanValue(
      other instanceof NumberValue && me.value === other.value
    );
  },
} as const;
