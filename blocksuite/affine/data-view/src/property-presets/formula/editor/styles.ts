import { css } from '@emotion/css';
import { cssVarV2 } from '@toeverything/theme/v2';

export const formulaEditorStyle = css({
  position: 'absolute',
  zIndex: 2,
  color: cssVarV2('text/primary'),
  border: `0.5px solid ${cssVarV2('layer/insideBorder/blackBorder')}`,
  borderRadius: '8px',
  backgroundColor: cssVarV2.layer.background.overlayPanel,
  boxShadow: 'var(--affine-shadow-1)',
  fontFamily: 'var(--affine-font-family)',
  maxWidth: '400px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  '@media print': {
    display: 'none',
  },
});
export const editorContainerStyle = css({
  display: 'flex',
  gap: '.4rem',
  flexDirection: 'column',
  width: 'auto',
});

export const editorInputStyle = css({
  width: '100%',
  height: '100%',
  padding: '8px 2px',
});

export const editorHeaderStyle = css({});
export const editorInputContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  borderRadius: '4px',
  backgroundColor: cssVarV2.input.background,
});
export const editorFooterStyle = css({});
