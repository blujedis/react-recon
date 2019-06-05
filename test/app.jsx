import React, { useEffect } from 'react';
import { createStore, applyMiddleware, combineReducers } from '../dist';
import { appReducer, userReducer, initialState, logger } from './reducers';

const middleware = applyMiddleware(logger);
const reducer = combineReducers({
  app: appReducer,
  user: userReducer
});

const { Provider, useStore } = createStore(reducer, initialState, middleware);

function Home(props) {

  const [{ user }, dispatch] = useStore();

  useEffect(() => {
    dispatch({ type: 'INCREMENT' });
  }, []); // <-- prevent loop/rerender when state updated.

  return (
    <div>
      <p>
        Hello my name is {user.profile.firstName + ' ' + user.profile.lastName}
      </p>
    </div>
  );

}

export default function App() {
  return (
    <Provider>
      <Home />
    </Provider>
  );
};

