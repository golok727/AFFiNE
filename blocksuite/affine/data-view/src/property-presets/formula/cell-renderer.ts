import { html } from 'lit';

import { BaseCellRenderer, createFromBaseCellRenderer } from '../../core';
import type { AbstractFormulaCellValue } from '../../core/formula';
import { FormulaServiceIdentifier } from '../../core/formula/service';
import { formulaPropertyModelConfig } from './define';
import { type FormulaPropertyData } from './types';

export class FormulaCell extends BaseCellRenderer<
  AbstractFormulaCellValue | null,
  FormulaPropertyData
> {
  get formulaService() {
    return this.view.serviceGet(FormulaServiceIdentifier);
  }

  // private readonly _instance = computed(() => {
  //   this.property.data$.value.code;
  //   return this.formulaService?.getInstance(this.property.id);
  // });

  override render() {
    return html`<div>Hello formula</div>`;
  }
}

export const formulaPropertyConfig =
  formulaPropertyModelConfig.createPropertyMeta({
    // todo add icon
    cellRenderer: {
      view: createFromBaseCellRenderer(FormulaCell),
    },
  });
