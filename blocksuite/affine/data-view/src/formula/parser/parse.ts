import {
  ArrayExpr,
  AssignmentExpr,
  BinaryExpr,
  binaryOpFromTokenKind,
  CallExpr,
  ConditionalExpr,
  EmptyExpr,
  type Expr,
  getOpPrecedence,
  Ident,
  LambdaExpr,
  LetExpr,
  LiteralExpr,
  MemberExpr,
  UnaryExpr,
  UnaryOp,
} from '../ast/index.js';
import { span, type SrcSpan } from '../span.js';
import { FormulaParseError, ParseErrorKind } from './error.js';
import { Lexer } from './lexer.js';
import { type Token, TokenKind } from './token.js';

export class Parser {
  private readonly tokens: Lexer;
  private t0: Token | null = null;
  private t1: Token | null = null;

  constructor(public readonly source: string) {
    this.tokens = new Lexer(source);
    this.t0 = this.tokens.next();
    this.t1 = this.tokens.next();
  }

  private _nextToken(): Token | null {
    const cur = this.t0;
    const next = this.tokens.next();
    this.t0 = this.t1;
    this.t1 = next;
    return cur;
  }

  private _nextIs(kind: TokenKind): boolean {
    return this.t0?.kind === kind;
  }

  private _parseSeriesOf<T>(
    parse: () => T | null,
    delim: TokenKind | null
  ): T[] {
    const items: T[] = [];
    while (true) {
      const item = parse();
      if (item === null) {
        break;
      }

      items.push(item);

      if (!delim) {
        continue;
      }

      if (this._nextIs(delim)) {
        this._nextToken(); // consume the delimiter
      } else {
        break;
      }
    }
    return items;
  }

  private _expectOne(kind: TokenKind, error?: () => FormulaParseError): Token {
    if (this.t0?.kind === kind) {
      return this._nextToken()!;
    }

    if (error) {
      throw error();
    }
    const start = this.t0?.span.start ?? this.source.length;
    throw FormulaParseError.ExpectedToken(kind, {
      start,
      end: start + 1,
    });
  }

  private _parseParenthesized<T>(parse: () => T): { result: T } & SrcSpan {
    const start = this._expectOne(TokenKind.LParen).span.start; // consume '('
    const result = parse();
    const end = this._expectOne(TokenKind.RParen).span.end; // consume ')'
    return { result, start, end };
  }

  /*
		 [(expr)? (, expr)*] // Array literal
	*/
  private _parseArrayExpr(): ArrayExpr {
    const startSpan = this._expectOne(TokenKind.LBracket).span; // consume '['
    const elements = this._parseSeriesOf(
      () => this._parseExpr(),
      TokenKind.Comma
    );
    const endSpan = this._expectOne(TokenKind.RBracket).span; // consume ']'

    return new ArrayExpr(elements, span(startSpan.start, endSpan.end));
  }

  /*
		| (param) (, param)* | body-expr     // Regular lambda with parameters
		|| body-expr                         // Lambda with empty parameter list
	*/
  private _parseLambdaExpr() {
    const mayBeEmptyParams = this._nextIs(TokenKind.Or); // check for '||' which is also logical OR
    let params: Ident[] = [];
    let paramDelimSpan: SrcSpan;

    if (!mayBeEmptyParams) {
      const start = this._expectOne(TokenKind.Pipe).span.start; // consume '|'
      params = this._parseSeriesOf(() => this._parseIdent(), TokenKind.Comma);
      const end = this._expectOne(TokenKind.Pipe).span.end; // consume '|'
      paramDelimSpan = span(start, end);
    } else {
      paramDelimSpan = this._expectOne(TokenKind.Or).span; // consume '||'
    }

    const body = this._parseExpr();
    if (!body) {
      const errSpan = span(paramDelimSpan.end, paramDelimSpan.end + 1);
      throw new FormulaParseError(
        ParseErrorKind.EmptyLambda,
        errSpan,
        `Expected a expression after lambda parameters, but found nothing.`
      );
    }

    return new LambdaExpr(
      params,
      body,
      span(paramDelimSpan.start, body.span.end)
    );
  }

