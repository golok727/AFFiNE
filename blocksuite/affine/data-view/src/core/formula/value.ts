import type { Value, ValueConstructor } from '../../formula';

export abstract class AbstractFormulaCellValue {
  abstract readonly value: Value;

  abstract toJSON(): unknown;

  toString(): string {
    return this.value.asString();
  }
}

export interface DataViewFormulaValueSpec<
  Cstr extends ValueConstructor = ValueConstructor,
  T extends AbstractFormulaCellValue = AbstractFormulaCellValue,
> {
  target: string;
  create: (value: InstanceType<Cstr>) => T;
  renderer: (cell: T) => unknown;
}

export function defineFormulaValue<
  Cstr extends ValueConstructor = ValueConstructor,
  T extends AbstractFormulaCellValue = AbstractFormulaCellValue,
>(
  cstr: Cstr,
  options: Omit<DataViewFormulaValueSpec<Cstr, T>, 'target'>
): DataViewFormulaValueSpec<Cstr, T> {
  return {
    target: cstr.typeHint,
    create: options.create,
    renderer: options.renderer,
  };
}
