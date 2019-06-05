import React, { createContext, useContext, useReducer, Reducer, useState, useCallback } from 'react';
import {
  IStoreProps, IStore, Middleware, Dispatch, Dispatcher, IAction, MiddlewareApplied,
  IMiddlewareStore
} from './types';

function isPlainObject(obj) {
  return typeof obj === 'object'
    && obj !== null
    && obj.constructor === Object
    && Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Composes multiple functions into chain.
 * 
 * @example
 * .compose(func1, func2, func3);
 * 
 * @param funcs array of functions to chain.
 */
export function compose(...funcs: any[]): (...args) => void {

  // Compose dummy.
  if (funcs.length === 0)
    return arg => arg;

  // Return single func.
  if (funcs.length === 1)
    return funcs[0];

  return funcs.reduce((a, b) => (...args) => a(b(...args)));

}

/**
 * Wraps middleware with access to context store.
 * 
 * @example
 * .applyMiddleware(thunk, createLogger());
 * 
 * @param middlewares the middleware functions to be wrapped.
 */
// export function applyMiddleware<S = any, A extends IAction = IAction>
export function applyMiddleware<Ext = {}, S = any, D extends Dispatch = Dispatch>
  // (...middlewares: MiddlewareApply<S, A>[]) {
  (...middlewares: Middleware<Ext, S, D>[]) {
  return (store: IMiddlewareStore<D, S>) => {
    const chain = middlewares.map(m => m(store));
    return compose(...chain);
  };
}

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
export function combineReducers(reducers: { [name: string]: Reducer<any, any> }) {

  return function combineWrapper(state, action) {

    const nextState = {};
    let changed = false;

    for (const k in reducers) {

      const reducer = reducers[k];
      const pState = state[k] || {};

      if (!reducer)
        throw new Error(`Reducer ${k} returned undefined`);

      const nState = reducer(pState, action);

      if (typeof nState === 'undefined')
        throw new Error(`Reducer ${k} returned undefined using action ${JSON.stringify(action)}`);

      nextState[k] = nState;
      changed = changed || nState !== pState;

    }

    return (changed ? nextState : state);

  };

}

/**
 * Create a new state store using Context API
 * 
 * @example
 * const middleware = applyMiddleware(one, two, three);
 * const Store = createStore(middleware);
 * 
 * @param middleware applied middleware to be run before reducers.
 */
export function createStore<S = any, A extends IAction = IAction>(
  middleware: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A>;

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
export function createStore<S = any, A extends IAction = IAction>(
  initialState: S,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A>;

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
export function createStore<S = any, A extends IAction = IAction>(
  reducer?: Reducer<S, A>,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A>;

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
export function createStore<S = any, A extends IAction = IAction>(
  reducer?: Reducer<S, A>,
  initialState?: S,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A>;
export function createStore<S = any, A extends IAction = IAction>(
  reducer?: Reducer<S, A> | S | MiddlewareApplied<S, Dispatch<A>>,
  initialState?: S | MiddlewareApplied<S, Dispatch<A>>,
  middleware?: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A> {

  if (Array.isArray(reducer)) {
    middleware = reducer as MiddlewareApplied<S, Dispatch<A>>;
    reducer = undefined;
  }

  if (isPlainObject(reducer)) {
    middleware = initialState as MiddlewareApplied<S, Dispatch<A>>;
    initialState = reducer as S;
    reducer = undefined;
  }

  if (Array.isArray(initialState)) {
    middleware = initialState as MiddlewareApplied<S, Dispatch<A>>;
    initialState = undefined;
  }

  let _reducer = reducer as Reducer<S, A>;
  let _initialState = initialState as S;
  let dispatcher;

  const Context = createContext<[S?, Dispatcher<S, A>?]>([{} as S, dispatcher]);

  const Provider = ({ reducer, initialState, children }: IStoreProps<S>) => {

    let [state, defaultDispatch] = useReducer(reducer || _reducer, initialState || _initialState);

    const dispatch = action => {
      // Set state here so that loggers
      // can get the next state.
      state = (reducer || _reducer)(state, action);
      // Ensure state is updated.
      defaultDispatch(action);
      return action;
    };

    const store = {
      dispatch: (...args) => dispatcher(...args),
      getState: () => state
    };

    dispatcher = dispatch;

    if (middleware)
      dispatcher = (middleware)(store)(dispatch);

    return (
      <Context.Provider value={[state, dispatcher]}>
        {children}
      </Context.Provider>
    );

  };

  const useStore = () => useContext(Context);
  const Consumer = Context.Consumer;

  const Store = {
    Context,
    Provider,
    Consumer,
    useStore
  };

  return Store;

}
