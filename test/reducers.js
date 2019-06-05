
const initialState = {
  app: { counter: 0 },
  user: {
    profile: { firstName: 'Milton', lastName: 'Waddams', location: 'basement' },
    token: null
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT': {
      return { ...state, counter: state.count++ };
    }
    case 'DECREMENT': {
      return { ...state, counter: state.count-- };
    }
    default: {
      return state;
    }
  }
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PROFILE': {
      return { ...state, profile: action.payload };
    }
    case 'ACCESS_TOKEN': {
      return { ...state, token: action.payload };
    }
    default: {
      return state;
    }
  }
};

const logger = store => next => action => {
  const { getState } = store;
  console.log(`Action: ${JSON.stringify(action)}`);
  console.log(`Previous state: ${JSON.stringify(getState())}`);
  next(action);
}

module.exports = {
  initialState,
  appReducer,
  userReducer,
  logger
};