import type { Expr, Visit, Visitor } from '../ast/index.js';
import { FormulaParseError } from '../parser/error.js';
import { Parser } from '../parser/parse.js';
import { FormulaPrinter } from './../ast/index.js';

export class CompilationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompilationError';
  }
}

export class Formula implements Visit {
  private _root: Expr | null = null;

  constructor(
    public readonly source: string,
    public readonly name: string = 'Unnamed formula'
  ) {}

  visit<Result = unknown>(visitor: Visitor<Result>): Result {
    if (!this._root) {
      throw new Error('Formula is not compiled.');
    }
    return this._root.visit(visitor);
  }

  isCompiled(): boolean {
    return this._root !== null;
  }

  compile(): this {
    const error = this.compileSafe()[1];
    if (error) {
      throw error;
    }
    return this;
  }

  compileSafe():
    | [formula: Formula, error: null]
    | [formula: null, error: Error] {
    try {
      const parser = new Parser(this.source);
      const root = parser.parse();
      this._root = root;
      return [this, null];
    } catch (e) {
      if (e instanceof FormulaParseError) {
        return [
          null,
          new CompilationError(
            `ParseError: ${e.message} at [${e.span.start}:${e.span.end}]`
          ),
        ];
      }
      throw e;
    }
  }

  toString(_pretty?: boolean): string {
    const str = this._root?.visit(new FormulaPrinter());
    return str ?? '<not compiled>';
  }
}
