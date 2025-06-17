import { defineTrait } from '../trait.js';
import type {
  Add,
  Call,
  Div,
  Eq,
  Mul,
  Neg,
  Not,
  Ord,
  PropertyAccessor,
  Rem,
  Sub,
} from './types.js';

export const AddTrait = defineTrait<Add>('_core_AddTrait');
export const SubTrait = defineTrait<Sub>('_core_SubTrait');
export const MulTrait = defineTrait<Mul>('_core_MulTrait');
export const DivTrait = defineTrait<Div>('_core_DivTrait');
export const RemTrait = defineTrait<Rem>('_core_RemTrait');
export const OrdTrait = defineTrait<Ord>('_core_OrdTrait');
export const EqTrait = defineTrait<Eq>('_core_EqTrait');
export const NegTrait = defineTrait<Neg>('_core_NegTrait');
export const NotTrait = defineTrait<Not>('_core_NotTrait');
export const CallTrait = defineTrait<Call>('_core_CallTrait');
export const PropertyAccessorTrait = defineTrait<PropertyAccessor>(
  '_core_PropertyAccessorTrait'
);

export * from './types.js';
