import zod from 'zod';

import { defineDataType } from '../../core/logical/data-type';

export const FormulaPropertySchema = zod.object({
  code: zod.string(),
});

export const FormulaCellValueSchema = zod.string().nullable();

export type FormulaPropertyData = zod.infer<typeof FormulaPropertySchema>;
export const formulaDataType = defineDataType(
  'Formula',
  FormulaPropertySchema,
  FormulaCellValueSchema
);
