import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';

import type { DataSource } from '../../../core';
import { FormulaServiceIdentifier } from '../logic';
import {
  editorContainerStyle,
  editorHeaderStyle,
  editorInputContainer,
  editorInputStyle,
  formulaEditorStyle,
} from './styles';

export class FormulaEditor extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  private readonly _code$ = signal('');

  set code(value: string) {
    this._code$.value = value;
  }

  @property()
  accessor onSave!: ((code: string) => void) | undefined;

  @property({ type: Object })
  accessor dataSource!: DataSource;

  get formulaService() {
    return this.dataSource.serviceGet(FormulaServiceIdentifier);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add(formulaEditorStyle);
  }

  private readonly _onCodeChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    this._code$.value = target.value;
  };

  private readonly _handleSave = () => {
    const code = this._code$.value;
    this.onSave?.(code);
  };

  override render() {
    return html`
      <div class="${editorContainerStyle}">
        <div class="${editorHeaderStyle}">
          <span>Formula Editor</span>
        </div>
        <div class="${editorInputContainer}">
          <span>=</span>
          <input
            type="text"
            @input="${this._onCodeChange}"
            .value="${this._code$.value}"
            class="${editorInputStyle}"
            placeholder="Enter your formula here..."
          />
        </div>
        <div class="${editorHeaderStyle}">
          <button @click=${this._handleSave} class="formula-editor-save-button">
            Save
          </button>
          <button class="formula-editor-cancel-button">Cancel</button>
        </div>
      </div>
    `;
  }
}
