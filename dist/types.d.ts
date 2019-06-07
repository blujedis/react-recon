import { Reducer, Context, Consumer } from 'react';
export declare type Dispatch<A extends IAction = IAction> = <T extends A>(action: T, ...args: any[]) => T;
export declare type GetState<S> = (cb?: (state: S) => void) => S;
export declare type Thunk<A extends IAction = IAction, S = any, WithArgs extends any[] = any> = (dispatch: Dispatch<A>, getState: GetState<S>, ...withArgs: WithArgs) => void;
export declare type Dispatcher<S = any, A extends IAction = IAction, WithArgs extends any[] = any> = Dispatch<A> | ((...args: any) => Thunk<A, S, WithArgs>);
export interface IAction<T = any> {
    type: T;
    payload?: any;
    [key: string]: any;
}
export declare type ActionResult<T = any> = IAction<T>;
export declare type ActionThunkResult<A extends IAction = IAction, S = any, WithArgs extends any[] = any> = Thunk<A, S, WithArgs>;
export interface IMiddlewareStore<D extends Dispatch = Dispatch, S = any, WithArgs extends any[] = any> {
    dispatch: D;
    getState: GetState<S>;
    withArgs: WithArgs;
}
export declare type MiddlewareApplied<S, D extends Dispatch = Dispatch> = (store: IMiddlewareStore<D, S>) => (action: any) => void;
export declare type Middleware<DispatchExt = {}, S = any, D extends Dispatch = Dispatch, WithArgs extends any[] = any> = (store: IMiddlewareStore<D, S, WithArgs>) => (next: Dispatch<IAction>) => (action: any) => any;
export interface IStoreProps<S, WithArgs extends any[] = any> {
    reducer?: Reducer<S, any>;
    initialState?: S;
    children?: JSX.Element;
    withArgs?: WithArgs;
}
export interface IStore<S, A extends IAction = IAction, WithArgs extends any[] = any> {
    Context: Context<[S?, Dispatcher<S, A, WithArgs>?]>;
    Provider: (props: IStoreProps<S>) => JSX.Element;
    Consumer: Consumer<[S?, Dispatcher<S, A, WithArgs>?]>;
    useStore(): [S?, Dispatcher<S, A, WithArgs>?];
    useStore<T extends IAction>(): [S?, Dispatcher<S, T | A, WithArgs>?];
}
