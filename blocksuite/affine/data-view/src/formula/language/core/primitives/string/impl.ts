import { type Add, type Eq, type Ord, Ordering } from '../../op/types.js';
import type { Value } from '../../value.js';
import { BooleanValue } from '../bool/bool.js';
import { NumberValueImpl } from '../number/impl.js';
import { StringValue } from './string.js';

export const StringValueImpl: Add & Ord & Eq<StringValue> = {
  add(me: Value, other: Value): StringValue {
    return new StringValue(me.asString() + other.asString());
  },

  cmp(me: Value, other: Value): Ordering {
    if (me instanceof StringValue && other instanceof StringValue) {
      const a = me.asString();
      const b = other.asString();
      return a === b ? Ordering.Eq : a < b ? Ordering.Lt : Ordering.Gt;
    }
    return NumberValueImpl.cmp(me, other);
  },

  eq(me: StringValue, other: Value): BooleanValue {
    if (!(me instanceof StringValue)) {
      throw new Error(
        `First parameter to StringValue.eq must be a StringValue but got ${other.typeHint}`
      );
    }
    return new BooleanValue(
      other instanceof StringValue && me.value === other.value
    );
  },
} as const;
