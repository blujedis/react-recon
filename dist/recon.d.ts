import { Reducer } from 'react';
import { IStore, Middleware, Dispatch, IAction, MiddlewareApplied, IMiddlewareStore } from './types';
/**
 * Adds thunks to react-recon.
 */
export declare function thunkify<Ext = {}, S = any, D extends Dispatch = Dispatch, WithArgs extends any[] = any>(): Middleware<Ext, S, D, WithArgs>;
/**
 * Composes multiple functions into chain.
 *
 * @example
 * .compose(func1, func2, func3);
 *
 * @param funcs array of functions to chain.
 */
export declare function compose(...funcs: any[]): (...args: any[]) => void;
/**
 * Wraps middleware with access to context store.
 *
 * @example
 * .applyMiddleware(thunk, createLogger());
 *
 * @param middlewares the middleware functions to be wrapped.
 */
export declare function applyMiddleware<Ext = {}, S = any, D extends Dispatch = Dispatch, WithArgs extends any[] = any>(...middlewares: Middleware<Ext, S, D, WithArgs>[]): (store: IMiddlewareStore<D, S, any>) => (...args: any[]) => void;
/**
 * Combines reducers from key/value map into single executable wrapper that accepts state and action.
 *
 * @example
 * .combineReducers({
 *    app: (state, action) => { use switch/if then return state },
 *    user: (state, action) => { use switch/if then return state },
 * });
 *
 * @param reducers map of reducers to be combined.
 */
export declare function combineReducers(reducers: {
    [name: string]: Reducer<any, any>;
}): (state: any, action: any) => any;
/**
 * Create a new state store using Context API
 *
 * @example
 * const middleware = applyMiddleware(one, two, three);
 * const Store = createStore(middleware);
 *
 * @param middleware applied middleware to be run before reducers.
 */
export declare function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(middleware: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A, WithArgs>;
/**
 * Create a new state store using Context API
 *
 * @example
 * const initialState = { count: 0 }
 * const middleware = applyMiddleware(one, two, three);
 * const Store = createStore(initialState, middleware);
 *
 * @param initialState the initial state of the store.
 * @param middleware applied middleware to be run before reducers.
 */
export declare function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(initialState: S, middleware?: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A, WithArgs>;
/**
 * Create a new state store using Context API
 *
 * @example
 * const reducers = combineReducers({
 *  app: appReducer,
 *  user: userReducer
 * });
 * const middleware = applyMiddleware(one, two, three);
 * const Store = createStore(reducers, middleware);
 *
 * @param reducer the reducer or combined reducer for dispatching.
 * @param middleware applied middleware to be run before reducers.
 */
export declare function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(reducer?: Reducer<S, A>, middleware?: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A, WithArgs>;
/**
 * Create a new state store using Context API
 *
 * @example
 * const reducers = combineReducers({
 *  app: appReducer,
 *  user: userReducer
 * });
 * const initialState = { count: 0 }
 * const middleware = applyMiddleware(one, two, three);
 * const Store = createStore(reducers, initialState, middleware);
 *
 * @param reducer the reducer or combined reducer for dispatching.
 * @param initialState the initial state of the store.
 * @param middleware applied middleware to be run before reducers.
 */
export declare function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(reducer?: Reducer<S, A>, initialState?: S, middleware?: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A, WithArgs>;
