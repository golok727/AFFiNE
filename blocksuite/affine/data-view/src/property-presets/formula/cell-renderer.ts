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
  string,
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
    const service = this.view.serviceGet(FormulaServiceIdentifier);
    if (!service) {
      throw new Error(`Formula service not found!`);
    }
    return service;
  }

  private readonly _code$ = computed(() => {
    return this.property.data$.value.code;
  });

  private readonly _evalValue$ = computed(() => {
    const service = this.formulaService;

    const res = service.getCellValue({
      code: this.property.data$.value.code,
      propertyId: this.property.id,
      rowId: this.cell.rowId,
    });

    const strValue = res?.value.isNone() ? '' : (res?.toString() ?? '');
    this.valueSetNextTick(strValue);

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

    if (value?.value.isNone()) {
      return undefined;
    }

    const service = this.formulaService;

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
