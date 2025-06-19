import zod from 'zod';

import { AbstractFormulaCellValue } from '../../core/formula/value.js';
import { t } from '../../core/logical/type-presets.js';
import { propertyType } from '../../core/property/property-config.js';
import { FormulaPropertySchema } from './types.js';

export const formulaPropertyType = propertyType('formula');
export const formulaPropertyModelConfig = formulaPropertyType.modelConfig({
  name: 'Formula',
  propertyData: {
    schema: FormulaPropertySchema,
    default: () => ({ code: '' }),
  },
  rawValue: {
    schema: zod
      .custom<AbstractFormulaCellValue>(
        data => data instanceof AbstractFormulaCellValue
      )
      .nullable(),
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
      return config.value?.toJSON() ?? undefined;
    },
    fromJson: _config => {
      return undefined;
    },
  },
  jsonValue: {
    schema: zod
      .custom<AbstractFormulaCellValue | null>(
        data => data instanceof AbstractFormulaCellValue || data === null
      )
      .nullable(),
    isEmpty: () => false,
    type: () => {
      return t.unknown.instance();
    },
  },
});
