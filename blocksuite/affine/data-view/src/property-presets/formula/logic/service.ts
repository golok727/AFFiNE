import { createIdentifier } from '@blocksuite/global/di';

import type { Property } from '../../../core';
import { type FormulaPropertyData } from '../types';
import type { DataSource } from './../../../core/data-source/base';
import type { Formula, Value } from './../../../formula';
import { FormulaRuntime } from './../../../formula';
import type { PropertyToValueConvert } from './convert';
import type {
  AbstractFormulaCellValue,
  DataViewFormulaValueSpec,
} from './value';

export type DataViewFormulaConfig = {
  valueSpecs: DataViewFormulaValueSpec[];
  converts: PropertyToValueConvert[];
};

export type EvaluationOptions = {
  // accept the whole property to avoid extra type check
  property: Property<
    AbstractFormulaCellValue | null,
    FormulaPropertyData,
    FormulaPropertyData
  >;
  rowId: string;
};

export interface CompiledFormula {
  formula: Formula;
  error?: Error;
}

export class FormulaService {
  readonly _valueSpecs: Record<string, DataViewFormulaValueSpec>;
  readonly _converts: Record<string, PropertyToValueConvert>;
  readonly _runtime: FormulaRuntime;

  constructor(
    public readonly datasource: DataSource,
    config: DataViewFormulaConfig
  ) {
    this._runtime = new FormulaRuntime();
    this._valueSpecs = Object.fromEntries(
      config.valueSpecs.map(spec => [spec.target, spec])
    );
    this._converts = Object.fromEntries(
      config.converts.map(convert => [convert.propertyType, convert])
    );
  }

  getCellValue({
    rowId,
    property,
  }: EvaluationOptions): AbstractFormulaCellValue | null {
    const code = property.data$.value.code;
    console.log('Eval formula for', property.id, rowId, `code = '${code}'`);
    return null;
  }

  render(value: AbstractFormulaCellValue) {
    console.log(value);
    return 'Formula success!';
  }
}

export const FormulaServiceIdentifier = createIdentifier<FormulaService>(
  'affine-data-view-formula-service'
);

export interface EvaluationResult {
  value: Value;
  error?: Error;
}
