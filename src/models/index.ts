import { combineReducers } from 'redux';
import { fork } from 'redux-saga/effects';
import { routerReducer } from 'react-router-redux';

import { connect } from '../services/socket';
import { sagas as routerSagas } from './router';
import { reducer as cacheReducer } from './cache';
import { reducer as dndReducer } from './dnd';
import { reducer as envReducer, sagas as envSagas } from './environment';
import { reducer as pagesReducer, sagas as pagesSagas } from './pages';
import { reducer as composerReducer, sagas as composerSagas } from './composer';

const reducer = combineReducers({
  cache: cacheReducer,
  dnd: dndReducer,
  env: envReducer,
  pages: pagesReducer,
  router: routerReducer,
  composer: composerReducer,
});

const sagas = [
  ...routerSagas,
  ...envSagas,
  ...pagesSagas,
  ...composerSagas
// tslint:disable-next-line:no-any
] as Array<any>;

// Create socket for root saga
const socket = connect();

/**
 * Root saga. There we can fork all sagas from each model
 * and also pass some params into these forks
 */
function* saga() {
  for (let i = 0; i < sagas.length; i++) {
    yield fork(sagas[i], socket);
  }
}

export {
  reducer,
  saga
};
