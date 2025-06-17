import {
  BooleanValue,
  Fn,
  List,
  None,
  NumberValue,
  StringValue,
} from '../language/core/index.js';
import { Environment } from '../language/environment.js';

const range = new Fn(args => {
  if (args.length === 0) {
    return new List([]);
  }
  if (args.length === 1) {
    const end = args.get(0).asNumber();
    return new List(Array.from({ length: end }, (_, i) => new NumberValue(i)));
  }
  if (args.length === 2) {
    const start = args.get(0).asNumber();
    const end = args.get(1).asNumber();
    return new List(
      Array.from({ length: end - start }, (_, i) => new NumberValue(i + start))
    );
  }
  throw new Error('range() function requires either 0, 1, or 2 arguments.');
}, 'range');

const concat = new Fn(args => {
  return new StringValue(args.raw.map(arg => arg.asString()).join(''));
}, 'concat');

const type = new Fn(args => {
  const arg = args.get(0);
  return new StringValue(arg.typeHint);
}, 'type');

const toString = new Fn(args => {
  const arg = args.get(0);
  return new StringValue(arg.asString());
}, 'toString');

const toNumber = new Fn(args => {
  const arg = args.get(0);
  return new NumberValue(arg.asNumber());
}, 'toNumber');

const toBool = new Fn(args => {
  const arg = args.get(0);
  return new BooleanValue(arg.asBoolean());
}, 'toBool');

/**
 * This environment provides the standard library functions
 */
export class FormulaRuntime extends Environment {
  constructor() {
    super(null);

    this.define({
      type: 'value',
      linkname: 'concat',
      description:
        'Concatenates multiple string values into a single string. \n\nUsage: `concat(value1, value2, ...)`',
      value: concat,
    });

    this.define({
      type: 'value',
      linkname: 'type',
      description:
        'Returns the type of a value as a string. \n\nUsage: `type(value)`',
      value: type,
    });

    this.define({
      type: 'value',
      linkname: 'string',
      description: 'convert a value to a string',
      value: toString,
    });

    this.define({
      type: 'value',
      linkname: 'number',
      description: 'convert a value to a number',
      value: toNumber,
    });

    this.define({
      type: 'value',
      linkname: 'bool',
      description: 'convert a value to a boolean',
      value: toBool,
    });

    this.define({
      type: 'value',
      linkname: 'range',
      description:
        'Generates a list of numbers. \n\nUsage: `range([start,] end)` where `start` is optional and defaults to 0.',
      value: range,
    });

    this.define({
      type: 'value',
      linkname: 'None',
      description: 'Represents a None value, similar to null or undefined.',
      value: None,
    });
  }
}
