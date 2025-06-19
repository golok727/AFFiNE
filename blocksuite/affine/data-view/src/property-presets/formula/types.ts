import zod from 'zod';

export const FormulaPropertySchema = zod.object({
  code: zod.string(),
});

export type FormulaPropertyData = zod.infer<typeof FormulaPropertySchema>;
