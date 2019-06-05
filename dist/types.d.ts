import { Reducer, Context, Consumer } from 'react';
export declare type Dispatch<A extends IAction = IAction> = <T extends A>(action: T) => T;
export declare type getState<S> = () => S;
export declare type Thunk<A extends IAction = IAction, S = any> = (dispatch: Dispatch<A>, getState: () => S) => void;
export declare type Dispatcher<S = any, A extends IAction = IAction> = Dispatch<A> | ((...args: any) => Thunk<A, S>);
export interface IAction<T = any> {
    type: T;
    payload?: any;
    [key: string]: any;
}
export declare type ActionResult<T = any> = IAction<T>;
export declare type ActionThunkResult<A extends IAction = IAction, S = any> = Thunk<A, S>;
export interface IMiddlewareStore<D extends Dispatch = Dispatch, S = any> {
    dispatch: D;
    getState: getState<S>;
}
export declare type MiddlewareApplied<S, D extends Dispatch = Dispatch> = (store: IMiddlewareStore<D, S>) => (action: any) => void;
export declare type Middleware<DispatchExt = {}, S = any, D extends Dispatch = Dispatch> = (store: IMiddlewareStore<D, S>) => (next: Dispatch<IAction>) => (action: any) => any;
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
    useStore<T extends IAction>(): [S?, Dispatcher<S, T | A>?];
}
