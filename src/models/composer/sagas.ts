import { call, fork, put, select, takeLatest } from 'redux-saga/effects';
import { types as composerTypes } from './index';
import { selectors as pageSelectors } from '../pages';

/**
 * Handler for action which is used to inform server
 * about editing specific component
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleStartEditing = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const cId = action.payload.id;
    const sId = yield select(pageSelectors.selectedPage);
    const pId = yield select(pageSelectors.getPageId, sId);

    const data = {
      pageId: pId,
      componentId: cId
    };

    socket.emit('component-lock', data);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Handler for action which is used to inform server
 * about finished editing of specific component
 *
 * @param {SocketIOClient.Socket} socket
 * @param {ReduxAction} action
 * @return {void}
 */
const handleStopEditing = function*(socket: SocketIOClient.Socket, action: ReduxAction) {
  try {
    const cId = action.payload.id;
    const sId = yield select(pageSelectors.selectedPage);
    const pId = yield select(pageSelectors.getPageId, sId);

    const data = {
      pageId: pId,
      componentId: cId
    };

    socket.emit('component-unlock', data);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }
};

/**
 * Main handler for all handlers in this file
 *
 * @param {SocketIOClient.Socket} socket
 * @return {void}
 */
const handleActions = function*(socket: SocketIOClient.Socket) {
  yield takeLatest(composerTypes.START_EDIT_COMPONENT, handleStartEditing, socket);
  yield takeLatest(composerTypes.STOP_EDIT_COMPONENT, handleStopEditing, socket);
};

export default [
  handleActions
];
