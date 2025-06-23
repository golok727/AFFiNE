import { FormulaCell } from './cell-renderer';
import { FormulaEditor } from './editor';

export function formulaPropertyEffects() {
  customElements.define('affine-database-formula-cell', FormulaCell);
  customElements.define('affine-database-formula-editor', FormulaEditor);
}
