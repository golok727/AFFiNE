import { t } from '../../../core';
import { NumberValue, type Value } from '../../../formula';
import { numberPropertyModelConfig } from '../../number/define';
import {
  AbstractFormulaEvaluatedValue,
  createPropertyToValueConfig,
  defineFormulaEvalValue,
} from '../logic';

export class FormulaEvaluatedNumberValue extends AbstractFormulaEvaluatedValue {
  override value: Value;
  override type = t.number.instance();

  constructor(value: NumberValue) {
    super();
    this.value = value;
  }

  override toJSON(): unknown {
    return this.value.asNumber();
  }
}

export const numberPropertyToFormulaValue = createPropertyToValueConfig(
  numberPropertyModelConfig,
  val => new NumberValue(val ?? 0)
);

export const formulaNumberValueSpec = defineFormulaEvalValue(NumberValue, {
  create: value => new FormulaEvaluatedNumberValue(value),
  renderer: value => {
    // todo allow number like behavior eg formatting etc..
    return value.value.asString();
  },
});
