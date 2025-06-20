import zod from 'zod';

import { defineDataType } from '../../core/logical/data-type';
import { AbstractFormulaEvaluatedValue } from './logic';

export const FormulaPropertySchema = zod.object({
  code: zod.string(),
});

export const FormulaCellValueSchema = zod
  .custom<AbstractFormulaEvaluatedValue>(
    data => data instanceof AbstractFormulaEvaluatedValue
  )
  .nullable();

export type FormulaPropertyData = zod.infer<typeof FormulaPropertySchema>;
export const formulaDataType = defineDataType(
  'Formula',
  FormulaPropertySchema,
  FormulaCellValueSchema
);
