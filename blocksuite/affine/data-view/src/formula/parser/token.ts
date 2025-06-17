import type { SrcSpan } from '../span.js';

export const TokenKind = {
  Eof: 'eof',
  If: 'if',
  Let: 'let',
  Boolean: 'boolean',
  Number: 'number',
  String: 'string',
  Ident: 'ident',
  Plus: '+',
  Minus: '-',
  Star: '*',
  Slash: '/',
  Modulo: '%',
  BackSlash: '\\',
  LParen: '(',
  RParen: ')',
  LBracket: '[',
  RBracket: ']',
  Unknown: 'unknown',
  Comma: ',',
  Dot: '.',
  Eq: '=',
  EqEq: '==',
  NotEq: '!=',
  Not: '!',
  Lt: '<',
  Gt: '>',
  LtEq: '<=',
  GtEq: '>=',
  Colon: ':',
  Question: '?',
  And: '&&',
  Or: '||',
  Pipe: '|',
} as const;

export type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

export function tryGetKeywordFromString(kind: string): TokenKind | null {
  switch (kind) {
    case 'or':
      return TokenKind.Or;
    case 'and':
      return TokenKind.And;
    case 'not':
      return TokenKind.Not;
    case 'if':
      return TokenKind.If;
    case 'let':
      return TokenKind.Let;
    case 'true':
    case 'false':
      return TokenKind.Boolean;
    default:
      return null;
  }
}

export class Token {
  constructor(
    public readonly kind: TokenKind,
    public readonly span: SrcSpan,
    public readonly value: string | number | boolean | undefined = undefined
  ) {}

  source(src: string): string {
    return src.slice(this.span.start, this.span.end);
  }
  toString(): string {
    return `Token(kind = '${this.kind}')`;
  }
}
