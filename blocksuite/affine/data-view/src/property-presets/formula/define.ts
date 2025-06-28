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
    // store cached value as string
    schema: zod.string().nullable(),
    default: () => null,
    toString: config => {
      return config.value ?? '';
    },
    fromString: config => {
      return {
        value: config.value || null,
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
    schema: zod.string().nullable(),
    isEmpty: () => false,
    type: () => formulaDataType.instance(),
  },
});
