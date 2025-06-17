import { type PropertyAccessorMap } from '../../value.js';
import { BaseValue } from '../base.js';
import type { Arguments } from '../fn/arguments.js';
import { Fn } from '../fn/fn.js';
import { NumberValue } from '../number/number.js';

export class StringValue extends BaseValue {
  readonly typeHint: string = 'String';

  get length(): number {
    return this.value.length;
  }

  readonly trim = new Fn(() => new StringValue(this.value.trim()), 'trim');

  readonly slice = new Fn((args: Arguments) => {
    const start = args.get(0);
    const end = args.get(1);

    return new StringValue(
      this.value.slice(
        start.asNumber(),
        end.isNone() ? undefined : end.asNumber()
      )
    );
  }, 'slice');

  readonly upper = new Fn(
    () => new StringValue(this.value.toUpperCase()),
    'upper'
  );

  readonly lower = new Fn(
    () => new StringValue(this.value.toLowerCase()),
    'lower'
  );

  constructor(public readonly value: string) {
    super();
  }

  asString(): string {
    return this.value;
  }

  asBoolean(): boolean {
    return this.value.length > 0;
  }

  asNumber(): number {
    return Number(this.value);
  }

  static is(val: unknown): val is StringValue {
    return val instanceof StringValue;
  }

  static override readonly properties: PropertyAccessorMap<StringValue> = {
    len: (me: StringValue) => new NumberValue(me.value.length),
    trim: (me: StringValue) => me.trim,
    upper: (me: StringValue) => me.upper,
    lower: (me: StringValue) => me.lower,
    slice: (me: StringValue) => me.slice,
  };
}