  /**
	  expr((args: expr)*,)
	 */
  private _parseFnCall(callee: Expr): Expr {
    const { result: args, end } = this._parseParenthesized(() => {
      let argsList = this._parseSeriesOf(() => {
        return this._parseExpr();
      }, TokenKind.Comma);
      return argsList;
    });

    const fn = new CallExpr(callee, args, span(callee.span.start, end));

    return this._tryParsePostFixExpr(fn);
  }
  /**
	 	expr.ident
		expr.ident.ident
	 */
  private _parseMemberExpr(referer: Expr): Expr {
    this._expectOne(TokenKind.Dot); // consume '.'

    let property = this._parseIdent();
    let member = new MemberExpr(
      referer,
      property,
      span(referer.span.start, property.span.end)
    );

    return this._tryParsePostFixExpr(member);
  }

  private _parseIdent(): Ident {
    const start = this.t0?.span.start ?? this.source.length;

    const token = this._nextToken(); // consume the identifier

    if (!token || token.kind !== TokenKind.Ident) {
      throw new FormulaParseError(
        ParseErrorKind.ExpectedIdentifier,
        span(start, start + 1),
        `Expected an identifier but found '${token?.kind ?? TokenKind.Eof}'`
      );
    }

    const name = token.source(this.source);
    return new Ident(name, token.span);
  }

  /*
			expr ? (consequent: expr) : (alternate: expr)
		*/
  private _parseTernaryExpr(condition: Expr): Expr {
    const startSpan = this._expectOne(TokenKind.Question).span; // consume '?'
    const consequent = this._parseExpr();
    if (!consequent) {
      throw new FormulaParseError(
        ParseErrorKind.ExpectedExpression,
        span(startSpan.start, startSpan.start + 1),
        "Expected an expression after '?' in ternary expression"
      );
    }
    this._expectOne(TokenKind.Colon); // consume ':'
    const alternate = this._parseExpr();
    if (!alternate) {
      throw new FormulaParseError(
        ParseErrorKind.ExpectedExpression,
        span(startSpan.start, startSpan.start + 1),
        "Expected an expression after ':' in ternary expression"
      );
    }

    return new ConditionalExpr(
      condition,
      consequent,
      alternate,
      span(startSpan.start, alternate.span.end)
    );
  }

  /*
		ident = expr
	*/
  private _tryParseAssignment(): AssignmentExpr | null {
    if (this._nextIs(TokenKind.Ident) && this.t1?.kind === TokenKind.Eq) {
      const ident = this._expectOne(TokenKind.Ident);
      this._expectOne(TokenKind.Eq); // consume '='
      const value = this._parseExpr();
      if (!value) {
        throw new FormulaParseError(
          ParseErrorKind.ExpectedExpression,
          span(ident.span.end, ident.span.end + 1),
          `Expected an expression after '=' in assignment to '${ident.source(
            this.source
          )}'`
        );
      }
      return new AssignmentExpr(
        new Ident(ident.source(this.source), ident.span),
        value,
        span(ident.span.start, value.span.end)
      );
    }

    return null;
  }
  /**
	 `let ( (ident = expr) (, (ident = expr))* (, )? body-expr )`

	 * Parses a let expression with the syntax:
	 * let(binding1 = expr1, binding2 = expr2, ..., bodyExpr)
	 *
	 * Where:
	 * - Each binding assigns a value to an identifier
	 * - Multiple bindings are separated by commas
	 * - The final expression is the body that can reference the bound variables
	 * - The comma between the last binding and body is optional
	 *
	 * Examples:
	 *   let(x = 10, y = 20, x + y)
	 *   let(x = 10, y = 20 x + y)
	 *   let(x = 10 x * 2)
	 */
  private _parseLetExpr(): Expr {
    const start = this._expectOne(TokenKind.Let).span.start; // consume 'let'

    const { result, end } = this._parseParenthesized(() => {
      const bindings = this._parseSeriesOf(() => {
        return this._tryParseAssignment();
      }, TokenKind.Comma);

      if (bindings.length === 0) {
        throw new FormulaParseError(
          ParseErrorKind.EmptyLetBindings,
          span(start, start + 1),
          `Expected at least one binding in 'let' expression`
        );
      }

      let body: Expr | null = this._parseExpr();

      if (!body) {
        throw new FormulaParseError(
          ParseErrorKind.EmptyLetBody,
          span(start, start + 1),
          `Expected a body expression after bindings in 'let' expression`
        );
      }

      return {
        bindings,
        body,
      };
    });

    return new LetExpr(result.bindings, result.body, span(start, end));
  }
  /*
		if (condition:expr, consequent: expr, alternate: expr)
	 */
  private _parseIfExpr(): Expr {
    const start = this._expectOne(TokenKind.If).span.start; // consume 'if'

    const { result, end } = this._parseParenthesized(() => {
      const start = this.t0?.span.start ?? this.source.length;
      // we can use seriesOf here but we just make it strict
      const condition = this._parseExpr();
      if (!condition) {
        throw FormulaParseError.MissingArguments(
          TokenKind.If,
          3,
          0,
          span(start, start + 1)
        );
      }

      let sep = this._expectOne(TokenKind.Comma);
      const consequent = this._parseExpr();

      if (!consequent) {
        throw FormulaParseError.MissingArguments(
          TokenKind.If,
          3,
          1,
          span(sep.span.end, sep.span.end + 1)
        );
      }

      sep = this._expectOne(TokenKind.Comma);
      const alternate = this._parseExpr();

      if (!alternate) {
        throw FormulaParseError.MissingArguments(
          TokenKind.If,
          3,
          2,
          span(sep.span.end, sep.span.end + 1)
        );
      }

      return {
        condition,
        consequent,
        alternate,
      };
    });

    return new ConditionalExpr(
      result.condition,
      result.consequent,
      result.alternate,
      span(start, end)
    );
  }

