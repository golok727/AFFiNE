import type { Trait } from './types.js';

export interface ValueConstructor {
  new (...args: any[]): Value;
  readonly properties: PropertyAccessorMap<any>;
}

export interface Value {
  readonly typeHint: string;

  asString(): string;
  asBoolean(): boolean;
  asNumber(): number;
  isNone(): boolean;

  getImpl<T>(trait: Trait<T>): Readonly<T>;
  getImpl<T>(trait: Trait<T>, optional: true): Readonly<T> | null;
}

export type PropertyAccessorMap<Self extends Value = Value> = Record<
  string,
  (me: Self) => Value
>;
