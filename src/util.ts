export interface IDeferred<T> {
  resolve: IFun<T>;
  reject: IFun<Error>;
  promise: Promise<T>;
}

export interface IFun<T> {
  (value?: T | PromiseLike<T> | undefined): void;
}

function defer<T>(): IDeferred<T> {
  let resolve: IFun<T>;
  let reject: IFun<Error>;

  let promise: Promise<T> = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return {
    // @ts-ignore
    resolve,
    // @ts-ignore
    reject,
    promise,
  };
}

export { defer };
