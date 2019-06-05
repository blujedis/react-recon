"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = compose;
exports.applyMiddleware = applyMiddleware;
exports.combineReducers = combineReducers;
exports.createStore = createStore;

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isPlainObject(obj) {
  return _typeof(obj) === 'object' && obj !== null && obj.constructor === Object && Object.prototype.toString.call(obj) === '[object Object]';
}
/**
 * Composes multiple functions into chain.
 * 
 * @example
 * .compose(func1, func2, func3);
 * 
 * @param funcs array of functions to chain.
 */


function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  // Compose dummy.
  if (funcs.length === 0) return function (arg) {
    return arg;
  }; // Return single func.

  if (funcs.length === 1) return funcs[0];
  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
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


function applyMiddleware() {
  for (var _len2 = arguments.length, middlewares = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    middlewares[_key2] = arguments[_key2];
  }

  return function (store) {
    var chain = middlewares.map(function (m) {
      return m(store);
    });
    return compose.apply(void 0, _toConsumableArray(chain));
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


function combineReducers(reducers) {
  return function combineWrapper(state, action) {
    var nextState = {};
    var changed = false;

    for (var k in reducers) {
      var _reducer2 = reducers[k];
      var pState = state[k] || {};
      if (!_reducer2) throw new Error("Reducer ".concat(k, " returned undefined"));

      var nState = _reducer2(pState, action);

      if (typeof nState === 'undefined') throw new Error("Reducer ".concat(k, " returned undefined using action ").concat(JSON.stringify(action)));
      nextState[k] = nState;
      changed = changed || nState !== pState;
    }

    return changed ? nextState : state;
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


function createStore(reducer, initialState, middleware) {
  if (Array.isArray(reducer)) {
    middleware = reducer;
    reducer = undefined;
  }

  if (isPlainObject(reducer)) {
    middleware = initialState;
    initialState = reducer;
    reducer = undefined;
  }

  if (Array.isArray(initialState)) {
    middleware = initialState;
    initialState = undefined;
  }

  var _reducer = reducer;
  var _initialState = initialState;
  var dispatcher;
  var Context = (0, _react.createContext)([{}, dispatcher]);

  var Provider = function Provider(_ref) {
    var reducer = _ref.reducer,
        initialState = _ref.initialState,
        children = _ref.children;

    var _useReducer = (0, _react.useReducer)(reducer || _reducer, initialState || _initialState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        defaultDispatch = _useReducer2[1];

    var dispatch = function dispatch(action) {
      // Set state here so that loggers
      // can get the next state.
      state = (reducer || _reducer)(state, action); // Ensure state is updated.

      defaultDispatch(action);
      return action;
    };

    var store = {
      dispatch: function dispatch() {
        return dispatcher.apply(void 0, arguments);
      },
      getState: function getState() {
        return state;
      }
    };
    dispatcher = dispatch;
    if (middleware) dispatcher = middleware(store)(dispatch);
    return _react["default"].createElement(Context.Provider, {
      value: [state, dispatcher]
    }, children);
  };

  var useStore = function useStore() {
    return (0, _react.useContext)(Context);
  };

  var Consumer = Context.Consumer;
  var Store = {
    Context: Context,
    Provider: Provider,
    Consumer: Consumer,
    useStore: useStore
  };
  return Store;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvbi50c3giXSwibmFtZXMiOlsiaXNQbGFpbk9iamVjdCIsIm9iaiIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiY29tcG9zZSIsImZ1bmNzIiwibGVuZ3RoIiwiYXJnIiwicmVkdWNlIiwiYSIsImIiLCJhcHBseU1pZGRsZXdhcmUiLCJtaWRkbGV3YXJlcyIsInN0b3JlIiwiY2hhaW4iLCJtYXAiLCJtIiwiY29tYmluZVJlZHVjZXJzIiwicmVkdWNlcnMiLCJjb21iaW5lV3JhcHBlciIsInN0YXRlIiwiYWN0aW9uIiwibmV4dFN0YXRlIiwiY2hhbmdlZCIsImsiLCJyZWR1Y2VyIiwicFN0YXRlIiwiRXJyb3IiLCJuU3RhdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiY3JlYXRlU3RvcmUiLCJpbml0aWFsU3RhdGUiLCJtaWRkbGV3YXJlIiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwiX3JlZHVjZXIiLCJfaW5pdGlhbFN0YXRlIiwiZGlzcGF0Y2hlciIsIkNvbnRleHQiLCJQcm92aWRlciIsImNoaWxkcmVuIiwiZGVmYXVsdERpc3BhdGNoIiwiZGlzcGF0Y2giLCJnZXRTdGF0ZSIsInVzZVN0b3JlIiwiQ29uc3VtZXIiLCJTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTUEsU0FBU0EsYUFBVCxDQUF1QkMsR0FBdkIsRUFBNEI7QUFDMUIsU0FBTyxRQUFPQSxHQUFQLE1BQWUsUUFBZixJQUNGQSxHQUFHLEtBQUssSUFETixJQUVGQSxHQUFHLENBQUNDLFdBQUosS0FBb0JDLE1BRmxCLElBR0ZBLE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkMsUUFBakIsQ0FBMEJDLElBQTFCLENBQStCTCxHQUEvQixNQUF3QyxpQkFIN0M7QUFJRDtBQUVEOzs7Ozs7Ozs7O0FBUU8sU0FBU00sT0FBVCxHQUFxRDtBQUFBLG9DQUFqQ0MsS0FBaUM7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dUJBQVdOLE9BQVgsQ0FBTjtBQUFBLEdBQWpCOztBQUNBLE1BQU1PLFFBQVEsR0FBR1AsT0FBTyxDQUFDTyxRQUF6QjtBQUVBLE1BQU1DLEtBQUssR0FBRztBQUNaUixJQUFBQSxPQUFPLEVBQVBBLE9BRFk7QUFFWkMsSUFBQUEsUUFBUSxFQUFSQSxRQUZZO0FBR1pNLElBQUFBLFFBQVEsRUFBUkEsUUFIWTtBQUlaRCxJQUFBQSxRQUFRLEVBQVJBO0FBSlksR0FBZDtBQU9BLFNBQU9FLEtBQVA7QUFFRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VSZWR1Y2VyLCBSZWR1Y2VyLCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICBJU3RvcmVQcm9wcywgSVN0b3JlLCBNaWRkbGV3YXJlLCBEaXNwYXRjaCwgRGlzcGF0Y2hlciwgSUFjdGlvbiwgTWlkZGxld2FyZUFwcGxpZWQsXG4gIElNaWRkbGV3YXJlU3RvcmVcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0J1xuICAgICYmIG9iaiAhPT0gbnVsbFxuICAgICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0XG4gICAgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufVxuXG4vKipcbiAqIENvbXBvc2VzIG11bHRpcGxlIGZ1bmN0aW9ucyBpbnRvIGNoYWluLlxuICogXG4gKiBAZXhhbXBsZVxuICogLmNvbXBvc2UoZnVuYzEsIGZ1bmMyLCBmdW5jMyk7XG4gKiBcbiAqIEBwYXJhbSBmdW5jcyBhcnJheSBvZiBmdW5jdGlvbnMgdG8gY2hhaW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlKC4uLmZ1bmNzOiBhbnlbXSk6ICguLi5hcmdzKSA9PiB2b2lkIHtcblxuICAvLyBDb21wb3NlIGR1bW15LlxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBhcmcgPT4gYXJnO1xuXG4gIC8vIFJldHVybiBzaW5nbGUgZnVuYy5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMSlcbiAgICByZXR1cm4gZnVuY3NbMF07XG5cbiAgcmV0dXJuIGZ1bmNzLnJlZHVjZSgoYSwgYikgPT4gKC4uLmFyZ3MpID0+IGEoYiguLi5hcmdzKSkpO1xuXG59XG5cbi8qKlxuICogV3JhcHMgbWlkZGxld2FyZSB3aXRoIGFjY2VzcyB0byBjb250ZXh0IHN0b3JlLlxuICogXG4gKiBAZXhhbXBsZVxuICogLmFwcGx5TWlkZGxld2FyZSh0aHVuaywgY3JlYXRlTG9nZ2VyKCkpO1xuICogXG4gKiBAcGFyYW0gbWlkZGxld2FyZXMgdGhlIG1pZGRsZXdhcmUgZnVuY3Rpb25zIHRvIGJlIHdyYXBwZWQuXG4gKi9cbi8vIGV4cG9ydCBmdW5jdGlvbiBhcHBseU1pZGRsZXdhcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPlxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZTxFeHQgPSB7fSwgUyA9IGFueSwgRCBleHRlbmRzIERpc3BhdGNoID0gRGlzcGF0Y2g+XG4gIC8vICguLi5taWRkbGV3YXJlczogTWlkZGxld2FyZUFwcGx5PFMsIEE+W10pIHtcbiAgKC4uLm1pZGRsZXdhcmVzOiBNaWRkbGV3YXJlPEV4dCwgUywgRD5bXSkge1xuICByZXR1cm4gKHN0b3JlOiBJTWlkZGxld2FyZVN0b3JlPEQsIFM+KSA9PiB7XG4gICAgY29uc3QgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAobSA9PiBtKHN0b3JlKSk7XG4gICAgcmV0dXJuIGNvbXBvc2UoLi4uY2hhaW4pO1xuICB9O1xufVxuXG4vKipcbiAqIENvbWJpbmVzIHJlZHVjZXJzIGZyb20ga2V5L3ZhbHVlIG1hcCBpbnRvIHNpbmdsZSBleGVjdXRhYmxlIHdyYXBwZXIgdGhhdCBhY2NlcHRzIHN0YXRlIGFuZCBhY3Rpb24uXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAuY29tYmluZVJlZHVjZXJzKHtcbiAqICAgIGFwcDogKHN0YXRlLCBhY3Rpb24pID0+IHsgdXNlIHN3aXRjaC9pZiB0aGVuIHJldHVybiBzdGF0ZSB9LFxuICogICAgdXNlcjogKHN0YXRlLCBhY3Rpb24pID0+IHsgdXNlIHN3aXRjaC9pZiB0aGVuIHJldHVybiBzdGF0ZSB9LFxuICogfSk7XG4gKiBcbiAqIEBwYXJhbSByZWR1Y2VycyBtYXAgb2YgcmVkdWNlcnMgdG8gYmUgY29tYmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lUmVkdWNlcnMocmVkdWNlcnM6IHsgW25hbWU6IHN0cmluZ106IFJlZHVjZXI8YW55LCBhbnk+IH0pIHtcblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluZVdyYXBwZXIoc3RhdGUsIGFjdGlvbikge1xuXG4gICAgY29uc3QgbmV4dFN0YXRlID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgayBpbiByZWR1Y2Vycykge1xuXG4gICAgICBjb25zdCByZWR1Y2VyID0gcmVkdWNlcnNba107XG4gICAgICBjb25zdCBwU3RhdGUgPSBzdGF0ZVtrXSB8fCB7fTtcblxuICAgICAgaWYgKCFyZWR1Y2VyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlZHVjZXIgJHtrfSByZXR1cm5lZCB1bmRlZmluZWRgKTtcblxuICAgICAgY29uc3QgblN0YXRlID0gcmVkdWNlcihwU3RhdGUsIGFjdGlvbik7XG5cbiAgICAgIGlmICh0eXBlb2YgblN0YXRlID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWR1Y2VyICR7a30gcmV0dXJuZWQgdW5kZWZpbmVkIHVzaW5nIGFjdGlvbiAke0pTT04uc3RyaW5naWZ5KGFjdGlvbil9YCk7XG5cbiAgICAgIG5leHRTdGF0ZVtrXSA9IG5TdGF0ZTtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8IG5TdGF0ZSAhPT0gcFN0YXRlO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIChjaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGUpO1xuXG4gIH07XG5cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc3RhdGUgc3RvcmUgdXNpbmcgQ29udGV4dCBBUElcbiAqIFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUobWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSBtaWRkbGV3YXJlIGFwcGxpZWQgbWlkZGxld2FyZSB0byBiZSBydW4gYmVmb3JlIHJlZHVjZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPihcbiAgbWlkZGxld2FyZTogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQT47XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBpbml0aWFsU3RhdGUgPSB7IGNvdW50OiAwIH1cbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUoaW5pdGlhbFN0YXRlLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgc3RvcmUuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIGluaXRpYWxTdGF0ZTogUyxcbiAgbWlkZGxld2FyZT86IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PlxuKTogSVN0b3JlPFMsIEE+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGFwcDogYXBwUmVkdWNlcixcbiAqICB1c2VyOiB1c2VyUmVkdWNlclxuICogfSk7XG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXJzLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXIgdGhlIHJlZHVjZXIgb3IgY29tYmluZWQgcmVkdWNlciBmb3IgZGlzcGF0Y2hpbmcuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+LFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQT47XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCByZWR1Y2VycyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gKiAgYXBwOiBhcHBSZWR1Y2VyLFxuICogIHVzZXI6IHVzZXJSZWR1Y2VyXG4gKiB9KTtcbiAqIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHsgY291bnQ6IDAgfVxuICogY29uc3QgbWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShvbmUsIHR3bywgdGhyZWUpO1xuICogY29uc3QgU3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VycywgaW5pdGlhbFN0YXRlLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXIgdGhlIHJlZHVjZXIgb3IgY29tYmluZWQgcmVkdWNlciBmb3IgZGlzcGF0Y2hpbmcuXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBzdG9yZS5cbiAqIEBwYXJhbSBtaWRkbGV3YXJlIGFwcGxpZWQgbWlkZGxld2FyZSB0byBiZSBydW4gYmVmb3JlIHJlZHVjZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPihcbiAgcmVkdWNlcj86IFJlZHVjZXI8UywgQT4sXG4gIGluaXRpYWxTdGF0ZT86IFMsXG4gIG1pZGRsZXdhcmU/OiBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj5cbik6IElTdG9yZTxTLCBBPjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdG9yZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+KFxuICByZWR1Y2VyPzogUmVkdWNlcjxTLCBBPiB8IFMgfCBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4sXG4gIGluaXRpYWxTdGF0ZT86IFMgfCBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4sXG4gIG1pZGRsZXdhcmU/OiBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4pOiBJU3RvcmU8UywgQT4ge1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHJlZHVjZXIpKSB7XG4gICAgbWlkZGxld2FyZSA9IHJlZHVjZXIgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIHJlZHVjZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNQbGFpbk9iamVjdChyZWR1Y2VyKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIgYXMgUztcbiAgICByZWR1Y2VyID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5pdGlhbFN0YXRlKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxldCBfcmVkdWNlciA9IHJlZHVjZXIgYXMgUmVkdWNlcjxTLCBBPjtcbiAgbGV0IF9pbml0aWFsU3RhdGUgPSBpbml0aWFsU3RhdGUgYXMgUztcbiAgbGV0IGRpc3BhdGNoZXI7XG5cbiAgY29uc3QgQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8W1M/LCBEaXNwYXRjaGVyPFMsIEE+P10+KFt7fSBhcyBTLCBkaXNwYXRjaGVyXSk7XG5cbiAgY29uc3QgUHJvdmlkZXIgPSAoeyByZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGNoaWxkcmVuIH06IElTdG9yZVByb3BzPFM+KSA9PiB7XG5cbiAgICBsZXQgW3N0YXRlLCBkZWZhdWx0RGlzcGF0Y2hdID0gdXNlUmVkdWNlcihyZWR1Y2VyIHx8IF9yZWR1Y2VyLCBpbml0aWFsU3RhdGUgfHwgX2luaXRpYWxTdGF0ZSk7XG5cbiAgICBjb25zdCBkaXNwYXRjaCA9IGFjdGlvbiA9PiB7XG4gICAgICAvLyBTZXQgc3RhdGUgaGVyZSBzbyB0aGF0IGxvZ2dlcnNcbiAgICAgIC8vIGNhbiBnZXQgdGhlIG5leHQgc3RhdGUuXG4gICAgICBzdGF0ZSA9IChyZWR1Y2VyIHx8IF9yZWR1Y2VyKShzdGF0ZSwgYWN0aW9uKTtcbiAgICAgIC8vIEVuc3VyZSBzdGF0ZSBpcyB1cGRhdGVkLlxuICAgICAgZGVmYXVsdERpc3BhdGNoKGFjdGlvbik7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH07XG5cbiAgICBjb25zdCBzdG9yZSA9IHtcbiAgICAgIGRpc3BhdGNoOiAoLi4uYXJncykgPT4gZGlzcGF0Y2hlciguLi5hcmdzKSxcbiAgICAgIGdldFN0YXRlOiAoKSA9PiBzdGF0ZVxuICAgIH07XG5cbiAgICBkaXNwYXRjaGVyID0gZGlzcGF0Y2g7XG5cbiAgICBpZiAobWlkZGxld2FyZSlcbiAgICAgIGRpc3BhdGNoZXIgPSAobWlkZGxld2FyZSkoc3RvcmUpKGRpc3BhdGNoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17W3N0YXRlLCBkaXNwYXRjaGVyXX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvQ29udGV4dC5Qcm92aWRlcj5cbiAgICApO1xuXG4gIH07XG5cbiAgY29uc3QgdXNlU3RvcmUgPSAoKSA9PiB1c2VDb250ZXh0KENvbnRleHQpO1xuICBjb25zdCBDb25zdW1lciA9IENvbnRleHQuQ29uc3VtZXI7XG5cbiAgY29uc3QgU3RvcmUgPSB7XG4gICAgQ29udGV4dCxcbiAgICBQcm92aWRlcixcbiAgICBDb25zdW1lcixcbiAgICB1c2VTdG9yZVxuICB9O1xuXG4gIHJldHVybiBTdG9yZTtcblxufVxuIl19