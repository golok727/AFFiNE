import zod from 'zod';

import { propertyType } from '../../core/property/property-config.js';
import { formulaDataType, FormulaPropertySchema } from './types.js';

export const formulaPropertyType = propertyType('formula');

export const formulaPropertyModelConfig = formulaPropertyType.modelConfig({
  name: 'Formula',
  propertyData: {
    schema: FormulaPropertySchema,
    default: () => ({ code: '' }),
  },
  rawValue: {
    // cached value
    schema: zod.any().nullable(),
    default: () => null,
    toString: function (config): string {
      return config.value?.toString() ?? '';
    },
    fromString: config => {
      return {
        value: config.value,
        data: { code: config.data.code },
      };
    },
    toJson: config => {
      return config.value ?? undefined;
    },
    fromJson: _config => {
      return undefined;
    },
  },
  jsonValue: {
    schema: zod.any().nullable(),
    isEmpty: () => false,
    type: () => formulaDataType.instance(),
  },
});
