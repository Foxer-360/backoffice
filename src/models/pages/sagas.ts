import { call, fork, put, select, takeLatest } from 'redux-saga/effects';
import { mapKeys } from 'lodash';

import * as types from './types';
import { selectors as envSelectors } from '@source/models/environment';
import { actions as cacheActions } from '@source/models/cache';
import { selectors as pagesSelectors } from '@source/models/pages';
import { push } from 'react-router-redux';
import * as API from '@source/services/api';
import { actions } from './index';
import { selectors as routerSelectors } from '@source/models/router';
import { actions as composerActions, selectors as composerSelectors } from '@source/models/composer';

/**
 * Handle action for fetching page types and call API to
 * get them and save these types into reducer
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleFetchPageTypes = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    // Call API
    const data = yield call(API.pages.getTypes);

    yield put( actions.saveTypes(data) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action for fetching structures and call API to
 * get them and save these structures into reducer
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleFetchStructures = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    // Get websiteId and call API
    const websiteId = yield select( envSelectors.websiteId );
    const data = yield call(API.pages.getStructures, websiteId);

    // Filter only structures where are some pages and map
    // 'Pages' key into 'pages'
    let structures = data.filter((v: LooseObject) => v.Pages.length > 0);
    structures = structures.map((v: LooseObject) => {
      // tslint:disable-next-line:no-any
      return mapKeys(v, (value: any, key: string) => {
        if (key === 'Pages') {
          return 'pages';
        }

        return key;
      });
    });

    yield put( actions.saveStructures(websiteId, structures) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action for creating new page and call API to
 * create it and then save into reducer
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleCreatePage = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { data } = action.payload;

    // Call API
    const structure = yield call(API.pages.createPage, data);

    // Get pages for this new structure
    const pages = yield call(API.pages.getPages, structure.id);

    // Create structure object for reducer
    const pagesInfo = pages.map((v: LooseObject) => {
      return {
        id: v.id,
        languageId: v.languageId,
        url: v.url,
        name: v.name,
        status: v.status,
        publishedFrom: v.publishedFrom,
        publishedTo: v.publishedTo
      };
    });
    const struct = {
      id: structure.id,
      websiteId: structure.websiteId,
      parentId: structure.parentId,
      typeId: structure.typeId,
      pages: [ ...pagesInfo ],
    };

    // Save structure and pages into reducer
    yield put( actions.saveCreatedStrucutre(struct) );
    yield put( actions.saveCreatedPages(pages) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action for removing page and call API to
 * remove this page, also put action to remove it from
 * reducer
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleRemovePage = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { structureId } = action.payload;

    // Call API
    const res = yield call(API.pages.removePage, structureId);

    // No structure was removed
    if (!res || res < 1) {
      return;
    }

    // Put action to remove it from reducer
    yield put( actions.removePageSuccess(structureId) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Simple handler for action to select page for editing
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleSelectPage = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  const { structureId } = action.payload;

  // Go to /page/s:structureId
  yield put( push(`/page/s${structureId}`) );
};

const handlePrepareForComposer = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    // Get structure from path
    const path = yield select(routerSelectors.parsePathname, '/:env/page/:id');

    const structureId = Number(path.id.substring(1));
    let pageId = yield select(pagesSelectors.getPageId, structureId);
    const found = yield select(pagesSelectors.pageExists, pageId);

    // Page id is null ? Ok, fetch structures
    if (pageId === null) {
      yield put( actions.fetchStructures() );
    }

    if (!found) {
      // Call API to get this page
      const data = yield call(API.pages.getPages, structureId);
      // Save into redux
      yield put( actions.saveCreatedPages(data) );
    }

    const content = yield select(pagesSelectors.getContentForStructure, structureId);
    yield put( composerActions.setContent(content) );
    pageId = yield select(pagesSelectors.getPageId, structureId);
    yield put( composerActions.setPageId(pageId) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const handleUpdatePage = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    // Get content from composer
    const content = action.payload.content;
    // Get page id
    const path = yield select(routerSelectors.parsePathname, '/:env/page/:id');

    const structureId = Number(path.id.substring(1));
    const pageId = yield select(pagesSelectors.getPageId, structureId);

    // Call API to update page
    const data = yield call(API.pages.updatePage, pageId, { content });

    if (!data) {
      // TODO - Not saved
      return;
    }

    // Get detail of page
    const page = yield call(API.pages.getPageDetail, structureId, pageId);

    // Update page in redux
    yield put( actions.replacePage(page) );

    // Back to list of pages
    yield put( push('/pages') );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action to add new type and call API
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleAddType = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const data = {
      name: action.payload.name
    };

    const type = yield call(API.pages.addType, data);

    if (!type) {
      // Something is wrong
      return;
    }

    yield put( actions.replaceType(type) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action to edit type and call API
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleEditType = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { id, name } = action.payload;
    const done = yield call(API.pages.editType, id, { name });

    if (!done) {
      // Something goes wrong
      return;
    }

    const type = yield call(API.pages.getType, id);
    if (!type) {
      // Something goes wrong
      return;
    }

    yield put( actions.replaceType(type) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handle action to remove type and call API
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleRemoveType = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const { id } = action.payload;
    const done = yield call(API.pages.removeType, id);

    if (!done) {
      // Something goes wrong
      return;
    }

    yield put( actions.removeTypeSuccess(id) );
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

const handleActions = function*(socket: SocketIOClient.Socket) {
  yield takeLatest(types.FETCH_TYPES, handleFetchPageTypes, socket);
  yield takeLatest(types.FETCH_STRUCTURES, handleFetchStructures, socket);
  yield takeLatest(types.CREATE_PAGE, handleCreatePage, socket);
  yield takeLatest(types.REMOVE_PAGE, handleRemovePage, socket);
  yield takeLatest(types.SELECT_PAGE, handleSelectPage, socket);
  yield takeLatest(types.PREPARE_FOR_COMPOSER, handlePrepareForComposer, socket);
  yield takeLatest(types.UPDATE_PAGE, handleUpdatePage, socket);
  yield takeLatest(types.ADD_TYPE, handleAddType, socket);
  yield takeLatest(types.EDIT_TYPE, handleEditType, socket);
  yield takeLatest(types.REMOVE_TYPE, handleRemoveType, socket);
};

export default [
  handleActions
];
