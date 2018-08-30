import { call, fork, put, select, takeLatest } from 'redux-saga/effects';

import * as types from './types';
import { actions as cacheActions, selectors as cacheSelectors } from '../cache';
import { actions, selectors } from './index';
import * as API from '../../services/api';
import { push as routerPush } from 'react-router-redux';
import { actions as envActions, selectors as envSelectors } from '../environment';
import { indexOf } from 'lodash';

const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

interface Action {
  type: string;
  payload: {
    pathname: string;
    search: string;
    hash: string;
    key: string;
  };
}

const locationChange = function*(socket: SocketIOClient.Socket, action: Action) {
  try {
    // There we can check if we need some preloades
    const { pathname } = action.payload;

    if (pathname === '/selector') {
      const langs = yield select(cacheSelectors.getData, 'languages');

      // If no languages are loaded
      if (!langs || langs.length < 1) {
        let data = yield call(API.env.getLanguages);
        yield put( cacheActions.saveData('languages', data) );
      }

      const projects = yield select(cacheSelectors.getData, 'projects');
      const projectsValid = yield select(cacheSelectors.isValid, 'projects');

      if (!projectsValid || projects.length < 1) {
        let data = yield call(API.env.getProjects);
        yield put( cacheActions.saveData('projects', data) );
      }
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const push = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  const { payload } = action;

  // Get info about project and website
  const info = yield select(envSelectors.getProjectWebsite);
  const pathname = yield select(selectors.getPathname);

  // Invalid Project ID
  if (info.projectId === null) {
    if (pathname !== '/selector' && pathname !== '/test') {
      yield put( routerPush('/selector') );
    }
    return;
  }
  // Invalid Website ID
  if (info.websiteId === null) {
    if (pathname !== '/selector' && pathname !== '/test') {
      yield put( routerPush('/selector') );
    }
    return;
  }

  let url = `/p${info.projectId}w${info.websiteId}`;
  if (payload.url[0] !== '/') {
    url += '/';
  }
  url += payload.url;

  // Call original Router
  yield put( routerPush(url) );
};

const valideEnvUrl = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  // Get pathname (first part)
  const { first } = yield select(selectors.parsePathname, '/:first');
  const { projectId, websiteId } = yield select(envSelectors.getProjectWebsite);
  const exclude = ['selector', 'callback', 'test'];

  if (!first || first.length < 4) {
    if (projectId !== null && websiteId !== null) {
      // Use project and website from env
      const pathname = yield select(selectors.getPathname);
      yield put( actions.push(pathname) );
    } else {
      // No pattern found
      yield put( routerPush('/selector') );
    }
  } else {
    // Skip special routes like selector scene or callback from login
    if (indexOf(exclude, first) > -1) {
      yield fork(locationChange, socket, action);
      return;
    }

    const found = first.match(/\/?p([0-9]+)w([0-9]+)/);
    if (!found) {
      if (projectId !== null && websiteId !== null) {
        // Use project and website from env
        const pathname = yield select(selectors.getPathname);
        yield put( actions.push(pathname) );
      } else {
        // No pattern found
        yield put( routerPush('/selector') );
      }
      return;
    }
    const p = found[1];
    const w = found[2];

    if (p === null || w === null) {
      if (projectId !== null && websiteId !== null) {
        // Use project and website from env
        const pathname = yield select(selectors.getPathname);
        const parse = pathname.match(/\/?[a-z0-9]+\/(.*)/);
        if (!parse || !parse[1]) {
          // No pattern found
          yield put( routerPush('/selector') );
        } else {
          yield put( actions.push(parse[1]) );
        }
      } else {
        // No pattern found
        yield put( routerPush('/selector') );
      }
      return;
    }

    const numP = Number(p);
    const numW = Number(w);
    if (numP === NaN || numW === NaN) {
      // No pattern found
      yield put( routerPush('/selector') );
      return;
    }

    // Check consistency
    if (projectId !== numP || websiteId !== numW) {
      // Setup new env
      yield put( envActions.setProjectWebsite(numP, numW) );
    }

    // It's consistent, so it's OK
    yield fork(locationChange, socket, action);
  }
};

const handleRouterPreloads = function*(socket: SocketIOClient.Socket): IterableIterator<null> {
  // yield takeLatest(LOCATION_CHANGE, locationChange, socket);
  // yield takeLatest(LOCATION_CHANGE, valideEnvUrl, socket);
  // yield takeLatest(types.PUSH, push, socket);
  return null;
};

export default [
  handleRouterPreloads
];
