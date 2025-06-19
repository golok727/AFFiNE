import type { PropertyModel } from './../../../core/property/property-config';
import type { GetRawValueFromConfig } from './../../../core/property/types';
import type { Value } from './../../../formula';

export type PropertyToValueFn<
  P extends PropertyModel = PropertyModel,
  V extends Value = Value,
> = (cell: GetRawValueFromConfig<P['config']>) => V;

/**
 * How to convert a property to a value.
 */
export type PropertyToValueConvert<
  P extends PropertyModel = PropertyModel,
  V extends Value = Value,
> = {
  propertyType: P['type'];
  convert: PropertyToValueFn<P, V>;
};

export function createPropertyToValueConfig<
  P extends PropertyModel<any, any, any, any>,
  V extends Value = Value,
>(model: P, convert: PropertyToValueFn<P, V>): PropertyToValueConvert<P, V> {
  return {
    propertyType: model.type,
    convert,
  };
}
