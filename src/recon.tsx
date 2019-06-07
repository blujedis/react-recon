import React, { createContext, useContext, useReducer, Reducer, useCallback, useState } from 'react';
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
 * Adds thunks to react-recon.
 */
export function thunkify<Ext = {}, S = any, D extends Dispatch = Dispatch, WithArgs extends any[] = any>
  (): Middleware<Ext, S, D, WithArgs> {
  return ({ dispatch, getState, withArgs }) => next => action => {
    if (typeof action === 'function')
      return action(dispatch, getState, ...withArgs);
    return next(action);
  };
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
export function applyMiddleware<Ext = {}, S = any, D extends Dispatch = Dispatch, WithArgs extends any[] = any>
  (...middlewares: Middleware<Ext, S, D, WithArgs>[]) {
  middlewares = middlewares.filter(m => {
    if ((m as any).withExtraArgument) {
      console.warn(`Removing "redux-thunk", enabled by default. Consider "args" options for withExtraArgument.`);
      return false;
    }
    return true;
  });
  middlewares.unshift(thunkify());
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

  const firstReducer = reducers[Object.keys(reducers)[0]];

  return function combineWrapper(state, action) {

    if (action.type === '__RECON_GET_NEXT_STATE__')
      return state;

    // Already have state no need
    // to loop through again.
    if (action.__next_state__)
      return action.__next_state__;

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
export function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(
  middleware: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A, WithArgs>;

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
export function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(
  initialState: S,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A, WithArgs>;

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
export function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(
  reducer?: Reducer<S, A>,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A, WithArgs>;

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
export function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(
  reducer?: Reducer<S, A>,
  initialState?: S,
  middleware?: MiddlewareApplied<S, Dispatch<A>>
): IStore<S, A, WithArgs>;
export function createStore<S = any, A extends IAction = IAction, WithArgs extends any[] = any>(
  reducer?: Reducer<S, A> | S | MiddlewareApplied<S, Dispatch<A>>,
  initialState?: S | MiddlewareApplied<S, Dispatch<A>>,
  middleware?: MiddlewareApplied<S, Dispatch<A>>): IStore<S, A, WithArgs> {

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

  const Provider = ({ reducer, initialState, children, withArgs }: IStoreProps<S>) => {

    _reducer = reducer || _reducer;
    _initialState = initialState || _initialState || {} as any;
    (_initialState as any).__RECON__ = { toggle: false };

    let [state, defaultDispatch] = useReducer(_reducer, _initialState);
    let prevState = state;

    const dispatchNextState = (cb) => {
      return (_dispatch, _getState) => {
        _dispatch({ type: '__RECON_GET_NEXT_STATE__' });
        cb(_getState);
      };
    };

    const store = {
      dispatch: (...args) => dispatcher(...args),
      getState: (cb) => {
        if (!cb)
          return prevState;
        dispatcher(dispatchNextState((_getState) => {
          cb(_getState());
        }));
      },
      withArgs: withArgs || []
    };

    const dispatch = (action) => {
      prevState = (reducer || _reducer)(prevState, action);
      action.__next_state__ = prevState;
      defaultDispatch(action);
      state = { ...prevState };
      const { __next_state__, ..._action } = action;
      return _action;
    };

    dispatcher = dispatch;

    if (middleware)
      dispatcher = (middleware)(store as any)(dispatch);

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
