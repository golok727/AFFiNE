import type { FormulaRuntime } from '../../formula';
import type { DataSource } from '../data-source';
import type { PropertyToValueConfig } from './convert';
import type { DataViewFormulaValueSpec } from './value';

export interface DataViewFormulaRuntime extends FormulaRuntime {
  datasource: DataSource;
}

export type DataViewFormulaConfig = {
  runtime: DataViewFormulaRuntime;
  specs: DataViewFormulaValueSpec[];
  converts: PropertyToValueConfig[];
};
