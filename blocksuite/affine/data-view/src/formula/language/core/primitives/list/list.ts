import { type PropertyAccessorMap, type Value } from '../../value.js';
import { BaseValue } from '../base.js';
import { Fn } from '../fn/fn.js';
import { NumberValue } from '../number/number.js';
import { StringValue } from '../string/string.js';

export class List extends BaseValue {
  typeHint: string = 'List';

  constructor(public readonly items: Value[]) {
    super();
  }

  concat = new Fn(args => {
    const otherList = args.get(0);
    if (!List.is(otherList)) {
      throw new Error('First argument to List.concat must be a List');
    }
    return new List([...this.items, ...otherList.items]);
  }, 'concat');

  map = new Fn(args => {
    const mapFn = args.get(0);

    // todo use trait
    if (!Fn.is(mapFn)) {
      throw new Error('First argument to List.map must be a function');
    }

    return new List(
      this.items.map((item, i) => mapFn.call([item, new NumberValue(i)]))
    );
  });

  filter = new Fn(args => {
    const filterFn = args.get(0);

    // todo use trait
    if (!Fn.is(filterFn)) {
      throw new Error('First argument to List.filter must be a callable');
    }
    return new List(
      this.items.filter((item, i) =>
        filterFn.call([item, new NumberValue(i)]).asBoolean()
      )
    );
  }, 'filter');

  fold = new Fn(args => {
    const foldFn = args.get(0);
    const initial = args.get(1);

    // todo use trait
    if (!Fn.is(foldFn)) {
      throw new Error('First argument to List.fold must be a callable');
    }
    return this.items.reduce(
      (acc, item, i) => foldFn.call([acc, item, new NumberValue(i)]),
      initial
    );
  }, 'fold');

  join = new Fn(args => {
    const separator = args.get(0);

    return new StringValue(
      this.items.join(separator.isNone() ? '' : separator.asString())
    );
  }, 'join');

  asString(): string {
    return `[${this.items.join(', ')}]`;
  }

  asBoolean(): boolean {
    return this.items.length > 0;
  }

  asNumber(): number {
    return this.items.length;
  }

  static override readonly properties: PropertyAccessorMap<List> = {
    len: me => new NumberValue(me.items.length),
    join: me => me.join,
    map: me => me.map,
    filter: me => me.filter,
    fold: me => me.fold,
    concat: me => me.concat,
  };

  static override is(val: unknown): val is List {
    return val instanceof List;
  }
}
