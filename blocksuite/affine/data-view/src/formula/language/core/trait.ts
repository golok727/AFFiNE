import type { Trait } from './types.js';
import type { ValueConstructor } from './value.js';

export function defineTrait<T>(id: string): Trait<T> {
  return {
    id,
    _marker: undefined as never,
    map: <U>() => defineTrait<U>(id) as Trait<U>,
  };
}

const traitMap: Map<ValueConstructor, Map<string, any>> = new Map();

export function getImpl<T>(
  ctor: ValueConstructor,
  trait: Trait<T>
): Readonly<T>;
export function getImpl<T>(
  ctor: ValueConstructor,
  trait: Trait<T>,
  optional: true
): Readonly<T> | null;
export function getImpl<T>(
  ctor: ValueConstructor,
  trait: Trait<T>,
  optional?: boolean
): Readonly<T> | null {
  const implMap = traitMap.get(ctor);

  const impl = implMap?.get(trait.id);

  if (!impl && !optional) {
    throw new Error(`Trait ${trait.id} is not defined for ${ctor.name}.`);
  }

  return (impl ?? null) as Readonly<T> | null;
}

export function addImpl<T>(
  ctor: ValueConstructor,
  trait: Trait<T>,
  impl: T,
  replace = false
): void {
  if (!traitMap.has(ctor)) {
    traitMap.set(ctor, new Map());
  }
  const implMap = traitMap.get(ctor)!;

  if (implMap.has(trait.id) && !replace) {
    throw new Error(`Trait ${trait.id} is already defined for ${ctor.name}.`);
  }
  implMap.set(trait.id, impl);
}
