export type Trait<T> = {
  readonly id: string;
  _marker?: T;
  map<U>(): Trait<U>;
};
