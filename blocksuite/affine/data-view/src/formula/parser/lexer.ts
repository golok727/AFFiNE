import { span, type SrcSpan } from '../span.js';
import { Cursor } from './cursor.js';
import { FormulaParseError, ParseErrorKind } from './error.js';
import { Token, TokenKind, tryGetKeywordFromString } from './token.js';

export class Lexer implements Iterable<Token> {
  private chars: Cursor<string>;

  constructor(public readonly source: string) {
    this.chars = new Cursor(source.split(''));
  }

  /**
   * 	Creates a clone of the lexer with the same source and character cursor.
   */
  clone(): Lexer {
    const clone = new Lexer(this.source);
    clone.chars = this.chars.clone();
    return clone;
  }

  [Symbol.iterator](): Iterator<Token, any, any> {
    return {
      next: () => {
        const token = this.nextToken();
        return {
          value: token,
          done: token.kind === TokenKind.Eof,
        };
      },
    };
  }

  nextToken(): Token {
    const [kind, span] = this._nextKind();
    return new Token(kind, span);
  }

  next(): Token | null {
    const token = this.nextToken();
    if (token.kind === TokenKind.Eof) {
      return null;
    }
    return token;
  }

  private _nextKind(): [TokenKind, SrcSpan] {
    const start = this.offset;
    const c = this.chars.next();
    if (c === undefined) {
      return [TokenKind.Eof, span(start, this.offset)];
    }
    let kind: TokenKind = TokenKind.Unknown;

    if (this._isNameStart(c)) {
      kind = this._parseNameOrKeyword(start);
    } else if (this._isWhitespace(c)) {
      this.skipWhitespace();
      return this._nextKind();
    } else if (this._isNumberStart(c)) {
      kind = this._parseNumber(c, start);
    } else {
      kind = this._parseSingleChar(c, start);
    }

    const end = this.offset;

    if (kind === TokenKind.Unknown) {
      throw new FormulaParseError(
        ParseErrorKind.UnexpectedToken,
        span(start, end),
        `Unexpected character '${c}' at position ${start}`
      );
    }

    return [kind!, span(start, end)];
  }

  /* PARSE NAME BEGIN*/
  private _isNameStart(c: string): boolean {
    return /^[a-zA-Z_]$/.test(c);
  }

  private _isNameContinuation(c?: string): boolean {
    return c !== undefined && /^[a-zA-Z0-9_]$/.test(c);
  }

  private _parseNameOrKeyword(startPos: number): TokenKind {
    while (this._isNameContinuation(this.chars.peek())) {
      this.chars.next();
    }
    let nameOrKeyword = this.source.slice(startPos, this.offset);
    const keyword = tryGetKeywordFromString(nameOrKeyword);
    return keyword ?? TokenKind.Ident;
  }
  /**PARSE NAME END */

  private _isWhitespace(c?: string): boolean {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
  }

  private skipWhitespace(): void {
    while (this._isWhitespace(this.chars.peek())) {
      this.chars.next();
    }
  }

  /* Parse number begin */
  private _isNumberStart(c: string): boolean {
    return /^[0-9]$/.test(c);
  }

  private _consumeHexNumber() {
    for (;;) {
      let nextHex = this.chars.peek();
      if (nextHex === undefined || !/[0-9a-fA-F]/.test(nextHex)) break;
      this.chars.next(); // consume the character
    }
  }

  private _consumeBinaryChars() {
    for (;;) {
      let nextBin = this.chars.peek();
      if (nextBin === undefined || !/[01]/.test(nextBin)) break;
      this.chars.next(); // consume the character
    }
  }
  private _consumeOctalChars() {
    for (;;) {
      this.chars.next(); // consume the character
      let nextOct = this.chars.peek();
      if (nextOct === undefined || !/[0-7]/.test(nextOct)) break;
    }
  }

  private _consumeDecimalChars() {
    for (;;) {
      let nextDec = this.chars.peek();
      if (nextDec === undefined || !/[0-9]/.test(nextDec)) break;
      this.chars.next(); // consume the character
    }
  }

  private _parseNumberOfRadix(radix: 2 | 8 | 10 | 16): boolean {
    const start = this.offset;
    switch (radix) {
      case 2:
        this._consumeBinaryChars();
        break;
      case 8:
        this._consumeOctalChars();
        break;
      case 10:
        this._consumeDecimalChars();
        break;
      case 16:
        this._consumeHexNumber();
        break;
      default:
        throw new Error(`Unsupported radix: ${radix}`);
    }
    return this.offset !== start;
  }

  private _consumeDecimalPart() {
    let hasDecimal = this._parseNumberOfRadix(10);

    let next = this.chars.peek();

    if (hasDecimal && next && /^[eE]$/.test(next)) {
      this.chars.next(); // consume 'e' or 'E'
      this._consumeExponentPart();
    }
    return hasDecimal;
  }

