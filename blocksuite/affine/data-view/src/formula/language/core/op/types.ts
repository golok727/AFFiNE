import type { BooleanValue } from '../primitives/bool/bool.js';
import type { Value } from '../value.js';

export const Ordering = {
  Lt: -1,
  Eq: 0,
  Gt: 1,
} as const;

export type Ordering = (typeof Ordering)[keyof typeof Ordering];

export type Add<T extends Value = Value> = {
  add(me: T, other: Value): Value;
};
export type Sub<T extends Value = Value> = {
  sub(me: T, other: Value): Value;
};
export type Mul<T extends Value = Value> = {
  mul(me: T, other: Value): Value;
};
export type Div<T extends Value = Value> = {
  div(me: T, other: Value): Value;
};
export type Rem<T extends Value = Value> = {
  rem(me: T, other: Value): Value;
};
export type Ord<T extends Value = Value> = {
  cmp(me: T, other: Value): Ordering;
};
export type Eq<T extends Value = Value> = {
  eq(me: T, other: Value): BooleanValue;
};
export type Neg<T extends Value = Value> = {
  neg(me: T): T;
};
export type Not<T extends Value = Value> = {
  not(me: T): BooleanValue;
};
export type Call<T extends Value = Value> = {
  call(me: T, args: Value[]): Value;
};
// for a.b,  a.b.c,  a.b.c() etc..
export type PropertyAccessor<T extends Value = Value> = {
  getProperty(me: T, prop: string): Value;
};
