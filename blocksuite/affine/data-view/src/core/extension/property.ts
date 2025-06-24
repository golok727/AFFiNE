import {
  createIdentifier,
  type ServiceIdentifier,
} from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import type { GetPropertyMetaConfigFromModel } from '../property';
import type { ConvertFunction, PropertyConvert } from '../property/convert';
import type {
  PropertyMetaConfig,
  PropertyModel,
} from '../property/property-config';
import { DataViewExtension, type DataViewExtensionContext } from './dataview';

export const PropertyMetaConfigIdentifier =
  createIdentifier<PropertyMetaConfig>('DataViewPropertyMetaConfig');
export const PropertyConvertIdentifier = createIdentifier<ConvertFunction>(
  'DataViewPropertyConvert'
);

export type PropertyExtensionConfig<
  Model extends PropertyModel<any, any, any, any>,
> = {
  setup?: (context: DataViewExtensionContext) => void;
  // This only runs once when the extension is set up. eg register lit elements.
  effect?: () => void;
  meta: GetPropertyMetaConfigFromModel<Model>;
  converts?: PropertyConvert<Model, PropertyModel<any, any, any, any>>[];
};

export function PropertyExtension<
  Model extends PropertyModel<any, any, any, any>,
>(model: Model, config: PropertyExtensionConfig<Model>): ExtensionType {
  let effectRan = false;
  const identifier = PropertyMetaConfigIdentifier(model.type);
  return DataViewExtension({
    name: `PropertyExtension(${model.type})`,
    setup(context) {
      const di = context.di;

      if (!effectRan) {
        config.effect?.();
        effectRan = true;
      }

      di.addValue(identifier, config.meta);

      config.converts?.forEach(convert => {
        di.addValue(
          getPropertyConvertIdentifier(convert.from, convert.to),
          convert.convert
        );
      });

      config.setup?.(context);
    },
  });
}

export function getPropertyConvertIdentifier(
  from: string,
  to: string
): ServiceIdentifier<ConvertFunction> {
  return PropertyConvertIdentifier(`${from}-${to}`);
}
