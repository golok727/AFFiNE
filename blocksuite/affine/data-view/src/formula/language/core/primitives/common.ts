import {
  AddTrait,
  DivTrait,
  MulTrait,
  NegTrait,
  RemTrait,
  SubTrait,
} from '../op/index.js';
import type { Add, Div, Mul, Neg, Rem, Sub } from '../op/types.js';
import { addImpl } from '../trait.js';
import type { Value, ValueConstructor } from '../value.js';
import { NumberValue } from './number/number.js';

export type CoreArithmeticImplementations = Add & Sub & Mul & Div & Rem & Neg;

export const CoreArithmeticImpl: CoreArithmeticImplementations = {
  add(me: Value, other: Value): Value {
    return new NumberValue(me.asNumber() + other.asNumber());
  },

  sub(me: Value, other: Value): NumberValue {
    return new NumberValue(me.asNumber() - other.asNumber());
  },

  mul(me: Value, other: Value): NumberValue {
    return new NumberValue(me.asNumber() * other.asNumber());
  },

  div(me: Value, other: Value): NumberValue {
    return new NumberValue(me.asNumber() / other.asNumber());
  },

  rem(me: Value, other: Value): NumberValue {
    return new NumberValue(me.asNumber() % other.asNumber());
  },

  neg(me: Value): NumberValue {
    return new NumberValue(-me.asNumber());
  },
};

export function implCoreArithmetic<C extends ValueConstructor>(cstr: C) {
  addImpl(cstr, AddTrait, CoreArithmeticImpl);
  addImpl(cstr, SubTrait, CoreArithmeticImpl);
  addImpl(cstr, MulTrait, CoreArithmeticImpl);
  addImpl(cstr, DivTrait, CoreArithmeticImpl);
  addImpl(cstr, RemTrait, CoreArithmeticImpl);
  addImpl(cstr, NegTrait, CoreArithmeticImpl);
}
