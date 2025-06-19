import zod from 'zod';

import { propertyType } from '../../core/property/property-config.js';
import { AbstractFormulaCellValue } from './logic/value.js';
import {
  FormulaCellValueSchema,
  formulaDataType,
  FormulaPropertySchema,
} from './types.js';

export const formulaPropertyType = propertyType('formula');
export const formulaPropertyModelConfig = formulaPropertyType.modelConfig({
  name: 'Formula',
  propertyData: {
    schema: FormulaPropertySchema,
    default: () => ({ code: '(random() * 10).floor()' }),
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
    schema: FormulaCellValueSchema,
    isEmpty: () => false,
    type: () => formulaDataType.instance(),
  },
});
