import type { DataViewFormulaConfig } from './logic';
import {
  formulaNumberValueSpec,
  numberPropertyToFormulaValue,
} from './presets/number';

export const defaultDataViewFormulaConfig: DataViewFormulaConfig = {
  valueSpecs: [formulaNumberValueSpec] as never,
  converts: [numberPropertyToFormulaValue] as never,
};
