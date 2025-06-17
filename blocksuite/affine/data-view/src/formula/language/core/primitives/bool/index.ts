import { type Eq, EqTrait, NotTrait, OrdTrait } from '../../op/index.js';
import { implPropertyAccessor } from '../../utils.js';
import { implCoreArithmetic } from '../common.js';
import { NumberValueImpl } from '../number/impl.js';
import { BooleanValue } from './bool.js';
import { BoolValueImpl } from './impl.js';

BooleanValue.addImpl<Eq<BooleanValue>>(EqTrait, BoolValueImpl)
  .addImpl(NotTrait, BoolValueImpl)
  .addImpl(OrdTrait, NumberValueImpl);

implCoreArithmetic(BooleanValue);
implPropertyAccessor(BooleanValue);

export * from './bool.js';
export * from './impl.js';