  /*
		expr.member
		(expr)()
		expr[index]
		expr ? consequent : alternate
	*/
  private _tryParsePostFixExpr(prefix: Expr): Expr {
    if (this._nextIs(TokenKind.LParen)) {
      return this._parseFnCall(prefix);
    } else if (this._nextIs(TokenKind.Dot)) {
      return this._parseMemberExpr(prefix);
    } else if (this._nextIs(TokenKind.LBracket)) {
      throw new Error('Index access is not implemented yet.');
    }

    // todo index access
    return prefix;
  }

  // Parse a single unit of expression
  private _parseExprUnit(): Expr | null {
    const parseExprUnit = () => {
      if (!this.t0) return null;
      switch (this.t0.kind) {
        case TokenKind.Number: {
          const token = this._nextToken()!; // consume the literal
          const value = Number(token.source(this.source));
          if (isNaN(value)) {
            throw new FormulaParseError(
              ParseErrorKind.InvalidNumberLiteral,
              token.span,
              `Invalid number literal: ${token.source(this.source)}`
            );
          }
          return new LiteralExpr(value, token.span);
        }
        case TokenKind.String: {
          const token = this._nextToken()!; // consume the literal
          const rawString = token.source(this.source).slice(1, -1); // remove quotes
          const processedString = this._processEscapeSequences(rawString);
          return new LiteralExpr(processedString, token.span);
        }
        case TokenKind.Boolean: {
          const token = this._nextToken()!; // consume the literal
          const value = token.source(this.source) === 'true';
          return new LiteralExpr(value, token.span);
        }
        case TokenKind.If: {
          return this._parseIfExpr();
        }
        case TokenKind.Let: {
          return this._parseLetExpr();
        }
        case TokenKind.Ident: {
          return this._parseIdent();
        }
        case TokenKind.LParen: {
          return this._parseParenthesized(() => {
            const expr = this._parseExpr();
            if (!expr) {
              throw new FormulaParseError(
                ParseErrorKind.ExpectedExpression,
                this.t0?.span ?? {
                  start: this.source.length,
                  end: this.source.length + 1,
                },
                `Expected an expression inside parentheses, but found nothing.`
              );
            }
            return expr;
          }).result;
        }
        // lambda expr
        case TokenKind.Pipe:
        case TokenKind.Or: {
          return this._parseLambdaExpr();
        }
        case TokenKind.LBracket: {
          return this._parseArrayExpr();
        }
        case TokenKind.Not: {
          const not = this._nextToken()!; // consume 'not'
          const expr = this._parseExprUnit();
          if (!expr) {
            throw new FormulaParseError(
              ParseErrorKind.ExpectedExpression,
              not.span,
              `Expected an expression after '${not.source(this.source)}'.`
            );
          }
          return new UnaryExpr(
            UnaryOp.Not,
            expr,
            span(not.span.start, expr.span.end)
          );
        }
        case TokenKind.Minus: {
          const minus = this._nextToken()!; // consume '-'
          const expr = this._parseExprUnit();
          if (!expr) {
            throw new FormulaParseError(
              ParseErrorKind.ExpectedExpression,
              minus.span,
              `Expected an expression after '${minus.source(this.source)}'.`
            );
          }
          return new UnaryExpr(
            UnaryOp.Negate,
            expr,
            span(minus.span.start, expr.span.end)
          );
        }
        default:
          return null;
      }
    };

    const expr = parseExprUnit();

    return expr ? this._tryParsePostFixExpr(expr) : expr;
  }

