import { type Arguments, Fn, type Value } from './core/index.js';

const NAME_VALIDATOR = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export type EnvDefineConfig<Env extends Environment = Environment> =
  | FunctionDefinition<Env>
  | ValueDefinition<Env>;

export type ValueDefinition<Env extends Environment = Environment> = {
  type: 'value';
  linkname: string;
  description?: string;
  override?: boolean;
  value: Value | ((env: Env) => Value);
};

export type FunctionDefinition<Env extends Environment = Environment> = {
  type: 'function';
  linkname: string;
  description?: string;
  fn: (env: Env, args: Arguments) => Value;
};

function validateName(name: string): void {
  if (!NAME_VALIDATOR.test(name)) {
    throw new Error(`Invalid name '${name}'.`);
  }
}
export class Environment {
  private readonly _values: Map<string, ValueDefinition> = new Map();

  get parent(): Environment | null {
    return this._parent;
  }

  constructor(protected _parent: Environment | null = null) {}

  set(name: string, value: Value, override: boolean = false): this {
    this.define({
      type: 'value',
      linkname: name,
      value,
      override: override,
    });
    return this;
  }

  get(name: string): Value | null {
    const variable = this._values.get(name);
    if (variable) {
      return typeof variable.value === 'function'
        ? variable.value(this)
        : variable.value;
    }
    return this._parent?.get(name) ?? null;
  }

  define(def: EnvDefineConfig<this>): this {
    if (def.type === 'function') {
      this.define({
        type: 'value',
        linkname: def.linkname,
        description: def.description,
        override: false,
        value: new Fn(args => def.fn(this, args), def.linkname),
      });
    } else if (def.type === 'value') {
      validateName(def.linkname);
      if (!def.override && this._values.has(def.linkname)) {
        throw new Error(`Name '${def.linkname}' is already defined.`);
      }
      this._values.set(def.linkname, def as ValueDefinition);
    }

    return this;
  }

  setParent(parent: Environment): this {
    if (parent === this) {
      return this;
    }
    this._parent = parent;
    return this;
  }
}
