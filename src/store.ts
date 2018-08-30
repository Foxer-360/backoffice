import { createStore, applyMiddleware, Store } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';

import { reducer, saga } from './models';
import history from './services/history';

const sagaMiddleware = createSagaMiddleware();
const routerReduxMiddleware = routerMiddleware(history);

interface StoreWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION__: () => {};
}

let reduxEnabled = false;
if (process.env.REACT_APP_ENABLE_REDUX_DEVTOOL.toLowerCase() === 'true') {
  reduxEnabled = true;
}

let store = null as Store<StoreState>;
if (reduxEnabled) {
  const reduxDevTools = ((<StoreWindow> window).__REDUX_DEVTOOLS_EXTENSION__) ?
  (<StoreWindow> window).__REDUX_DEVTOOLS_EXTENSION__() : null;

  store = createStore(
    reducer,
    reduxDevTools,
    applyMiddleware(routerReduxMiddleware, sagaMiddleware)
  ) as Store<StoreState>;
} else {
  store = createStore(
    reducer,
    applyMiddleware(routerReduxMiddleware, sagaMiddleware)
  ) as Store<StoreState>;
}

sagaMiddleware.run(saga);

export default store;
