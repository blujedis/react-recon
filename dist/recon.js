"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.thunkify = thunkify;
exports.compose = compose;
exports.applyMiddleware = applyMiddleware;
exports.combineReducers = combineReducers;
exports.createStore = createStore;

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
 * Adds thunks to react-recon.
 */


function thunkify() {
  return function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState,
        withArgs = _ref.withArgs;
    return function (next) {
      return function (action) {
        if (typeof action === 'function') return action.apply(void 0, [dispatch, getState].concat(_toConsumableArray(withArgs)));
        return next(action);
      };
    };
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

  middlewares = middlewares.filter(function (m) {
    if (m.withExtraArgument) {
      console.warn("Removing \"redux-thunk\", enabled by default. Consider \"args\" options for withExtraArgument.");
      return false;
    }

    return true;
  });
  middlewares.unshift(thunkify());
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
  var firstReducer = reducers[Object.keys(reducers)[0]];
  return function combineWrapper(state, action) {
    if (action.type === '__RECON_GET_NEXT_STATE__') return state; // Already have state no need
    // to loop through again.

    if (action.__next_state__) return action.__next_state__;
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

  var Provider = function Provider(_ref2) {
    var reducer = _ref2.reducer,
        initialState = _ref2.initialState,
        children = _ref2.children,
        withArgs = _ref2.withArgs;
    _reducer = reducer || _reducer;
    _initialState = initialState || _initialState || {};
    _initialState.__RECON__ = {
      toggle: false
    };

    var _useReducer = (0, _react.useReducer)(_reducer, _initialState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        defaultDispatch = _useReducer2[1];

    var prevState = state;

    var dispatchNextState = function dispatchNextState(cb) {
      return function (_dispatch, _getState) {
        _dispatch({
          type: '__RECON_GET_NEXT_STATE__'
        });

        cb(_getState);
      };
    };

    var store = {
      dispatch: function dispatch() {
        return dispatcher.apply(void 0, arguments);
      },
      getState: function getState(cb) {
        if (!cb) return prevState;
        dispatcher(dispatchNextState(function (_getState) {
          cb(_getState());
        }));
      },
      withArgs: withArgs || []
    };

    var dispatch = function dispatch(action) {
      prevState = (reducer || _reducer)(prevState, action);
      action.__next_state__ = prevState;
      defaultDispatch(action);
      state = _objectSpread({}, prevState);

      var __next_state__ = action.__next_state__,
          _action = _objectWithoutProperties(action, ["__next_state__"]);

      return _action;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWNvbi50c3giXSwibmFtZXMiOlsiaXNQbGFpbk9iamVjdCIsIm9iaiIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwidGh1bmtpZnkiLCJkaXNwYXRjaCIsImdldFN0YXRlIiwid2l0aEFyZ3MiLCJuZXh0IiwiYWN0aW9uIiwiY29tcG9zZSIsImZ1bmNzIiwibGVuZ3RoIiwiYXJnIiwicmVkdWNlIiwiYSIsImIiLCJhcHBseU1pZGRsZXdhcmUiLCJtaWRkbGV3YXJlcyIsImZpbHRlciIsIm0iLCJ3aXRoRXh0cmFBcmd1bWVudCIsImNvbnNvbGUiLCJ3YXJuIiwidW5zaGlmdCIsInN0b3JlIiwiY2hhaW4iLCJtYXAiLCJjb21iaW5lUmVkdWNlcnMiLCJyZWR1Y2VycyIsImZpcnN0UmVkdWNlciIsImtleXMiLCJjb21iaW5lV3JhcHBlciIsInN0YXRlIiwidHlwZSIsIl9fbmV4dF9zdGF0ZV9fIiwibmV4dFN0YXRlIiwiY2hhbmdlZCIsImsiLCJyZWR1Y2VyIiwicFN0YXRlIiwiRXJyb3IiLCJuU3RhdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiY3JlYXRlU3RvcmUiLCJpbml0aWFsU3RhdGUiLCJtaWRkbGV3YXJlIiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwiX3JlZHVjZXIiLCJfaW5pdGlhbFN0YXRlIiwiZGlzcGF0Y2hlciIsIkNvbnRleHQiLCJQcm92aWRlciIsImNoaWxkcmVuIiwiX19SRUNPTl9fIiwidG9nZ2xlIiwiZGVmYXVsdERpc3BhdGNoIiwicHJldlN0YXRlIiwiZGlzcGF0Y2hOZXh0U3RhdGUiLCJjYiIsIl9kaXNwYXRjaCIsIl9nZXRTdGF0ZSIsIl9hY3Rpb24iLCJ1c2VTdG9yZSIsIkNvbnN1bWVyIiwiU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1BLFNBQVNBLGFBQVQsQ0FBdUJDLEdB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QUFNYSxRQUFRLEdBQUdiLE9BQU8sQ0FBQ2EsUUFBekI7QUFFQSxNQUFNQyxLQUFLLEdBQUc7QUFDWmQsSUFBQUEsT0FBTyxFQUFQQSxPQURZO0FBRVpDLElBQUFBLFFBQVEsRUFBUkEsUUFGWTtBQUdaWSxJQUFBQSxRQUFRLEVBQVJBLFFBSFk7QUFJWkQsSUFBQUEsUUFBUSxFQUFSQTtBQUpZLEdBQWQ7QUFPQSxTQUFPRSxLQUFQO0FBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlUmVkdWNlciwgUmVkdWNlciwgdXNlQ2FsbGJhY2ssIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtcbiAgSVN0b3JlUHJvcHMsIElTdG9yZSwgTWlkZGxld2FyZSwgRGlzcGF0Y2gsIERpc3BhdGNoZXIsIElBY3Rpb24sIE1pZGRsZXdhcmVBcHBsaWVkLFxuICBJTWlkZGxld2FyZVN0b3JlXG59IGZyb20gJy4vdHlwZXMnO1xuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCdcbiAgICAmJiBvYmogIT09IG51bGxcbiAgICAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdFxuICAgICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuLyoqXG4gKiBBZGRzIHRodW5rcyB0byByZWFjdC1yZWNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRodW5raWZ5PEV4dCA9IHt9LCBTID0gYW55LCBEIGV4dGVuZHMgRGlzcGF0Y2ggPSBEaXNwYXRjaCwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT5cbiAgKCk6IE1pZGRsZXdhcmU8RXh0LCBTLCBELCBXaXRoQXJncz4ge1xuICByZXR1cm4gKHsgZGlzcGF0Y2gsIGdldFN0YXRlLCB3aXRoQXJncyB9KSA9PiBuZXh0ID0+IGFjdGlvbiA9PiB7XG4gICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpXG4gICAgICByZXR1cm4gYWN0aW9uKGRpc3BhdGNoLCBnZXRTdGF0ZSwgLi4ud2l0aEFyZ3MpO1xuICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gIH07XG59XG5cbi8qKlxuICogQ29tcG9zZXMgbXVsdGlwbGUgZnVuY3Rpb25zIGludG8gY2hhaW4uXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAuY29tcG9zZShmdW5jMSwgZnVuYzIsIGZ1bmMzKTtcbiAqIFxuICogQHBhcmFtIGZ1bmNzIGFycmF5IG9mIGZ1bmN0aW9ucyB0byBjaGFpbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2UoLi4uZnVuY3M6IGFueVtdKTogKC4uLmFyZ3MpID0+IHZvaWQge1xuXG4gIC8vIENvbXBvc2UgZHVtbXkuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDApXG4gICAgcmV0dXJuIGFyZyA9PiBhcmc7XG5cbiAgLy8gUmV0dXJuIHNpbmdsZSBmdW5jLlxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAxKVxuICAgIHJldHVybiBmdW5jc1swXTtcblxuICByZXR1cm4gZnVuY3MucmVkdWNlKChhLCBiKSA9PiAoLi4uYXJncykgPT4gYShiKC4uLmFyZ3MpKSk7XG5cbn1cblxuLyoqXG4gKiBXcmFwcyBtaWRkbGV3YXJlIHdpdGggYWNjZXNzIHRvIGNvbnRleHQgc3RvcmUuXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAuYXBwbHlNaWRkbGV3YXJlKHRodW5rLCBjcmVhdGVMb2dnZXIoKSk7XG4gKiBcbiAqIEBwYXJhbSBtaWRkbGV3YXJlcyB0aGUgbWlkZGxld2FyZSBmdW5jdGlvbnMgdG8gYmUgd3JhcHBlZC5cbiAqL1xuLy8gZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZTxTID0gYW55LCBBIGV4dGVuZHMgSUFjdGlvbiA9IElBY3Rpb24+XG5leHBvcnQgZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlPEV4dCA9IHt9LCBTID0gYW55LCBEIGV4dGVuZHMgRGlzcGF0Y2ggPSBEaXNwYXRjaCwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT5cbiAgKC4uLm1pZGRsZXdhcmVzOiBNaWRkbGV3YXJlPEV4dCwgUywgRCwgV2l0aEFyZ3M+W10pIHtcbiAgbWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcy5maWx0ZXIobSA9PiB7XG4gICAgaWYgKChtIGFzIGFueSkud2l0aEV4dHJhQXJndW1lbnQpIHtcbiAgICAgIGNvbnNvbGUud2FybihgUmVtb3ZpbmcgXCJyZWR1eC10aHVua1wiLCBlbmFibGVkIGJ5IGRlZmF1bHQuIENvbnNpZGVyIFwiYXJnc1wiIG9wdGlvbnMgZm9yIHdpdGhFeHRyYUFyZ3VtZW50LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIG1pZGRsZXdhcmVzLnVuc2hpZnQodGh1bmtpZnkoKSk7XG4gIHJldHVybiAoc3RvcmU6IElNaWRkbGV3YXJlU3RvcmU8RCwgUz4pID0+IHtcbiAgICBjb25zdCBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChtID0+IG0oc3RvcmUpKTtcbiAgICByZXR1cm4gY29tcG9zZSguLi5jaGFpbik7XG4gIH07XG59XG5cbi8qKlxuICogQ29tYmluZXMgcmVkdWNlcnMgZnJvbSBrZXkvdmFsdWUgbWFwIGludG8gc2luZ2xlIGV4ZWN1dGFibGUgd3JhcHBlciB0aGF0IGFjY2VwdHMgc3RhdGUgYW5kIGFjdGlvbi5cbiAqIFxuICogQGV4YW1wbGVcbiAqIC5jb21iaW5lUmVkdWNlcnMoe1xuICogICAgYXBwOiAoc3RhdGUsIGFjdGlvbikgPT4geyB1c2Ugc3dpdGNoL2lmIHRoZW4gcmV0dXJuIHN0YXRlIH0sXG4gKiAgICB1c2VyOiAoc3RhdGUsIGFjdGlvbikgPT4geyB1c2Ugc3dpdGNoL2lmIHRoZW4gcmV0dXJuIHN0YXRlIH0sXG4gKiB9KTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXJzIG1hcCBvZiByZWR1Y2VycyB0byBiZSBjb21iaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2VyczogeyBbbmFtZTogc3RyaW5nXTogUmVkdWNlcjxhbnksIGFueT4gfSkge1xuXG4gIGNvbnN0IGZpcnN0UmVkdWNlciA9IHJlZHVjZXJzW09iamVjdC5rZXlzKHJlZHVjZXJzKVswXV07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmVXcmFwcGVyKHN0YXRlLCBhY3Rpb24pIHtcblxuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ19fUkVDT05fR0VUX05FWFRfU1RBVEVfXycpXG4gICAgICByZXR1cm4gc3RhdGU7XG5cbiAgICAvLyBBbHJlYWR5IGhhdmUgc3RhdGUgbm8gbmVlZFxuICAgIC8vIHRvIGxvb3AgdGhyb3VnaCBhZ2Fpbi5cbiAgICBpZiAoYWN0aW9uLl9fbmV4dF9zdGF0ZV9fKVxuICAgICAgcmV0dXJuIGFjdGlvbi5fX25leHRfc3RhdGVfXztcblxuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICBmb3IgKGNvbnN0IGsgaW4gcmVkdWNlcnMpIHtcblxuICAgICAgY29uc3QgcmVkdWNlciA9IHJlZHVjZXJzW2tdO1xuICAgICAgY29uc3QgcFN0YXRlID0gc3RhdGVba10gfHwge307XG5cbiAgICAgIGlmICghcmVkdWNlcilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWR1Y2VyICR7a30gcmV0dXJuZWQgdW5kZWZpbmVkYCk7XG5cbiAgICAgIGNvbnN0IG5TdGF0ZSA9IHJlZHVjZXIocFN0YXRlLCBhY3Rpb24pO1xuXG4gICAgICBpZiAodHlwZW9mIG5TdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVkdWNlciAke2t9IHJldHVybmVkIHVuZGVmaW5lZCB1c2luZyBhY3Rpb24gJHtKU09OLnN0cmluZ2lmeShhY3Rpb24pfWApO1xuXG4gICAgICBuZXh0U3RhdGVba10gPSBuU3RhdGU7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCBuU3RhdGUgIT09IHBTdGF0ZTtcblxuICAgIH1cblxuICAgIHJldHVybiAoY2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlKTtcblxuICB9O1xuXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHN0YXRlIHN0b3JlIHVzaW5nIENvbnRleHQgQVBJXG4gKiBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKG1pZGRsZXdhcmUpO1xuICogXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbiwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT4oXG4gIG1pZGRsZXdhcmU6IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PlxuKTogSVN0b3JlPFMsIEEsIFdpdGhBcmdzPjtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc3RhdGUgc3RvcmUgdXNpbmcgQ29udGV4dCBBUElcbiAqIFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHsgY291bnQ6IDAgfVxuICogY29uc3QgbWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShvbmUsIHR3bywgdGhyZWUpO1xuICogY29uc3QgU3RvcmUgPSBjcmVhdGVTdG9yZShpbml0aWFsU3RhdGUsIG1pZGRsZXdhcmUpO1xuICogXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBzdG9yZS5cbiAqIEBwYXJhbSBtaWRkbGV3YXJlIGFwcGxpZWQgbWlkZGxld2FyZSB0byBiZSBydW4gYmVmb3JlIHJlZHVjZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmU8UyA9IGFueSwgQSBleHRlbmRzIElBY3Rpb24gPSBJQWN0aW9uLCBXaXRoQXJncyBleHRlbmRzIGFueVtdID0gYW55PihcbiAgaW5pdGlhbFN0YXRlOiBTLFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQSwgV2l0aEFyZ3M+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGFwcDogYXBwUmVkdWNlcixcbiAqICB1c2VyOiB1c2VyUmVkdWNlclxuICogfSk7XG4gKiBjb25zdCBtaWRkbGV3YXJlID0gYXBwbHlNaWRkbGV3YXJlKG9uZSwgdHdvLCB0aHJlZSk7XG4gKiBjb25zdCBTdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXJzLCBtaWRkbGV3YXJlKTtcbiAqIFxuICogQHBhcmFtIHJlZHVjZXIgdGhlIHJlZHVjZXIgb3IgY29tYmluZWQgcmVkdWNlciBmb3IgZGlzcGF0Y2hpbmcuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbiwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+LFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQSwgV2l0aEFyZ3M+O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzdGF0ZSBzdG9yZSB1c2luZyBDb250ZXh0IEFQSVxuICogXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcmVkdWNlcnMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICogIGFwcDogYXBwUmVkdWNlcixcbiAqICB1c2VyOiB1c2VyUmVkdWNlclxuICogfSk7XG4gKiBjb25zdCBpbml0aWFsU3RhdGUgPSB7IGNvdW50OiAwIH1cbiAqIGNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUob25lLCB0d28sIHRocmVlKTtcbiAqIGNvbnN0IFN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlcnMsIGluaXRpYWxTdGF0ZSwgbWlkZGxld2FyZSk7XG4gKiBcbiAqIEBwYXJhbSByZWR1Y2VyIHRoZSByZWR1Y2VyIG9yIGNvbWJpbmVkIHJlZHVjZXIgZm9yIGRpc3BhdGNoaW5nLlxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgc3RvcmUuXG4gKiBAcGFyYW0gbWlkZGxld2FyZSBhcHBsaWVkIG1pZGRsZXdhcmUgdG8gYmUgcnVuIGJlZm9yZSByZWR1Y2Vycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbiwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+LFxuICBpbml0aWFsU3RhdGU/OiBTLFxuICBtaWRkbGV3YXJlPzogTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+XG4pOiBJU3RvcmU8UywgQSwgV2l0aEFyZ3M+O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0b3JlPFMgPSBhbnksIEEgZXh0ZW5kcyBJQWN0aW9uID0gSUFjdGlvbiwgV2l0aEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueT4oXG4gIHJlZHVjZXI/OiBSZWR1Y2VyPFMsIEE+IHwgUyB8IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PixcbiAgaW5pdGlhbFN0YXRlPzogUyB8IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+PixcbiAgbWlkZGxld2FyZT86IE1pZGRsZXdhcmVBcHBsaWVkPFMsIERpc3BhdGNoPEE+Pik6IElTdG9yZTxTLCBBLCBXaXRoQXJncz4ge1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHJlZHVjZXIpKSB7XG4gICAgbWlkZGxld2FyZSA9IHJlZHVjZXIgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIHJlZHVjZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoaXNQbGFpbk9iamVjdChyZWR1Y2VyKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIgYXMgUztcbiAgICByZWR1Y2VyID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5pdGlhbFN0YXRlKSkge1xuICAgIG1pZGRsZXdhcmUgPSBpbml0aWFsU3RhdGUgYXMgTWlkZGxld2FyZUFwcGxpZWQ8UywgRGlzcGF0Y2g8QT4+O1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxldCBfcmVkdWNlciA9IHJlZHVjZXIgYXMgUmVkdWNlcjxTLCBBPjtcbiAgbGV0IF9pbml0aWFsU3RhdGUgPSBpbml0aWFsU3RhdGUgYXMgUztcbiAgbGV0IGRpc3BhdGNoZXI7XG5cbiAgY29uc3QgQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8W1M/LCBEaXNwYXRjaGVyPFMsIEE+P10+KFt7fSBhcyBTLCBkaXNwYXRjaGVyXSk7XG5cbiAgY29uc3QgUHJvdmlkZXIgPSAoeyByZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGNoaWxkcmVuLCB3aXRoQXJncyB9OiBJU3RvcmVQcm9wczxTPikgPT4ge1xuXG4gICAgX3JlZHVjZXIgPSByZWR1Y2VyIHx8IF9yZWR1Y2VyO1xuICAgIF9pbml0aWFsU3RhdGUgPSBpbml0aWFsU3RhdGUgfHwgX2luaXRpYWxTdGF0ZSB8fCB7fSBhcyBhbnk7XG4gICAgKF9pbml0aWFsU3RhdGUgYXMgYW55KS5fX1JFQ09OX18gPSB7IHRvZ2dsZTogZmFsc2UgfTtcblxuICAgIGxldCBbc3RhdGUsIGRlZmF1bHREaXNwYXRjaF0gPSB1c2VSZWR1Y2VyKF9yZWR1Y2VyLCBfaW5pdGlhbFN0YXRlKTtcbiAgICBsZXQgcHJldlN0YXRlID0gc3RhdGU7XG5cbiAgICBjb25zdCBkaXNwYXRjaE5leHRTdGF0ZSA9IChjYikgPT4ge1xuICAgICAgcmV0dXJuIChfZGlzcGF0Y2gsIF9nZXRTdGF0ZSkgPT4ge1xuICAgICAgICBfZGlzcGF0Y2goeyB0eXBlOiAnX19SRUNPTl9HRVRfTkVYVF9TVEFURV9fJyB9KTtcbiAgICAgICAgY2IoX2dldFN0YXRlKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IHN0b3JlID0ge1xuICAgICAgZGlzcGF0Y2g6ICguLi5hcmdzKSA9PiBkaXNwYXRjaGVyKC4uLmFyZ3MpLFxuICAgICAgZ2V0U3RhdGU6IChjYikgPT4ge1xuICAgICAgICBpZiAoIWNiKVxuICAgICAgICAgIHJldHVybiBwcmV2U3RhdGU7XG4gICAgICAgIGRpc3BhdGNoZXIoZGlzcGF0Y2hOZXh0U3RhdGUoKF9nZXRTdGF0ZSkgPT4ge1xuICAgICAgICAgIGNiKF9nZXRTdGF0ZSgpKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSxcbiAgICAgIHdpdGhBcmdzOiB3aXRoQXJncyB8fCBbXVxuICAgIH07XG5cbiAgICBjb25zdCBkaXNwYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgIHByZXZTdGF0ZSA9IChyZWR1Y2VyIHx8IF9yZWR1Y2VyKShwcmV2U3RhdGUsIGFjdGlvbik7XG4gICAgICBhY3Rpb24uX19uZXh0X3N0YXRlX18gPSBwcmV2U3RhdGU7XG4gICAgICBkZWZhdWx0RGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgIHN0YXRlID0geyAuLi5wcmV2U3RhdGUgfTtcbiAgICAgIGNvbnN0IHsgX19uZXh0X3N0YXRlX18sIC4uLl9hY3Rpb24gfSA9IGFjdGlvbjtcbiAgICAgIHJldHVybiBfYWN0aW9uO1xuICAgIH07XG5cbiAgICBkaXNwYXRjaGVyID0gZGlzcGF0Y2g7XG5cbiAgICBpZiAobWlkZGxld2FyZSlcbiAgICAgIGRpc3BhdGNoZXIgPSAobWlkZGxld2FyZSkoc3RvcmUgYXMgYW55KShkaXNwYXRjaCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e1tzdGF0ZSwgZGlzcGF0Y2hlcl19PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0NvbnRleHQuUHJvdmlkZXI+XG4gICAgKTtcblxuICB9O1xuXG4gIGNvbnN0IHVzZVN0b3JlID0gKCkgPT4gdXNlQ29udGV4dChDb250ZXh0KTtcbiAgY29uc3QgQ29uc3VtZXIgPSBDb250ZXh0LkNvbnN1bWVyO1xuXG4gIGNvbnN0IFN0b3JlID0ge1xuICAgIENvbnRleHQsXG4gICAgUHJvdmlkZXIsXG4gICAgQ29uc3VtZXIsXG4gICAgdXNlU3RvcmVcbiAgfTtcblxuICByZXR1cm4gU3RvcmU7XG5cbn1cbiJdfQ==