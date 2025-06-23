import { popupTargetFromElement } from '@blocksuite/affine-components/context-menu';
import { computed } from '@preact/signals-core';
import { html } from 'lit';

import { BaseCellRenderer, createFromBaseCellRenderer } from '../../core';
import { formulaPropertyModelConfig } from './define';
import { popFormulaEditor } from './editor';
import { FormulaServiceIdentifier } from './logic';
import { formulaCellStyle } from './style';
import { type FormulaPropertyData } from './types';

export class FormulaCell extends BaseCellRenderer<
  unknown,
  FormulaPropertyData,
  FormulaPropertyData
> {
  closeEditor?: () => void;

  private readonly openEditor = () => {
    this.closeEditor = popFormulaEditor(popupTargetFromElement(this), {
      code: this.property.data$.value.code,
      dataSource: this.view.manager.dataSource,
      onSave: this._onEditorSave,
    });
  };

  private readonly _onEditorSave = (code: string) => {
    this.property.dataUpdate(() => ({ code }));
  };

  get formulaService() {
    return this.view.serviceGet(FormulaServiceIdentifier);
  }

  private readonly _code$ = computed(() => {
    return this.property.data$.value.code;
  });

  private readonly _evalValue$ = computed(() => {
    const service = this.formulaService;

    if (!service) {
      console.error('Formula service not found');
      return;
    }

    const res = service.getCellValue({
      code: this.property.data$.value.code,
      propertyId: this.property.id,
      rowId: this.cell.rowId,
    });

    this.valueSetNextTick(res?.toJSON() ?? null);

    return res;
  });

  override connectedCallback() {
    this.style.position = 'relative';
    super.connectedCallback();
    this._disposables.add(this._code$.subscribe(this._evaluate));
  }

  override afterEnterEditingMode() {
    if (!this.closeEditor) {
      this.openEditor();
    }
  }

  override beforeExitEditingMode() {
    requestAnimationFrame(() => {
      this.closeEditor?.();
      this.closeEditor = undefined;
    });
  }

  private readonly _evaluate = () => {};

  private _renderContent() {
    const value = this._evalValue$.value;

    if (!value) {
      return html`<div>
        <span>Fail</span>
      </div>`;
    }

    const service = this.formulaService;
    if (!service) {
      throw new Error('Formula property used without service initialized');
    }

    return service.render(value);
  }

  override render() {
    return html`
      <div class="${formulaCellStyle}">${this._renderContent()}</div>
    `;
  }
}

export const formulaPropertyConfig =
  formulaPropertyModelConfig.createPropertyMeta({
    // todo add icon
    cellRenderer: {
      view: createFromBaseCellRenderer(FormulaCell),
    },
  });
