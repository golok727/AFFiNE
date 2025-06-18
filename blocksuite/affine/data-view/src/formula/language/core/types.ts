export type Trait<T> = {
  readonly id: symbol;
  readonly label: string;
  _marker?: T;
};
