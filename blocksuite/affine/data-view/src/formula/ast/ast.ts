import { TokenKind } from '../parser/token.js';
import type { SrcSpan } from '../span.js';

type Visitor<Result> = import('./visitor.js').Visitor<Result>;
type Visit = import('./visitor.js').Visit;

export abstract class Expr implements Visit {
  constructor(public readonly span: SrcSpan) {}

  source(src: string): string {
    return src.slice(this.span.start, this.span.end);
  }

  abstract visit<Result>(visitor: Visitor<Result>): Result;
}

export class EmptyExpr extends Expr {
  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitEmptyExpr(this);
  }
}

export class ArrayExpr extends Expr {
  constructor(
    public readonly elements: Expr[],
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitArrayExpr(this);
  }
}
export class LiteralExpr extends Expr {
  constructor(
    public readonly value: string | number | boolean,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitLiteralExpr(this);
  }
}

export class Ident extends Expr {
  constructor(
    public readonly name: string,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitIdent(this);
  }
}

export class BinaryExpr extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: BinaryOp,
    public readonly right: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitBinaryExpr(this);
  }
}

export class UnaryExpr extends Expr {
  constructor(
    public readonly operator: UnaryOp,
    public readonly operand: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitUnaryExpr(this);
  }
}

export class AssignmentExpr extends Expr {
  constructor(
    public readonly target: Ident,
    public readonly value: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitAssignExpr(this);
  }
}

export class LetExpr extends Expr {
  constructor(
    public readonly bindings: AssignmentExpr[],
    public readonly body: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitLetExpr(this);
  }
}

export class ConditionalExpr extends Expr {
  constructor(
    public readonly condition: Expr,
    public readonly consequent: Expr,
    public readonly alternate: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitConditionalExpr(this);
  }
}

export class LambdaExpr extends Expr {
  constructor(
    public readonly params: Ident[],
    public readonly body: Expr,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitLambdaExpr(this);
  }
}

export class CallExpr extends Expr {
  constructor(
    public readonly callee: Expr,
    public readonly args: Expr[],
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitCallExpr(this);
  }
}

export class MemberExpr extends Expr {
  constructor(
    public readonly referer: Expr,
    public readonly property: Ident,
    span: SrcSpan
  ) {
    super(span);
  }

  visit<Result>(visitor: Visitor<Result>): Result {
    return visitor.visitMemberExpr(this);
  }
}

export const BinaryOp = {
  Add: TokenKind.Plus,
  Sub: TokenKind.Minus,
  Mul: TokenKind.Star,
  Div: TokenKind.Slash,
  Mod: TokenKind.Modulo,
  Eq: TokenKind.EqEq,
  NotEq: TokenKind.NotEq,
  Lt: TokenKind.Lt,
  Gt: TokenKind.Gt,
  LtEq: TokenKind.LtEq,
  GtEq: TokenKind.GtEq,
  And: TokenKind.And,
  Or: TokenKind.Or,
} as const;

export type BinaryOp = (typeof BinaryOp)[keyof typeof BinaryOp];

export const UnaryOp = {
  Not: '!',
  Negate: '-',
} as const;

export type UnaryOp = (typeof UnaryOp)[keyof typeof UnaryOp];

export function binaryOpFromTokenKind(kind: TokenKind): BinaryOp | null {
  switch (kind) {
    case TokenKind.Plus:
    case TokenKind.Minus:
    case TokenKind.Star:
    case TokenKind.Slash:
    case TokenKind.Modulo:
    case TokenKind.EqEq:
    case TokenKind.NotEq:
    case TokenKind.Lt:
    case TokenKind.Gt:
    case TokenKind.LtEq:
    case TokenKind.GtEq:
    case TokenKind.And:
    case TokenKind.Or:
      return kind as BinaryOp;
    default:
      return null;
  }
}

export function getOpPrecedence(op: BinaryOp): number {
  // bigger the number higher the precedence
  switch (op) {
    case BinaryOp.Or:
      return 1;

    case BinaryOp.And:
      return 2;

    case BinaryOp.Eq:
    case BinaryOp.NotEq:
      return 3;

    case BinaryOp.Lt:
    case BinaryOp.LtEq:
    case BinaryOp.Gt:
    case BinaryOp.GtEq:
      return 4;

    case BinaryOp.Add:
    case BinaryOp.Sub:
      return 5;

    case BinaryOp.Mul:
    case BinaryOp.Div:
      return 6;

    case BinaryOp.Mod:
      return 6;

    // todo
    // case BinaryOp.Exp:
    // 	return 7;
  }
}
