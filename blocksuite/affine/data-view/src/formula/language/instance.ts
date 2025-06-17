import type { EnvDefineConfig, Environment } from './environment.js';
import { Evaluator } from './eval.js';
import type { Formula } from './formula.js';

export class Instance<Env extends Environment = Environment> {
  private readonly _evaluator: Evaluator;

  constructor(
    public readonly formula: Formula,
    public readonly environment: Env
  ) {
    if (!formula.isCompiled()) {
      throw new Error('Formula must be compiled before creating an instance.');
    }
    this._evaluator = new Evaluator(environment);
  }

  define(def: EnvDefineConfig<Env>): this {
    this.environment.define(def);
    return this;
  }

  eval() {
    return this.formula.visit(this._evaluator);
  }
}
