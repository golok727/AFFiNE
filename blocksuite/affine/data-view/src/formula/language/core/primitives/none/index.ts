import {
  EqTrait,
  NotTrait,
  OrdTrait,
  PropertyAccessorTrait,
} from '../../op/index.js';
import type { Eq } from '../../op/types.js';
import { BoolValueImpl } from '../bool/impl.js';
import { implCoreArithmetic } from '../common.js';
import { NumberValueImpl } from '../number/impl.js';
import { NoneValueImpl } from './impl.js';
import { NoneValue } from './none.js';

implCoreArithmetic(NoneValue);

NoneValue.addImpl<Eq<NoneValue>>(EqTrait, NoneValueImpl)
  .addImpl(NotTrait, BoolValueImpl)
  .addImpl(OrdTrait, NumberValueImpl)
  .addImpl(PropertyAccessorTrait, {
    getProperty(_, prop: string): NoneValue {
      throw new Error(`Cannot access property '${prop}' on None value.`);
    },
  });

export * from './impl.js';
export * from './none.js';
