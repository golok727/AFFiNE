import { t, type TypeInstance } from '../../../core';
import type { Value, ValueConstructor } from '../../../formula';

export abstract class AbstractFormulaEvaluatedValue {
  abstract readonly value: Value;
  abstract readonly type: TypeInstance;

  abstract toJSON(): unknown;

  toString(): string {
    return this.value.asString();
  }
}

export interface DataViewFormulaEvalValueSpec<
  Cstr extends ValueConstructor = ValueConstructor,
  T extends AbstractFormulaEvaluatedValue = AbstractFormulaEvaluatedValue,
> {
  target: string;
  create: (value: InstanceType<Cstr>) => T;
  renderer: (cell: T) => unknown;
}

export function defineFormulaEvalValue<
  Cstr extends ValueConstructor = ValueConstructor,
  T extends AbstractFormulaEvaluatedValue = AbstractFormulaEvaluatedValue,
>(
  cstr: Cstr,
  options: Omit<DataViewFormulaEvalValueSpec<Cstr, T>, 'target'>
): DataViewFormulaEvalValueSpec<Cstr, T> {
  return {
    target: cstr.typeHint,
    create: options.create,
    renderer: options.renderer,
  };
}

export class UnknownFormulaValue extends AbstractFormulaEvaluatedValue {
  override type: TypeInstance = t.unknown.instance();

  constructor(public override value: Value) {
    super();
  }

  override toJSON(): unknown {
    return this.value.asString();
  }
}

export const unknownFormulaValueSpec: DataViewFormulaEvalValueSpec = {
  target: 'unknown',
  create: (value: Value) => new UnknownFormulaValue(value),
  renderer: (cell: UnknownFormulaValue) => {
    return cell.value.asString();
  },
};
