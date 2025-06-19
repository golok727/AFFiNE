import { type PropertyAccessorMap } from '../../value.js';
import { BaseValue } from '../base.js';
import { Fn } from '../fn/fn.js';

export class NumberValue extends BaseValue {
  static override readonly typeHint: string = 'Number';

  constructor(public readonly value: number) {
    super();
  }

  floor = new Fn(() => new NumberValue(Math.floor(this.value)));

  asString(): string {
    return this.value.toString();
  }

  asBoolean(): boolean {
    return !!this.value;
  }

  asNumber(): number {
    return this.value;
  }

  override isNone(): boolean {
    return false;
  }

  static override is(val: unknown): val is NumberValue {
    return val instanceof NumberValue;
  }

  static override readonly properties: PropertyAccessorMap<NumberValue> = {
    floor: (me: NumberValue) => me.floor,
  };
}
