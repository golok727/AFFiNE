export type SrcSpan = {
  start: number;
  end: number;
};

export function stringifySpan(span: SrcSpan): string {
  return `[${span.start}:${span.end}]`;
}

export function span(start: number, end: number): SrcSpan {
  return { start, end };
}

export function mergeSpans(span1: SrcSpan, span2: SrcSpan): SrcSpan {
  return {
    start: Math.min(span1.start, span2.start),
    end: Math.max(span1.end, span2.end),
  };
}
