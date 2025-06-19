import zod from 'zod';

import { defineDataType } from '../../core/logical/data-type';
import { AbstractFormulaCellValue } from './logic';

export const FormulaPropertySchema = zod.object({
  code: zod.string(),
});

export const FormulaCellValueSchema = zod
  .custom<AbstractFormulaCellValue>(
    data => data instanceof AbstractFormulaCellValue
  )
  .nullable();

export type FormulaPropertyData = zod.infer<typeof FormulaPropertySchema>;
export const formulaDataType = defineDataType(
  'Formula',
  FormulaPropertySchema,
  FormulaCellValueSchema
);
