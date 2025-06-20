import { computed } from '@preact/signals-core';
import { html } from 'lit';

import { BaseCellRenderer, createFromBaseCellRenderer } from '../../core';
import { formulaPropertyModelConfig } from './define';
import { FormulaServiceIdentifier } from './logic';
import { type FormulaPropertyData } from './types';

export class FormulaCell extends BaseCellRenderer<
  unknown,
  FormulaPropertyData,
  FormulaPropertyData
> {
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
    super.connectedCallback();
    this._disposables.add(this._code$.subscribe(this._evaluate));
  }

  private readonly _evaluate = () => {};

  override render() {
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

    return html`<div>${service.render(value)}</div>`;
  }
}

export const formulaPropertyConfig =
  formulaPropertyModelConfig.createPropertyMeta({
    // todo add icon
    cellRenderer: {
      view: createFromBaseCellRenderer(FormulaCell),
    },
  });
