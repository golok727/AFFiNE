import type { Value } from '../expression';
import type { PropertyModel } from '../property';
import type { GetRawValueFromConfig } from './../property/types';

export type PropertyToValueFn<
  P extends PropertyModel = PropertyModel,
  V extends Value = Value,
> = (cell: GetRawValueFromConfig<P['config']>) => V;

/**
 * How to convert a property to a value.
 */
export type PropertyToValueConfig<
  P extends PropertyModel = PropertyModel,
  V extends Value = Value,
> = {
  propertyType: P['type'];
  convert: PropertyToValueFn<P, V>;
};

export function createPropertyToValueConfig<
  P extends PropertyModel<any, any, any, any>,
  V extends Value = Value,
>(model: P, convert: PropertyToValueFn<P, V>): PropertyToValueConfig<P, V> {
  return {
    propertyType: model.type,
    convert,
  };
}
