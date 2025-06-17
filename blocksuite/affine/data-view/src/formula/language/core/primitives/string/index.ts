import {
  AddTrait,
  type Eq,
  EqTrait,
  NotTrait,
  OrdTrait,
} from '../../op/index.js';
import { implPropertyAccessor } from '../../utils.js';
import { BoolValueImpl } from '../bool/impl.js';
import { implCoreArithmetic } from '../common.js';
import { StringValueImpl } from './impl.js';
import { StringValue } from './string.js';

implCoreArithmetic(StringValue);
implPropertyAccessor(StringValue);

StringValue.addImpl(AddTrait, StringValueImpl, /* Replace*/ true)
  .addImpl(OrdTrait, StringValueImpl)
  .addImpl<Eq<StringValue>>(EqTrait, StringValueImpl);
// inherit from boolean
StringValue.addImpl(NotTrait, BoolValueImpl);

export * from './impl.js';
export * from './string.js';
