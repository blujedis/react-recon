import { Reducer, Context, Consumer } from 'react';

export type Dispatch<A extends IAction = IAction> = <T extends A>(action: T) => T;

export type getState<S> = () => S;

export type Thunk<A extends IAction = IAction, S = any> = (dispatch: Dispatch<A>, getState: () => S) => void;

export type Dispatcher<S = any, A extends IAction = IAction> = Dispatch<A> | ((...args: any) => Thunk<A, S>);

export interface IAction<T = any> {
  type: T;
  payload?: any;
  [key: string]: any;
}

export type ActionResult<T = any> = IAction<T>;

export type ActionThunkResult<A extends IAction = IAction, S = any> = Thunk<A, S>;

export interface IMiddlewareStore<D extends Dispatch = Dispatch, S = any> {
  dispatch: D;
  getState: getState<S>;
}

export type MiddlewareApplied<S, D extends Dispatch = Dispatch> =
  (store: IMiddlewareStore<D, S>) => (action: any) => void;

export type Middleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch>
  = (store: IMiddlewareStore<D, S>) => (
    next: Dispatch<IAction>
  ) => (action: any) => any;

export interface IStoreProps<S> {
  reducer?: Reducer<S, any>;
  initialState?: S;
  children?: JSX.Element;
}

export interface IStore<S, A extends IAction = IAction> {
  Context: Context<[S?, Dispatcher<S, A>?]>;
  Provider: (props: IStoreProps<S>) => JSX.Element;
  Consumer: Consumer<[S?, Dispatcher<S, A>?]>;
  useStore(): [S?, Dispatcher<S, A>?];
  // Allow use of default action specifying only
  // the type for convenience, specify second
  // param to define custom action.
  useStore<T extends IAction>(): [S?, Dispatcher<S, T | A>?];
}
