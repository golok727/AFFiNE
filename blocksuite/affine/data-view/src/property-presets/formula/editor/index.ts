import {
  createPopup,
  type PopupTarget,
} from '@blocksuite/affine-components/context-menu';
import { autoPlacement, offset, shift } from '@floating-ui/dom';

import type { DataSource } from '../../../core/data-source';
import { FormulaEditor } from './formula-editor.js';

export * from './formula-editor.js';

export interface FormulaEditorPopupOptions {
  code: string;
  dataSource: DataSource;
  onComplete?: () => void;
  onSave?: (code: string) => void;
  container?: HTMLElement;
}
export function popFormulaEditor(
  target: PopupTarget,
  options: FormulaEditorPopupOptions
) {
  const editor = new FormulaEditor();
  editor.code = options.code;
  editor.onSave = options.onSave;

  const remove = createPopup(target, editor, {
    onClose: options.onComplete,
    middleware: [
      autoPlacement({
        allowedPlacements: [
          'bottom-start',
          'bottom-end',
          'top-start',
          'top-end',
        ],
      }),
      offset({ mainAxis: -36 }),
      shift(),
    ],
    container: options.container,
  });

  return remove;
}
