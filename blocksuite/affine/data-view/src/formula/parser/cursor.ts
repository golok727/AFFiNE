export class Cursor<T> {
  private _ix = 0;

  constructor(public readonly iter: T[]) {}

  get remaining(): number {
    return this.iter.length - this._ix;
  }

  clone(): Cursor<T> {
    const clone = new Cursor<T>(this.iter);
    clone._ix = this._ix;
    return clone;
  }

  next(): T | undefined {
    if (this._ix < this.iter.length) {
      return this.iter[this._ix++];
    }
    return undefined;
  }

  peek(): T | undefined {
    if (this._ix < this.iter.length) {
      return this.iter[this._ix];
    }
    return undefined;
  }
}
