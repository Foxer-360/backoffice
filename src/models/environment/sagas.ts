import { call, fork, put, select, takeLatest } from 'redux-saga/effects';

import * as types from './types';
import { actions as cacheActions, selectors as cacheSelectors } from '../cache';
import * as selectors from './selectors';
import * as actions from './actions';
import * as API from '../../services/api';

const createProject = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Call API
    const project = yield call(API.env.createProject, payload.data);

    // If not created
    if (!project) {
      return;
    }

    // Save into cache
    yield put( cacheActions.addItem('projects', project) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const updateProject = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Cal API
    const res = yield call(API.env.updateProject, payload.id, payload.data);

    // No changes
    if (!res || res[0] < 1) {
      return;
    }

    // Update item in cache
    yield put( cacheActions.editItem('projects', payload.id, { id: payload.id, ...payload.data }) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const removeProject = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Call API
    const res = yield call(API.env.removeProject, payload.id);

    // No project was removed
    if (!res || res < 1) {
      return;
    }

    // Remove item from cache
    yield put( cacheActions.removeItem('projects', payload.id) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const fetchWebsites = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    // Check our websites
    const websites = yield select(cacheSelectors.getData, 'websites');

    if (!websites || websites.length < 1) {
      // Save websites no append
      const data = yield call(API.env.getWebsites, action.payload.projectId);
      yield put( cacheActions.saveData('websites', data));
      return;
    }

    let update = true;
    // There are websites for this project
    if (websites.filter((item: LooseObject) => item.projectId === action.payload.projectId).length > 0) {
      update = false;
    }

    if (update) {
      const data = yield call(API.env.getWebsites, action.payload.projectId);
      yield put( cacheActions.appendDataWithId('websites', data));
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const createWebsite = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;
    // Create new website
    const website = yield call(API.env.createWebsite, payload.data);

    // If website was not created
    if (!website) {
      return;
    }

    // Save website into cache
    yield put( cacheActions.addItem('websites', website) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const updateWebsite = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Call API
    const res = yield call(API.env.updateWebsite, payload.id, payload.data);

    if (!res || res[0] < 1) {
      return;
    }

    // Save updated website into cache
    yield put( cacheActions.editItem('websites', payload.id, { id: payload.id, ...payload.data}) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const removeWebsite = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Call API
    const res = yield call(API.env.removeWebsite, payload.id);

    // No website was removed
    if (!res || res < 1) {
      return;
    }

    // Remove website from cache
    yield put( cacheActions.removeItem('websites', payload.id) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const setProjectWebsitePostProcess = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { payload } = action;

    // Check if we have cached project which we select
    const project = yield select(selectors.getProjectObject);

    if (!project) {
      // Fetch projects
      let data = yield call(API.env.getProjects);
      yield put( cacheActions.saveData('projects', data) );
    }

    // Check if we have cached website which we select
    const website = yield select(selectors.getWebsiteObject);

    if (!website) {
      // Fetch websites for selected project
      yield put( actions.fetchWebsites(payload.projectId) );
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const fetchLanguages = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const langs = yield select(cacheSelectors.getData, 'languages');

    // If no languages are loaded
    if (!langs || langs.length < 1) {
      const data = yield call(API.env.getLanguages);
      yield put( cacheActions.saveData('languages', data) );
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const handleActions = function*(socket: SocketIOClient.Socket) {
  yield takeLatest(types.CREATE_PROJECT, createProject, socket);
  yield takeLatest(types.UPDATE_PROJECT, updateProject, socket);
  yield takeLatest(types.REMOVE_PROJECT, removeProject, socket);

  yield takeLatest(types.FETCH_WEBSITES_FOR_PROJECT, fetchWebsites, socket);
  yield takeLatest(types.CREATE_WEBSITE, createWebsite, socket);
  yield takeLatest(types.UPDATE_WEBSITE, updateWebsite, socket);
  yield takeLatest(types.REMOVE_WEBSITE, removeWebsite, socket);

  yield takeLatest(types.SET_PROJECT_WEBSITE, setProjectWebsitePostProcess, socket);
  yield takeLatest(types.FETCH_LANGUAGES, fetchLanguages, socket);
};

export default [
  handleActions
];
