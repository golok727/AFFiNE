import type {
  ArrayExpr,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  ConditionalExpr,
  EmptyExpr,
  Ident,
  LambdaExpr,
  LetExpr,
  LiteralExpr,
  MemberExpr,
  UnaryExpr,
} from './ast.js';

export interface Visitor<Result = unknown> {
  visitAssignExpr(expr: AssignmentExpr): Result;
  visitLetExpr(expr: LetExpr): Result;
  visitConditionalExpr(expr: ConditionalExpr): Result;
  visitArrayExpr(expr: ArrayExpr): Result;
  visitEmptyExpr(expr: EmptyExpr): Result;
  visitLiteralExpr(expr: LiteralExpr): Result;
  visitIdent(expr: Ident): Result;
  visitBinaryExpr(expr: BinaryExpr): Result;
  visitUnaryExpr(expr: UnaryExpr): Result;
  visitCallExpr(expr: CallExpr): Result;
  visitMemberExpr(expr: MemberExpr): Result;
  visitLambdaExpr(expr: LambdaExpr): Result;
}

export interface Visit {
  visit<Result>(visitor: Visitor<Result>): Result;
}
