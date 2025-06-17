import type {
  ArrayExpr,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  ConditionalExpr,
  Ident,
  LambdaExpr,
  LetExpr,
  LiteralExpr,
  MemberExpr,
  UnaryExpr,
  Visitor,
} from '../ast/index.js';
import { BinaryOp } from '../ast/index.js';
import { stringifySpan } from '../span.js';
import {
  AddTrait,
  BooleanValue,
  CallTrait,
  DivTrait,
  EqTrait,
  Fn,
  List,
  MulTrait,
  NegTrait,
  None,
  NotTrait,
  NumberValue,
  OrdTrait,
  PropertyAccessorTrait,
  RemTrait,
  StringValue,
  SubTrait,
  type Value,
} from './core/index.js';
import { StringValueImpl } from './core/primitives/string/impl.js';
import { Environment } from './environment.js';

export class RefError extends Error {
  constructor(public ident: Ident) {
    super(`'${ident.name}' is not defined at ${stringifySpan(ident.span)}`);
    this.name = 'RefError';
  }
}

type StackFrame = {
  value: Value;
};

const MAX_CALL_STACK_DEPTH = 1000;
export class Evaluator implements Visitor<Value> {
  private _evaluationScope: Environment;
  private _callStack: StackFrame[] = [];

  constructor(public rootEnv: Environment) {
    this._evaluationScope = rootEnv;
  }

  private get _scope() {
    return this._evaluationScope;
  }

  private _capture(): Evaluator {
    const localEnv = new Environment(this._evaluationScope);
    const evaluator = new Evaluator(this.rootEnv);
    evaluator._evaluationScope = localEnv;
    evaluator._callStack = this._callStack;
    return evaluator;
  }

  visitAssignExpr(_: AssignmentExpr): Value {
    throw new Error('Should not reach here');
  }

  visitLetExpr(expr: LetExpr): Value {
    const local = this._capture();
    const env = local._scope;

    for (const binding of expr.bindings) {
      const value = binding.value.visit(local);
      env.set(binding.target.name, value, true);
    }

    return expr.body.visit(local);
  }

  visitConditionalExpr(expr: ConditionalExpr): Value {
    const condition = expr.condition.visit(this);
    return condition.asBoolean()
      ? expr.consequent.visit(this)
      : expr.alternate.visit(this);
  }

  visitLambdaExpr(expr: LambdaExpr): Value {
    // capture the current scope upon creation of the lambda
    const capture = this._capture();
    return new Fn(args => {
      // local variables for this lambda
      const local = capture._capture();
      const env = local._scope;
      expr.params.forEach((param, ix) =>
        env.set(param.name, args.get(ix), true)
      );
      return expr.body.visit(local);
    });
  }

  visitEmptyExpr(): Value {
    return None;
  }

  visitLiteralExpr(expr: LiteralExpr): Value {
    switch (typeof expr.value) {
      case 'string':
        return new StringValue(expr.value);
      case 'number':
        return new NumberValue(expr.value);
      case 'boolean':
        return new BooleanValue(expr.value);
      default:
        return None;
    }
  }

  visitIdent(ident: Ident): Value {
    const val = this._scope.get(ident.name);
    if (!val) {
      throw new RefError(ident);
    }
    return val;
  }

  visitArrayExpr(expr: ArrayExpr): Value {
    const items = expr.elements.map(el => el.visit(this));
    return new List(items);
  }

  visitBinaryExpr(expr: BinaryExpr): Value {
    const left = expr.left.visit(this);
    const right = expr.right.visit(this);
    switch (expr.operator) {
      case BinaryOp.Add: {
        if (left instanceof StringValue || right instanceof StringValue) {
          return StringValueImpl.add(left, right);
        }
        return left.getImpl(AddTrait).add(left, right);
      }
      case BinaryOp.Sub:
        return left.getImpl(SubTrait).sub(left, right);
      case BinaryOp.Mul:
        return left.getImpl(MulTrait).mul(left, right);
      case BinaryOp.Div:
        return left.getImpl(DivTrait).div(left, right);
      case BinaryOp.Mod:
        return left.getImpl(RemTrait).rem(left, right);
      case BinaryOp.Lt: {
        const ord = left.getImpl(OrdTrait).cmp(left, right);
        return new BooleanValue(ord < 0);
      }
      case BinaryOp.Gt: {
        const ord = left.getImpl(OrdTrait).cmp(left, right);
        return new BooleanValue(ord > 0);
      }
      case BinaryOp.LtEq: {
        const ord = left.getImpl(OrdTrait).cmp(left, right);
        return new BooleanValue(ord <= 0);
      }
      case BinaryOp.GtEq: {
        const ord = left.getImpl(OrdTrait).cmp(left, right);
        return new BooleanValue(ord >= 0);
      }
      case BinaryOp.Eq: {
        // todo handle errors for non impl
        return left.getImpl(EqTrait).eq(left, right);
      }
      case BinaryOp.NotEq: {
        // todo handle errors for non impl
        return left.getImpl(EqTrait).eq(left, right).not();
      }
      case BinaryOp.And: {
        return new BooleanValue(left.asBoolean() && right.asBoolean());
      }
      case BinaryOp.Or: {
        return new BooleanValue(left.asBoolean() || right.asBoolean());
      }
      default:
        throw new Error(`Invalid Operator ${expr.operator}`);
    }
  }

  visitUnaryExpr(expr: UnaryExpr): Value {
    const operand = expr.operand.visit(this);
    switch (expr.operator) {
      case '-':
        return operand.getImpl(NegTrait).neg(operand);
      case '!':
        return operand.getImpl(NotTrait).not(operand);
      default:
        throw new Error(`Invalid Unary Operator ${expr.operator}`);
    }
  }

  private _pushFrame(value: Value): void {
    if (this._callStack.length >= MAX_CALL_STACK_DEPTH) {
      throw new Error(`Maximum call stack depth exceeded`);
    }
    this._callStack.push({ value });
  }

  private _popFrame(): void {
    if (this._callStack.length === 0) {
      throw new Error(`Call stack is empty, something went wrong`);
    }
    this._callStack.pop();
  }

  visitCallExpr(expr: CallExpr): Value {
    const callee = expr.callee.visit(this);
    const args = expr.args.map(arg => arg.visit(this));

    const callable = callee.getImpl(CallTrait, true);

    if (!callable) {
      throw new Error(
        `'${expr.callee.toString()}' (type: ${
          callee.typeHint
        }) is not a function`
      );
    }

    this._pushFrame(callee);
    try {
      return callable.call(callee, args);
    } finally {
      this._popFrame();
    }
  }

  visitMemberExpr(expr: MemberExpr): Value {
    const referer = expr.referer.visit(this);
    const access = referer.getImpl(PropertyAccessorTrait);
    const property = access.getProperty(referer, expr.property.name);
    return property;
  }
}
