import {
  createIdentifier,
  type ServiceIdentifier,
} from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import { type DataSource } from '../data-source';
import type { GetPropertyMetaConfigFromModel } from '../property';
import type { ConvertFunction, PropertyConvert } from '../property/convert';
import type {
  PropertyMetaConfig,
  PropertyModel,
} from '../property/property-config';
import {
  DataViewExtension,
  type DataViewExtensionContext,
  type DataViewExtensionType,
} from './dataview';

export const PropertyMetaConfigIdentifier =
  createIdentifier<PropertyMetaConfig>('DataViewPropertyMetaConfig');
export const PropertyConvertIdentifier = createIdentifier<ConvertFunction>(
  'DataViewPropertyConvert'
);

type AnyPropertyModel = PropertyModel<any, any, any, any>;

export type PropertyExtensionConfig<Model extends AnyPropertyModel> = {
  setup?: (context: DataViewExtensionContext) => void;
  // This only runs once when the extension is set up. eg register lit elements.
  effect?: () => void;
  meta: GetPropertyMetaConfigFromModel<Model>;
  converts?: (
    | PropertyConvert<Model, AnyPropertyModel>
    | PropertyConvert<AnyPropertyModel, Model>
  )[];
};

/**
 * ``` ts
 *  const FormulaPropertyExtension = PropertyExtension({
 *  meta: 'formula,
 *  converts: [], // converts for this property
 *  filter: [],
 *  setup({di, dataSource}) {
 *    di.addValue(FormulaService, new FormulaService(dataSource));
 * }
 * effect: () => {
 *  customElements.define(FormulaCell, "formula-cell");
 * customElements.define(FormulaEditor, "formula-editor");
 * }
 * })
 * ```
 */
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

export class PropertyManager {
  constructor(private readonly dataSource: DataSource) {}

  getAllPropertyMeta(): PropertyMetaConfig[] {
    return Array.from(
      this.dataSource.provider.getAll(PropertyMetaConfigIdentifier).values()
    );
  }

  getConvertFunction(from: string, to: string): ConvertFunction | null {
    return (
      this.dataSource.provider.getOptional(
        getPropertyConvertIdentifier(from, to)
      ) ?? null
    );
  }
}

export const PropertyManagerExtension: DataViewExtensionType = {
  setup({ di, dataSource }) {
    di.addValue(PropertyManager, new PropertyManager(dataSource));
  },
};

export function getPropertyManager(dataSource: DataSource): PropertyManager {
  const mgr = dataSource.serviceGet(PropertyManager);
  if (!mgr) {
    throw new Error('PropertyManager is not available for this data source');
  }
  return mgr;
}
