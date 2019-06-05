# React Recon

Redux like state management using Context API and Hooks.

## Why Use React Recon?

You want the benefits of Redux however you want to utilize the simplicity of Functional Components in React with stateful Hooks.

## Install

```sh
npm install react-recon
```

## Usage 

React Recon is very similar to Redux. Dispatching is identical. Combining reducers and middlware are also, by design the same syntax as Redux. 

```jsx
import React, { useEffect } from 'react';
import { createStore, applyMiddleware, combineReducers } from '../dist';
import { appReducer, userReducer, initialState, logger } from './reducers';

// Apply Middleware //
const middleware = applyMiddleware(logger);

// Combine Reducers //
const reducer = combineReducers({
  app: appReducer,
  user: userReducer
});

// Create Store //
const { Provider, useStore } = createStore(reducer, initialState, middleware);

// Example Component with useStore() //

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

// DEFINE PROVIDER //

export default function App() {
  return (
    <Provider>
      <Home />
    </Provider>
  );
};
```

## Docs

See [https://blujedis.github.io/react-recon/](https://blujedis.github.io/react-recon/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)

