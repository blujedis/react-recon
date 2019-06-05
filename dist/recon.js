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
    // Already dispatched just triggering
    // a render, perhaps there's a better way,
    // believe this will cause a bail out.
    if (action.__dispatched__) return state;
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
      // Just get the current state value.
      state = (reducer || _reducer)(state, action);
      action.__dispatched__ = true; // Update state using default dispatcher.

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvbi50c3giXSwibmFtZXMiOlsiaXNQbGFpbk9iamVjdCIsIm9iaiIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiY29tcG9zZSIsImZ1bmNzIiwibGVuZ3RoIiwiYXJnIiwicmVkdWNlIiwiYSIsImIiLCJhcHBseU1pZGRsZXdhcmUiLCJtaWRkbGV3YXJlcyIsInN0b3JlIiwiY2hhaW4iLCJtYXAiLCJtIiwiY29tYmluZVJlZHVjZXJzIiwicmVkdWNlcnMiLCJjb21iaW5lV3JhcHBlciIsInN0YXRlIiwiYWN0aW9uIiwiX19kaXNwYXRjaGVkX18iLCJuZXh0U3RhdGUiLCJjaGFuZ2VkIiwiayIsInJlZHVjZXIiLCJwU3RhdGUiLCJFcnJvciIsIm5TdGF0ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJjcmVhdGVTdG9yZSIsImluaXRpYWxTdGF0ZSIsIm1pZGRsZXdhcmUiLCJBcnJheSIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJfcmVkdWNlciIsIl9pbml0aWFsU3RhdGUiLCJkaXNwYXRjaGVyIiwiQ29udGV4dCIsIlByb3ZpZGVyIiwiY2hpbGRyZW4iLCJkZWZhdWx0RGlzcGF0Y2giLCJkaXNwYXRjaCIsImdldFN0YXRlIiwidXNlU3RvcmUiLCJDb25zdW1lciIsIlN0b3JlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxTQUFTQSxhQUFULENBQXVCQyxHQUF2QixFQUE0QjtBQUMxQixTQUFPLFFBQU9BLEdBQVAsTUFBZSxRQUFmLElBQ0ZBLEdBQUcsS0FBSyxJQUROLElBRUZBLEdBQUcsQ0FBQ0MsV0FBSixLQUFvQkMsTUFGbEIsSUFHRkEsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxRQUFqQixDQUEwQkMsSUFBMUIsQ0FBK0JMLEdBQS9CLE1BQXdDLGlCQUg3QztBQUlEO0FBRUQ7Ozs7Ozs7Ozs7QUFRTyxTQUFTTSxPQUFULEdBQXFEO0FB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QUFLLEVBQUUsQ0FBQ3pCLEtBQUQsRUFBUW9CLFVBQVI7QUFBekIsT0FDR0csUUFESCxDQURGO0FBTUQsR0E3QkQ7O0FBK0JBLE1BQU1JLFFBQVEsR0FBRyxTQUFYQSxRQUFXO0FBQUEsV0FBTSx1QkFBV04sT0FBWCxDQUFOO0FBQUEsR0FBakI7O0FBQ0EsTUFBTU8sUUFBUSxHQUFHUCxPQUFPLENBQUNPLFFBQXpCO0FBRUEsTUFBTUMsS0FBSyxHQUFHO0FBQ1pSLElBQUFBLE9BQU8sRUFBUEEsT0FEWTtBQUVaQyxJQUFBQSxRQUFRLEVBQVJBLFFBRlk7QUFHWk0sSUFBQUEsUUFBUSxFQUFSQSxRQUhZO0FBSVpELElBQUFBLFFBQVEsRUFBUkE7QUFKWSxHQUFkO0FBT0EsU0FBT0UsS0FBUDtBQUVEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVJlZHVjZXIsIFJlZHVjZXIsIHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIElTdG9yZVByb3BzLCBJU3RvcmUsIE1pZGRsZXdhcmUsIERpc3BhdGNoLCBEaXNwYXRjaGVyLCBJQWN0aW9uLCBNaWRkbGV3YXJlQXBwbGllZCxcbiAgSU1pZGRsZXdhcmVTdG9yZVxufSBmcm9tICcuL3R5cGVzJztcblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnXG4gICAgJiYgb2JqICE9PSBudWxsXG4gICAgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3RcbiAgICAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59XG5cbi8qKlxuICogQ29tcG9zZXMgbXVsdGlwbGUgZnVuY3Rpb25zIGludG8gY2hhaW4uXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAuY29tcG9zZShmdW5jMSwgZnVuYzIsIGZ1bmMzKTtcbiAqIFxuICogQHBhcmFtIGZ1bmNzIGFycmF5IG9mIGZ1bmN0aW9ucyB0byBjaGFpbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2UoLi4uZnVuY3M6IGFueVtdKTogKC4uLmFyZ3MpID0+IHZvaWQge1xuXG4gIC8vIENvbXBvc2UgZHVtbXkuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIGFyZyA9PiBhcmc7XG5cbiAgLy8gUmV0dXJuIHNpbmdsZSBmdW5jLlxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAxKVxuICAgIHJldHVybiBmdW5jc1swXTtcblxuICByZXR1cm4gZnVuY3MucmVkdWNlKChhLCBiKSA9PiAoLi4uYXJncykgPT4gYShiKC4uLmFyZ3MpKSk7XG5cbn1cblxuLyoqXG4gKiBXcmFwcyBtaWRkbGV3YXJlIHdpdGggYWNjZXNzIHRvIGNvbnRleHQgc3RvcmUuXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAuYXBwbHlNaWRkbGV3YXJlKHRodW5rLCBjcmVhdGVMb2dnZXIoKSk7XG4gKiBcbiAqIEBwYXJhbSBtaWRkbGV3YXJlcyB0aGUgbWlkZGxld2FyZSBmdW5jdGlvbnMgdG8gYmUgd3JhcHBlZC5cbiAqL1xuLy8gZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+XG5leHBvcnQgZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlPEV4dCA9IHt9LCBTID0gYW55LCBEIGV4dGVuZHMgRGlzcGF0Y2ggPSBEaXNwYXRjaD5cbiAgLy8gKC4uLm1pZGRsZXdhcmVzOiBNaWRkbGV3YXJlQXBwbHk8UywgQT5bXSkge1xuICAoLi4ubWlkZGxld2FyZXM6IE1pZGRsZXdhcmU8RXh0LCBTLCBEPltdKSB7XG4gIHJldHVybiAoc3RvcmU6IElNaWRkbGV3YXJlU3RvcmU8RCwgUz4pID0+IHtcbiAgICBjb25zdCBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChtID0+IG0oc3RvcmUpKTtcbiAgICByZXR1cm4gY29tcG9zZSguLi5jaGFpbik7XG4gIH07XG59XG5cbi8qKlxuICogQ29tYmluZXMgcmVkdWNlcnMgZnJvbSBrZXkvdmFsdWUgbWFwIGludG8gc2luZ2xlIGV4ZWN1dGFibGUgd3JhcHBlciB0aGF0IGFjY2VwdHMgc3RhdGUgYW5kIGFjdGlvbi5cbiAqIFxuICogQGV4YW1wbGVcbiAqIC5jb21iaW5lUmVkdWNlcnMoe1xuICogICAgYXBwOiAoc3RhdGUsIGFjdGlvbikgPT4geyB1c2Ugc3dpdGNoL2lmIHRoZW4gcmV0dXJuIHN0YXRlIH0sXG4gKiAgICB1c2VyOiAoc3RhdGUsIGFjdGlvbikgPT4geyB1c2Ugc3dpdGNoL2lmIHRoZW4gcmV0dXJuIHN0YXRlIH0sXG4gKiB9KTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXJzIG1hcCBvZiByZWR1Y2VycyB0byBiZSBjb21iaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2VyczogeyBbbmFtZTogc3RyaW5nXTogUmVkdWNlcjxhbnksIGFueT4gfSkge1xuXG4gIHJldHVybiBmdW5jdGlvbiBjb21iaW5lV3JhcHBlcihzdGF0ZSwgYWN0aW9uKSB7XG5cbiAgICAvLyBBbHJlYWR5IGRpc3BhdGNoZWQganVzdCB0cmlnZ2VyaW5nXG4gICAgLy8gYSByZW5kZXIsIHBlcmhhcHMgdGhlcmUncyBhIGJldHRlciB3YXksXG4gICAgLy8gYmVsaWV2ZSB0aGlzIHdpbGwgY2F1c2UgYSBiYWlsIG91dC5cbiAgICBpZiAoYWN0aW9uLl9fZGlzcGF0Y2hlZF9fKVxuICAgICAgcmV0dXJuIHN0YXRlO1xuXG4gICAgY29uc3QgbmV4dFN0YXRlID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgayBpbiByZWR1Y2Vycykge1xuXG4gICAgICBjb25zdCByZWR1Y2VyID0gcmVkdWNlcnNba107XG4gICAgICBjb25zdCBwU3RhdGUgPSBzdGF0ZVtrXSB8fCB7fTtcblxuICAgICAgaWYgKCFyZWR1Y2VyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlZHVjZXIgJHtrfSByZXR1cm5lZCB1bmRlZmluZWRgKTtcblxuICAgICAgY29uc3QgblN0YXRlID0gcmVkdWNlcihwU3RhdGUsIGFjdGlvbik7XG5cbiAgICAgIGlmICh0eXBlb2YgblN0YXRlID09PSAndW5kZWZpbmVkJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWR1Y2VyICR7a30gcmV0dXJuZWQgdW5kZWZpbmVkIHVzaW5nIGFjdGlvbiAke0pTT04uc3RyaW5naWZ5KGFjdGlvbil9YCk7XG5cbiAgICAgIG5leHRTdGF0ZVtrXSA9IG5TdGF0ZTtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8IG5TdGF0ZSAhPT0gcFN0YXRlO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIChjaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGUpO1xuXG4gIH07XG5cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc3RhdGUgc3RvcmUgdXNpbmcgQ29udGV4dCBBUElcbiAqIFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUobWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSBtaWRkbGV3YXJlIGFwcGxpZWQgbWlkZGxld2FyZSB0byBiZSBydW4gYmVmb3JlIHJlZHVjZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPihcbiAgbWlkZGxld2FyZTogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQT47XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBpbml0aWFsU3RhdGUgPSB7IGNvdW50OiAwIH1cbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUoaW5pdGlhbFN0YXRlLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgc3RvcmUuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIGluaXRpYWxTdGF0ZTogUyxcbiAgbWlkZGxld2FyZT86IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PlxuKTogSVN0b3JlPFMsIEE+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGFwcDogYXBwUmVkdWNlcixcbiAqICB1c2VyOiB1c2VyUmVkdWNlclxuICogfSk7XG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXJzLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXIgdGhlIHJlZHVjZXIgb3IgY29tYmluZWQgcmVkdWNlciBmb3IgZGlzcGF0Y2hpbmcuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+LFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQT47XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCByZWR1Y2VycyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gKiAgYXBwOiBhcHBSZWR1Y2VyLFxuICogIHVzZXI6IHVzZXJSZWR1Y2VyXG4gKiB9KTtcbiAqIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHsgY291bnQ6IDAgfVxuICogY29uc3QgbWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShvbmUsIHR3bywgdGhyZWUpO1xuICogY29uc3QgU3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VycywgaW5pdGlhbFN0YXRlLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXIgdGhlIHJlZHVjZXIgb3IgY29tYmluZWQgcmVkdWNlciBmb3IgZGlzcGF0Y2hpbmcuXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBzdG9yZS5cbiAqIEBwYXJhbSBtaWRkbGV3YXJlIGFwcGxpZWQgbWlkZGxld2FyZSB0byBiZSBydW4gYmVmb3JlIHJlZHVjZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPihcbiAgcmVkdWNlcj86IFJlZHVjZXI8UywgQT4sXG4gIGluaXRpYWxTdGF0ZT86IFMsXG4gIG1pZGRsZXdhcmU/OiBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj5cbik6IElTdG9yZTxTLCBBPjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdG9yZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+KFxuICByZWR1Y2VyPzogUmVkdWNlcjxTLCBBPiB8IFMgfCBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4sXG4gIGluaXRpYWxTdGF0ZT86IFMgfCBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4sXG4gIG1pZGRsZXdhcmU/OiBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj4pOiBJU3RvcmU8UywgQT4ge1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHJlZHVjZXIpKSB7XG4gICAgbWlkZGxld2FyZSA9IHJlZHVjZXIgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIHJlZHVjZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNQbGFpbk9iamVjdChyZWR1Y2VyKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIgYXMgUztcbiAgICByZWR1Y2VyID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5pdGlhbFN0YXRlKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxldCBfcmVkdWNlciA9IHJlZHVjZXIgYXMgUmVkdWNlcjxTLCBBPjtcbiAgbGV0IF9pbml0aWFsU3RhdGUgPSBpbml0aWFsU3RhdGUgYXMgUztcbiAgbGV0IGRpc3BhdGNoZXI7XG5cbiAgY29uc3QgQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8W1M/LCBEaXNwYXRjaGVyPFMsIEE+P10+KFt7fSBhcyBTLCBkaXNwYXRjaGVyXSk7XG5cbiAgY29uc3QgUHJvdmlkZXIgPSAoeyByZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGNoaWxkcmVuIH06IElTdG9yZVByb3BzPFM+KSA9PiB7XG5cbiAgICBsZXQgW3N0YXRlLCBkZWZhdWx0RGlzcGF0Y2hdID0gdXNlUmVkdWNlcihyZWR1Y2VyIHx8IF9yZWR1Y2VyLCBpbml0aWFsU3RhdGUgfHwgX2luaXRpYWxTdGF0ZSk7XG5cbiAgICBjb25zdCBkaXNwYXRjaCA9IGFjdGlvbiA9PiB7XG4gICAgICAvLyBKdXN0IGdldCB0aGUgY3VycmVudCBzdGF0ZSB2YWx1ZS5cbiAgICAgIHN0YXRlID0gKHJlZHVjZXIgfHwgX3JlZHVjZXIpKHN0YXRlLCBhY3Rpb24pO1xuICAgICAgYWN0aW9uLl9fZGlzcGF0Y2hlZF9fID0gdHJ1ZTtcbiAgICAgIC8vIFVwZGF0ZSBzdGF0ZSB1c2luZyBkZWZhdWx0IGRpc3BhdGNoZXIuXG4gICAgICBkZWZhdWx0RGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfTtcblxuICAgIGNvbnN0IHN0b3JlID0ge1xuICAgICAgZGlzcGF0Y2g6ICguLi5hcmdzKSA9PiBkaXNwYXRjaGVyKC4uLmFyZ3MpLFxuICAgICAgZ2V0U3RhdGU6ICgpID0+IHN0YXRlXG4gICAgfTtcblxuICAgIGRpc3BhdGNoZXIgPSBkaXNwYXRjaDtcblxuICAgIGlmIChtaWRkbGV3YXJlKVxuICAgICAgZGlzcGF0Y2hlciA9IChtaWRkbGV3YXJlKShzdG9yZSkoZGlzcGF0Y2gpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtbc3RhdGUsIGRpc3BhdGNoZXJdfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9Db250ZXh0LlByb3ZpZGVyPlxuICAgICk7XG5cbiAgfTtcblxuICBjb25zdCB1c2VTdG9yZSA9ICgpID0+IHVzZUNvbnRleHQoQ29udGV4dCk7XG4gIGNvbnN0IENvbnN1bWVyID0gQ29udGV4dC5Db25zdW1lcjtcblxuICBjb25zdCBTdG9yZSA9IHtcbiAgICBDb250ZXh0LFxuICAgIFByb3ZpZGVyLFxuICAgIENvbnN1bWVyLFxuICAgIHVzZVN0b3JlXG4gIH07XG5cbiAgcmV0dXJuIFN0b3JlO1xuXG59XG4iXX0=