  private _consumeExponentPart() {
    let next = this.chars.peek();
    if (next === '+' || next === '-') {
      this.chars.next(); // consume the sign
    }

    if (!this._parseNumberOfRadix(10)) {
      throw new FormulaParseError(
        ParseErrorKind.EmptyExponent,
        span(this.offset, this.offset),
        `Empty exponent part at position ${this.offset}`
      );
    }
  }

  private _parseDecimalNumber() {
    this._parseNumberOfRadix(10);
    let next = this.chars.peek();
    if (next && /^[eE.]$/.test(next)) {
      let next = this.chars.next()!; // consume 'e' or 'E' or '.'
      if (next === '.') {
        this._consumeDecimalPart();
      } else {
        this._consumeExponentPart();
      }
    }
  }

  private _parseNumber(char: string, start: number): TokenKind {
    if (char === '0') {
      const next = this.chars.peek();
      if (next === 'x' || next === 'X') {
        this.chars.next(); // consume the 'x' or 'X'
        if (!this._parseNumberOfRadix(16)) {
          throw new FormulaParseError(
            ParseErrorKind.InvalidHexLiteral,
            span(start, this.offset),
            `Invalid hexadecimal number`
          );
        }
      } else if (next === 'b' || next === 'B') {
        this.chars.next(); // consume the 'b' or 'B'
        if (!this._parseNumberOfRadix(2)) {
          throw new FormulaParseError(
            ParseErrorKind.InvalidHexLiteral,
            span(start, this.offset),
            `Invalid binary number`
          );
        }
      } else if (next === 'o' || next === 'O') {
        this.chars.next(); // consume the 'o' or 'O'
        if (!this._parseNumberOfRadix(8)) {
          throw new FormulaParseError(
            ParseErrorKind.InvalidOctalLiteral,
            span(start, this.offset),
            `Invalid octal number`
          );
        }
      } else {
        this._parseDecimalNumber();
      }
    } else {
      this._parseDecimalNumber();
    }

    return TokenKind.Number;
  }
  /* Parse number end */

  private _consumeQuotedString(quoteChar: string, start: number): TokenKind {
    for (;;) {
      let next = this.chars.peek();
      if (next === undefined) {
        throw new FormulaParseError(
          ParseErrorKind.UnterminatedStringLiteral,
          span(start, this.offset),
          `Unterminated string starting at position ${start}`
        );
      }
      if (next === quoteChar) {
        this.chars.next(); // consume the closing quote
        return TokenKind.String;
      } else {
        this.chars.next(); // consume the character
      }
    }
  }

  private _parseSingleChar(c: string, start: number): TokenKind {
    switch (c) {
      case '+':
        return TokenKind.Plus;
      case '-':
        return TokenKind.Minus;
      case '*':
        return TokenKind.Star;
      case '/':
        return TokenKind.Slash;
      case '%':
        return TokenKind.Modulo;
      case '\\':
        return TokenKind.BackSlash;
      case '(':
        return TokenKind.LParen;
      case ')':
        return TokenKind.RParen;
      case '[':
        return TokenKind.LBracket;
      case ']':
        return TokenKind.RBracket;
      case ',':
        return TokenKind.Comma;
      case '&': {
        const next = this.chars.peek();
        if (next === '&') {
          this.chars.next(); // consume the next '&'
          return TokenKind.And;
        }
        return TokenKind.Unknown; // single '&' is not supported
      }
      case '|': {
        const next = this.chars.peek();
        if (next === '|') {
          this.chars.next(); // consume the next '|'
          return TokenKind.Or;
        }
        return TokenKind.Pipe;
      }
      case '<': {
        const next = this.chars.peek();
        if (next === '=') {
          this.chars.next(); // consume the next '='
          return TokenKind.LtEq;
        }
        return TokenKind.Lt;
      }
      case '>': {
        const next = this.chars.peek();
        if (next === '=') {
          this.chars.next(); // consume the next '='
          return TokenKind.GtEq;
        }
        return TokenKind.Gt;
      }
      case '=': {
        const next = this.chars.peek();
        if (next === '=') {
          this.chars.next(); // consume the next '='
          return TokenKind.EqEq;
        }
        return TokenKind.Eq;
      }
      case '!': {
        const next = this.chars.peek();
        if (next === '=') {
          this.chars.next(); // consume the next '='
          return TokenKind.NotEq;
        }
        return TokenKind.Not;
      }
      case '.': {
        const next = this.chars.peek();
        if (next && this._isNumberStart(next)) {
          this._consumeDecimalPart();
          return TokenKind.Number;
        }
        return TokenKind.Dot;
      }
      case '?': {
        return TokenKind.Question;
      }
      case ':': {
        return TokenKind.Colon;
      }
      case "'":
      case '"': {
        return this._consumeQuotedString(c, start);
      }
      default: {
        return TokenKind.Unknown;
      }
    }
  }

  private get offset(): number {
    return this.source.length - this.chars.remaining;
  }
}
