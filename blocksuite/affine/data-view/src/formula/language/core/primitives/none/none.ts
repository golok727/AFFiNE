import { BaseValue } from '../base.js';

export class NoneValue extends BaseValue {
  readonly typeHint: string = 'None';

  asString(): string {
    return 'None';
  }

  asBoolean(): boolean {
    return false;
  }

  asNumber(): number {
    return 0;
  }

  override isNone(): boolean {
    return true;
  }

  static is(val: unknown): val is NoneValue {
    return val instanceof NoneValue;
  }
}

export const None = new NoneValue();
