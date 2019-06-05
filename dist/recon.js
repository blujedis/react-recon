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
    if (action.__nextstate__) return action.__nextstate__;
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
      action.__nextstate__ = state; // Update state using default dispatcher.

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvbi50c3giXSwibmFtZXMiOlsiaXNQbGFpbk9iamVjdCIsIm9iaiIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiY29tcG9zZSIsImZ1bmNzIiwibGVuZ3RoIiwiYXJnIiwicmVkdWNlIiwiYSIsImIiLCJhcHBseU1pZGRsZXdhcmUiLCJtaWRkbGV3YXJlcyIsInN0b3JlIiwiY2hhaW4iLCJtYXAiLCJtIiwiY29tYmluZVJlZHVjZXJzIiwicmVkdWNlcnMiLCJjb21iaW5lV3JhcHBlciIsInN0YXRlIiwiYWN0aW9uIiwiX19uZXh0c3RhdGVfXyIsIm5leHRTdGF0ZSIsImNoYW5nZWQiLCJrIiwicmVkdWNlciIsInBTdGF0ZSIsIkVycm9yIiwiblN0YXRlIiwiSlNPTiIsInN0cmluZ2lmeSIsImNyZWF0ZVN0b3JlIiwiaW5pdGlhbFN0YXRlIiwibWlkZGxld2FyZSIsIkFycmF5IiwiaXNBcnJheSIsInVuZGVmaW5lZCIsIl9yZWR1Y2VyIiwiX2luaXRpYWxTdGF0ZSIsImRpc3BhdGNoZXIiLCJDb250ZXh0IiwiUHJvdmlkZXIiLCJjaGlsZHJlbiIsImRlZmF1bHREaXNwYXRjaCIsImRpc3BhdGNoIiwiZ2V0U3RhdGUiLCJ1c2VTdG9yZSIsIkNvbnN1bWVyIiwiU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1BLFNBQVNBLGFBQVQsQ0FBdUJDLEdBQXZCLEVBQTRCO0FBQzFCLFNBQU8sUUFBT0EsR0FBUCxNQUFlLFFBQWYsSUFDRkEsR0FBRyxLQUFLLElBRE4sSUFFRkEsR0FBRyxDQUFDQyxXQUFKLEtBQW9CQyxNQUZsQixJQUdGQSxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLFFBQWpCLENBQTBCQyxJQUExQixDQUErQkwsR0FBL0IsTUFBd0MsaUJBSDdDO0FBSUQ7QUFFRDs7Ozs7Ozs7OztBQVFPLFNBQVNNLE9BQVQsR0FBcUQ7QUFB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QUFrQixNQUFBLEtBQUssRUFBRSxDQUFDekIsS0FBRCxFQUFRb0IsVUFBUjtBQUF6QixPQUNHRyxRQURILENBREY7QUFNRCxHQTdCRDs7QUErQkEsTUFBTUksUUFBUSxHQUFHLFNBQVhBLFFBQVc7QUFBQSxXQUFNLHVCQUFXTixPQUFYLENBQU47QUFBQSxHQUFqQjs7QUFDQSxNQUFNTyxRQUFRLEdBQUdQLE9BQU8sQ0FBQ08sUUFBekI7QUFFQSxNQUFNQyxLQUFLLEdBQUc7QUFDWlIsSUFBQUEsT0FBTyxFQUFQQSxPQURZO0FBRVpDLElBQUFBLFFBQVEsRUFBUkEsUUFGWTtBQUdaTSxJQUFBQSxRQUFRLEVBQVJBLFFBSFk7QUFJWkQsSUFBQUEsUUFBUSxFQUFSQTtBQUpZLEdBQWQ7QUFPQSxTQUFPRSxLQUFQO0FBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlUmVkdWNlciwgUmVkdWNlciwgdXNlU3RhdGUsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgSVN0b3JlUHJvcHMsIElTdG9yZSwgTWlkZGxld2FyZSwgRGlzcGF0Y2gsIERpc3BhdGNoZXIsIElBY3Rpb24sIE1pZGRsZXdhcmVBcHBsaWVkLFxuICBJTWlkZGxld2FyZVN0b3JlXG59IGZyb20gJy4vdHlwZXMnO1xuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCdcbiAgICAmJiBvYmogIT09IG51bGxcbiAgICAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdFxuICAgICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuLyoqXG4gKiBDb21wb3NlcyBtdWx0aXBsZSBmdW5jdGlvbnMgaW50byBjaGFpbi5cbiAqIFxuICogQGV4YW1wbGVcbiAqIC5jb21wb3NlKGZ1bmMxLCBmdW5jMiwgZnVuYzMpO1xuICogXG4gKiBAcGFyYW0gZnVuY3MgYXJyYXkgb2YgZnVuY3Rpb25zIHRvIGNoYWluLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZSguLi5mdW5jczogYW55W10pOiAoLi4uYXJncykgPT4gdm9pZCB7XG5cbiAgLy8gQ29tcG9zZSBkdW1teS5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gYXJnID0+IGFyZztcblxuICAvLyBSZXR1cm4gc2luZ2xlIGZ1bmMuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDEpXG4gICAgcmV0dXJuIGZ1bmNzWzBdO1xuXG4gIHJldHVybiBmdW5jcy5yZWR1Y2UoKGEsIGIpID0+ICguLi5hcmdzKSA9PiBhKGIoLi4uYXJncykpKTtcblxufVxuXG4vKipcbiAqIFdyYXBzIG1pZGRsZXdhcmUgd2l0aCBhY2Nlc3MgdG8gY29udGV4dCBzdG9yZS5cbiAqIFxuICogQGV4YW1wbGVcbiAqIC5hcHBseU1pZGRsZXdhcmUodGh1bmssIGNyZWF0ZUxvZ2dlcigpKTtcbiAqIFxuICogQHBhcmFtIG1pZGRsZXdhcmVzIHRoZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB0byBiZSB3cmFwcGVkLlxuICovXG4vLyBleHBvcnQgZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseU1pZGRsZXdhcmU8RXh0ID0ge30sIFMgPSBhbnksIEQgZXh0ZW5kcyBEaXNwYXRjaCA9IERpc3BhdGNoPlxuICAvLyAoLi4ubWlkZGxld2FyZXM6IE1pZGRsZXdhcmVBcHBseTxTLCBBPltdKSB7XG4gICguLi5taWRkbGV3YXJlczogTWlkZGxld2FyZTxFeHQsIFMsIEQ+W10pIHtcbiAgcmV0dXJuIChzdG9yZTogSU1pZGRsZXdhcmVTdG9yZTxELCBTPikgPT4ge1xuICAgIGNvbnN0IGNoYWluID0gbWlkZGxld2FyZXMubWFwKG0gPT4gbShzdG9yZSkpO1xuICAgIHJldHVybiBjb21wb3NlKC4uLmNoYWluKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb21iaW5lcyByZWR1Y2VycyBmcm9tIGtleS92YWx1ZSBtYXAgaW50byBzaW5nbGUgZXhlY3V0YWJsZSB3cmFwcGVyIHRoYXQgYWNjZXB0cyBzdGF0ZSBhbmQgYWN0aW9uLlxuICogXG4gKiBAZXhhbXBsZVxuICogLmNvbWJpbmVSZWR1Y2Vycyh7XG4gKiAgICBhcHA6IChzdGF0ZSwgYWN0aW9uKSA9PiB7IHVzZSBzd2l0Y2gvaWYgdGhlbiByZXR1cm4gc3RhdGUgfSxcbiAqICAgIHVzZXI6IChzdGF0ZSwgYWN0aW9uKSA9PiB7IHVzZSBzd2l0Y2gvaWYgdGhlbiByZXR1cm4gc3RhdGUgfSxcbiAqIH0pO1xuICogXG4gKiBAcGFyYW0gcmVkdWNlcnMgbWFwIG9mIHJlZHVjZXJzIHRvIGJlIGNvbWJpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzOiB7IFtuYW1lOiBzdHJpbmddOiBSZWR1Y2VyPGFueSwgYW55PiB9KSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmVXcmFwcGVyKHN0YXRlLCBhY3Rpb24pIHtcblxuICAgIC8vIEFscmVhZHkgZGlzcGF0Y2hlZCBqdXN0IHRyaWdnZXJpbmdcbiAgICAvLyBhIHJlbmRlciwgcGVyaGFwcyB0aGVyZSdzIGEgYmV0dGVyIHdheSxcbiAgICAvLyBiZWxpZXZlIHRoaXMgd2lsbCBjYXVzZSBhIGJhaWwgb3V0LlxuICAgIGlmIChhY3Rpb24uX19uZXh0c3RhdGVfXylcbiAgICAgIHJldHVybiBhY3Rpb24uX19uZXh0c3RhdGVfXztcblxuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IGsgaW4gcmVkdWNlcnMpIHtcblxuICAgICAgY29uc3QgcmVkdWNlciA9IHJlZHVjZXJzW2tdO1xuICAgICAgY29uc3QgcFN0YXRlID0gc3RhdGVba10gfHwge307XG5cbiAgICAgIGlmICghcmVkdWNlcilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWR1Y2VyICR7a30gcmV0dXJuZWQgdW5kZWZpbmVkYCk7XG5cbiAgICAgIGNvbnN0IG5TdGF0ZSA9IHJlZHVjZXIocFN0YXRlLCBhY3Rpb24pO1xuXG4gICAgICBpZiAodHlwZW9mIG5TdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVkdWNlciAke2t9IHJldHVybmVkIHVuZGVmaW5lZCB1c2luZyBhY3Rpb24gJHtKU09OLnN0cmluZ2lmeShhY3Rpb24pfWApO1xuXG4gICAgICBuZXh0U3RhdGVba10gPSBuU3RhdGU7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCBuU3RhdGUgIT09IHBTdGF0ZTtcblxuICAgIH1cblxuICAgIHJldHVybiAoY2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlKTtcblxuICB9O1xuXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKG1pZGRsZXdhcmUpO1xuICogXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIG1pZGRsZXdhcmU6IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PlxuKTogSVN0b3JlPFMsIEE+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgaW5pdGlhbFN0YXRlID0geyBjb3VudDogMCB9XG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKGluaXRpYWxTdGF0ZSwgbWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSBpbml0aWFsU3RhdGUgdGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlIHN0b3JlLlxuICogQHBhcmFtIG1pZGRsZXdhcmUgYXBwbGllZCBtaWRkbGV3YXJlIHRvIGJlIHJ1biBiZWZvcmUgcmVkdWNlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdG9yZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+KFxuICBpbml0aWFsU3RhdGU6IFMsXG4gIG1pZGRsZXdhcmU/OiBNaWRkbGV3YXJlQXBwbGllZDxTLCBEaXNwYXRjaDxBPj5cbik6IElTdG9yZTxTLCBBPjtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc3RhdGUgc3RvcmUgdXNpbmcgQ29udGV4dCBBUElcbiAqIFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IHJlZHVjZXJzID0gY29tYmluZVJlZHVjZXJzKHtcbiAqICBhcHA6IGFwcFJlZHVjZXIsXG4gKiAgdXNlcjogdXNlclJlZHVjZXJcbiAqIH0pO1xuICogY29uc3QgbWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShvbmUsIHR3bywgdGhyZWUpO1xuICogY29uc3QgU3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VycywgbWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSByZWR1Y2VyIHRoZSByZWR1Y2VyIG9yIGNvbWJpbmVkIHJlZHVjZXIgZm9yIGRpc3BhdGNoaW5nLlxuICogQHBhcmFtIG1pZGRsZXdhcmUgYXBwbGllZCBtaWRkbGV3YXJlIHRvIGJlIHJ1biBiZWZvcmUgcmVkdWNlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdG9yZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+KFxuICByZWR1Y2VyPzogUmVkdWNlcjxTLCBBPixcbiAgbWlkZGxld2FyZT86IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PlxuKTogSVN0b3JlPFMsIEE+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGFwcDogYXBwUmVkdWNlcixcbiAqICB1c2VyOiB1c2VyUmVkdWNlclxuICogfSk7XG4gKiBjb25zdCBpbml0aWFsU3RhdGUgPSB7IGNvdW50OiAwIH1cbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlcnMsIGluaXRpYWxTdGF0ZSwgbWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSByZWR1Y2VyIHRoZSByZWR1Y2VyIG9yIGNvbWJpbmVkIHJlZHVjZXIgZm9yIGRpc3BhdGNoaW5nLlxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgc3RvcmUuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbj4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+LFxuICBpbml0aWFsU3RhdGU/OiBTLFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQT47XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uPihcbiAgcmVkdWNlcj86IFJlZHVjZXI8UywgQT4gfCBTIHwgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+LFxuICBpbml0aWFsU3RhdGU/OiBTIHwgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+LFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+KTogSVN0b3JlPFMsIEE+IHtcblxuICBpZiAoQXJyYXkuaXNBcnJheShyZWR1Y2VyKSkge1xuICAgIG1pZGRsZXdhcmUgPSByZWR1Y2VyIGFzIE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PjtcbiAgICByZWR1Y2VyID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGlzUGxhaW5PYmplY3QocmVkdWNlcikpIHtcbiAgICBtaWRkbGV3YXJlID0gaW5pdGlhbFN0YXRlIGFzIE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PjtcbiAgICBpbml0aWFsU3RhdGUgPSByZWR1Y2VyIGFzIFM7XG4gICAgcmVkdWNlciA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KGluaXRpYWxTdGF0ZSkpIHtcbiAgICBtaWRkbGV3YXJlID0gaW5pdGlhbFN0YXRlIGFzIE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PjtcbiAgICBpbml0aWFsU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZXQgX3JlZHVjZXIgPSByZWR1Y2VyIGFzIFJlZHVjZXI8UywgQT47XG4gIGxldCBfaW5pdGlhbFN0YXRlID0gaW5pdGlhbFN0YXRlIGFzIFM7XG4gIGxldCBkaXNwYXRjaGVyO1xuXG4gIGNvbnN0IENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFtTPywgRGlzcGF0Y2hlcjxTLCBBPj9dPihbe30gYXMgUywgZGlzcGF0Y2hlcl0pO1xuXG4gIGNvbnN0IFByb3ZpZGVyID0gKHsgcmVkdWNlciwgaW5pdGlhbFN0YXRlLCBjaGlsZHJlbiB9OiBJU3RvcmVQcm9wczxTPikgPT4ge1xuXG4gICAgbGV0IFtzdGF0ZSwgZGVmYXVsdERpc3BhdGNoXSA9IHVzZVJlZHVjZXIocmVkdWNlciB8fCBfcmVkdWNlciwgaW5pdGlhbFN0YXRlIHx8IF9pbml0aWFsU3RhdGUpO1xuXG4gICAgY29uc3QgZGlzcGF0Y2ggPSBhY3Rpb24gPT4ge1xuICAgICAgLy8gSnVzdCBnZXQgdGhlIGN1cnJlbnQgc3RhdGUgdmFsdWUuXG4gICAgICBzdGF0ZSA9IChyZWR1Y2VyIHx8IF9yZWR1Y2VyKShzdGF0ZSwgYWN0aW9uKTtcbiAgICAgIGFjdGlvbi5fX25leHRzdGF0ZV9fID0gc3RhdGU7XG4gICAgICAvLyBVcGRhdGUgc3RhdGUgdXNpbmcgZGVmYXVsdCBkaXNwYXRjaGVyLlxuICAgICAgZGVmYXVsdERpc3BhdGNoKGFjdGlvbik7XG4gICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH07XG5cbiAgICBjb25zdCBzdG9yZSA9IHtcbiAgICAgIGRpc3BhdGNoOiAoLi4uYXJncykgPT4gZGlzcGF0Y2hlciguLi5hcmdzKSxcbiAgICAgIGdldFN0YXRlOiAoKSA9PiBzdGF0ZVxuICAgIH07XG5cbiAgICBkaXNwYXRjaGVyID0gZGlzcGF0Y2g7XG5cbiAgICBpZiAobWlkZGxld2FyZSlcbiAgICAgIGRpc3BhdGNoZXIgPSAobWlkZGxld2FyZSkoc3RvcmUpKGRpc3BhdGNoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17W3N0YXRlLCBkaXNwYXRjaGVyXX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvQ29udGV4dC5Qcm92aWRlcj5cbiAgICApO1xuXG4gIH07XG5cbiAgY29uc3QgdXNlU3RvcmUgPSAoKSA9PiB1c2VDb250ZXh0KENvbnRleHQpO1xuICBjb25zdCBDb25zdW1lciA9IENvbnRleHQuQ29uc3VtZXI7XG5cbiAgY29uc3QgU3RvcmUgPSB7XG4gICAgQ29udGV4dCxcbiAgICBQcm92aWRlcixcbiAgICBDb25zdW1lcixcbiAgICB1c2VTdG9yZVxuICB9O1xuXG4gIHJldHVybiBTdG9yZTtcblxufVxuIl19