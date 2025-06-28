import { createIdentifier } from '@blocksuite/global/di';

import type { Property } from '../../../core';
import type { DataSource } from './../../../core/data-source/base';
import {
  Environment,
  Fn,
  Formula,
  FormulaRuntime,
  Instance,
  None,
  StringValue,
  type Value,
} from './../../../formula';
import type { PropertyToValueConvert } from './convert';
import {
  type AbstractFormulaEvaluatedValue,
  type DataViewFormulaEvalValueSpec,
  unknownFormulaValueSpec,
} from './value';

export type DataViewFormulaConfig = {
  valueSpecs: DataViewFormulaEvalValueSpec[];
  converts: PropertyToValueConvert[];
};

export type EvaluationOptions = {
  code: string;
  propertyId: string;
  rowId: string;
};

export interface CompiledFormula {
  code: string;
  formula: Formula;
  error?: Error;
}

class RowEnvironment extends Environment {
  constructor(
    private readonly rowId: string,
    private readonly propertyId: string,
    private readonly service: FormulaService
  ) {
    super(service._runtime);

    console.log(
      'RowEnvironment created for rowId:',
      this.rowId,
      'propertyId:',
      this.propertyId
    );

    const prop = new Fn(args => {
      const view = this.service.datasource.viewManager.currentView$.value;
      if (!view) {
        return None;
      }

      const propNameValue = args.get(0);
      if (propNameValue.isNone()) {
        return None;
      }

      const propName = propNameValue.asString();
      console.log(propName);

      const property = view.propertiesRaw$.value.find(
        p => p.name$.value === propName
      );

      if (!property) {
        console.error(`Property '${propName}' not found in view.`);
        return None;
      }

      return this.service.propertyToValue(property, this.rowId);
    });

    this.define({
      type: 'value',
      linkname: 'prop',
      description: 'Get a property value',
      value: prop,
    });
  }
}

export class FormulaService {
  readonly _valueSpecs: Record<string, DataViewFormulaEvalValueSpec>;
  readonly _converts: Record<string, PropertyToValueConvert>;
  readonly _runtime: FormulaRuntime;

  readonly _formulaCache: Map<string, CompiledFormula> = new Map();

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

  propertyToValue(property: Property, rowId: string): Value {
    const type = property.type$.value;
    console.log('datatype', property.dataType$.value?.name);

    const convert = this._converts[type];
    if (!convert) {
      const stringValue = property.stringValueGet(rowId);
      if (!stringValue) {
        return new StringValue('');
      }
      return new StringValue(stringValue);
    }

    const value = property.valueGet(rowId);
    return convert.convert(value);
  }

  /**
   * Compiles the given formula and caches the result if the property ID is provided.
   */
  compile({
    code,
    propertyId,
  }: {
    code: string;
    propertyId?: string;
  }): Formula | null {
    console.log('Compile formula for', propertyId, `code = '${code}'`);

    const { formula, error } = new Formula(
      code,
      propertyId ? `formula:${propertyId}` : 'formula'
    ).compileSafe();

    if (error) {
      return null;
    }

    if (propertyId) {
      this._formulaCache.set(propertyId, {
        code,
        formula,
      });
    }

    return formula;
  }

  private _getValueSpec(value: Value): DataViewFormulaEvalValueSpec {
    const typeHint = value.typeHint;
    return this._valueSpecs[typeHint] ?? unknownFormulaValueSpec;
  }

  private _evaluateToValue(
    formula: Formula,
    propertyId: string,
    rowId: string
  ): AbstractFormulaEvaluatedValue | null {
    const instance = new Instance(
      formula,
      new RowEnvironment(rowId, propertyId, this)
    );

    try {
      const result = instance.eval();
      const valueSpec = this._getValueSpec(result);
      return valueSpec.create(result);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return null;
    }
  }

  private _getCachedFormula(code: string, propertyId: string) {
    const cache = this._formulaCache.get(propertyId);
    if (cache && cache.code === code) {
      return cache.formula;
    }
    this._formulaCache.delete(propertyId);
    return null;
  }

  getCellValue({
    code,
    propertyId,
    rowId,
  }: EvaluationOptions): AbstractFormulaEvaluatedValue | null {
    const cachedFormula = this._getCachedFormula(code, propertyId);

    if (cachedFormula) {
      return this._evaluateToValue(cachedFormula, propertyId, rowId);
    }

    const formula = this.compile({ code, propertyId });
    if (!formula) {
      return null;
    }

    return this._evaluateToValue(formula, propertyId, rowId);
  }

  render(value: AbstractFormulaEvaluatedValue) {
    const spec = this._getValueSpec(value.value);
    return spec.renderer(value);
  }
}

export const FormulaServiceIdentifier = createIdentifier<FormulaService>(
  'affine-data-view-formula-service'
);

export interface EvaluationResult {
  value: Value;
  error?: Error;
}