  private getOpPrecedence(kind: TokenKind | null) {
    if (!kind) return null;
    const op = binaryOpFromTokenKind(kind);
    if (!op) return null;
    return getOpPrecedence(op);
  }

  private _parseExpr(): Expr | null {
    const exprStack: Expr[] = [];
    const opStack: OpWithPrecedence[] = [];

    for (;;) {
      const exprUnit = this._parseExprUnit();

      if (exprUnit) {
        exprStack.push(exprUnit);
      } else if (exprStack.length === 0) {
        return null;
      } else {
        let errLoc = span(this.source.length, this.source.length + 1);
        if (this.t0) {
          errLoc = { start: this.t0.span.start - 1, end: this.t0.span.end - 1 };
        }
        // no expr after operator
        throw new FormulaParseError(
          ParseErrorKind.ExpectedExpression,
          errLoc,
          `Expected an expression, but found nothing after operator.`
        );
      }

      const mayBeOp = this.t0;
      const precedence = this.getOpPrecedence(mayBeOp?.kind ?? null);

      if (precedence !== null) {
        this._nextToken(); // consume the operator token
        handleOp(
          {
            token:
              mayBeOp! /* getOpPrecedence will return null if token is null */,
            precedence,
          },
          opStack,
          exprStack,
          opExprReducer
        );
      } else {
        break;
      }
    }

    const expr = handleOp(null, opStack, exprStack, opExprReducer);
    if (expr && this._nextIs(TokenKind.Question)) {
      return this._parseTernaryExpr(expr);
    }
    return expr;
  }

  parse(): Expr {
    const res = this._parseExpr();

    if (this.t0) {
      throw new FormulaParseError(
        ParseErrorKind.ExpectedEndOfExpression,
        span(this.t0.span.start, this.t0.span.end),
        `Expected end of expression found '${this.t0.source(this.source)}'`
      );
    }

    return res ?? new EmptyExpr(span(0, 0));
  }

  private _processEscapeSequences(str: string): string {
    return str.replace(/\\(.)/g, (_, char) => {
      switch (char) {
        case 'n':
          return '\n';
        case 't':
          return '\t';
        case 'r':
          return '\r';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case 'v':
          return '\v';
        case '0':
          return '\0';
        case '\\':
          return '\\';
        case '"':
          return '"';
        case "'":
          return "'";
        default:
          return char;
      }
    });
  }
}

type OpWithPrecedence = { token: Token; precedence: number };

function handleOp(
  nextOp: OpWithPrecedence | null,
  opStack: OpWithPrecedence[],
  exprStack: Expr[],
  reducer: (op: Token, exprStack: Expr[]) => void
): Expr | null {
  let nxtOp = nextOp;

  for (;;) {
    const op = opStack.pop();
    if (!op && !nxtOp) {
      // if we don't have any operators left return the final expr
      const expr = exprStack.pop();

      if (!expr) return null;

      if (exprStack.length === 0) return expr;

      throw new Error(
        '@@internal Expression not fully reduced for some reason'
      );
    }

    if (!op && nxtOp) {
      opStack.push(nxtOp);
      break;
    }

    if (op && !nxtOp) {
      reducer(op.token, exprStack);
    } else if (op && nxtOp) {
      const { token: opl, precedence: pl } = op;
      const { token: opr, precedence: pr } = nxtOp;
      if (pl >= pr) {
        reducer(opl, exprStack);
        nxtOp = { token: opr, precedence: pr };
      } else {
        opStack.push({ token: opl, precedence: pl });
        opStack.push({ token: opr, precedence: pr });
        break;
      }
    } else break;
  }
  return null;
}

function opExprReducer(opTok: Token, exprStack: Expr[]) {
  const right = exprStack.pop();
  const left = exprStack.pop();

  if (!left || !right)
    throw new Error(
      '@@internal Cant reduce expression. required minimum of 2 expr'
    );

  const op = binaryOpFromTokenKind(opTok.kind);
  if (op === null)
    throw new Error(`@@internal invalid binary op token ${opTok.kind}`);

  const expr = new BinaryExpr(
    left,
    op,
    right,
    span(left.span.start, right.span.end)
  );
  exprStack.push(expr);
}
