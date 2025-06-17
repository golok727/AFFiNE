import type { SrcSpan } from '../span.js';
import type { TokenKind } from './token.js';

export const ParseErrorKind = {
  ExpectedExpression: 'ExpectedExpression',
  ExpectedEndOfExpression: 'ExpectedEndOfExpression',
  ExpectedToken: 'ExpectedToken',
  ExpectedIdentifier: 'ExpectedIdentifier',
  EmptyLambda: 'EmptyLambda',
  MissingArguments: 'MissingArguments',
  EmptyLetBindings: 'EmptyLetBindings',
  EmptyLetBody: 'EmptyLetBody',
  InvalidNumberLiteral: 'InvalidNumberLiteral',
  InvalidHexLiteral: 'InvalidHexLiteral',
  InvalidBinaryLiteral: 'InvalidBinaryLiteral',
  InvalidOctalLiteral: 'InvalidOctalLiteral',
  UnterminatedStringLiteral: 'UnterminatedStringLiteral',
  UnexpectedToken: 'UnexpectedToken',
  EmptyExponent: 'EmptyExponent',
} as const;

export type ParseErrorKind =
  (typeof ParseErrorKind)[keyof typeof ParseErrorKind];

export class FormulaParseError extends Error {
  constructor(
    public readonly kind: ParseErrorKind,
    public span: SrcSpan,
    message: string = ''
  ) {
    super(message, { cause: kind });
  }

  static MissingArguments(
    callee: string,
    required: number,
    got: number,
    span: SrcSpan
  ) {
    return new FormulaParseError(
      ParseErrorKind.MissingArguments,
      span,
      `Missing arguments for '${callee}': expected ${required}, got ${got}`
    );
  }

  static ExpectedToken(expectedKind: TokenKind, span: SrcSpan) {
    return new FormulaParseError(
      ParseErrorKind.ExpectedToken,
      span,
      `Expected '${expectedKind}'`
    );
  }
}
