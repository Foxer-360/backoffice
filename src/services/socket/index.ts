import { Store } from 'redux';
import io from 'socket.io-client';

import sys from './resources/sys';
import auth from './resources/auth';
import { EventDescription, EventCallback, EventReduxCallback } from './tools';

let _socket: SocketIOClient.Socket = null;
let _binded: boolean = false;

/**
 * Interface from server defined standard response of server
 * for some events
 */
export interface StandardResponse {
  status: 'success' | 'error';
  message?: string;
  // tslint:disable-next-line:no-any
  payload?: any;
}

/**
 * Bind helper function
 *
 * @param {EventDescription[]} what you want to bind (imported resource)
 * @param {Store<StoreState>} store
 * @return {void}
 */
const _bindIt = (what: EventDescription[], store: Store<StoreState>): void => {
  what.forEach((event: EventDescription) => {
    if (event.redux) {
      const callback = event.callback as EventReduxCallback;
      _socket.on(event.name, callback(_socket, store.getState(), store.dispatch));
    } else {
      const callback = event.callback as EventCallback;
      _socket.on(event.name, callback(_socket));
    }
  }, this);
};

/**
 * Bind all events on socket object. Events are separated
 * into different files and there are all binded.
 *
 * @param {Store<StoreState>} store
 * @return {void}
 */
const _bindAllEvents = (store: Store<StoreState>): void => {
  // System events
  _bindIt(sys, store);

  // Auth events
  _bindIt(auth, store);

  // Some others
};

/**
 * Singleton function, that create socket if doesn't exist or
 * return existing socket
 *
 * @param {Store<StoreState>} store If you give store to this function it will
 *  bind all events
 * @return {SocketIO.Socket}
 */
const connect = (store?: Store<StoreState>): SocketIOClient.Socket => {
  if (!_socket) {
    let url = process.env.REACT_APP_SOCKETS_URL || 'http://localhost';
    const port = Number(process.env.REACT_APP_SOCKETS_PORT) || 8080;
    const path = process.env.REACT_APP_SOCKETS_PATH || '';

    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1);
    }
    let fullUrl = `${url}:${port}`;
    if (path.length > 0) {
      fullUrl = `${fullUrl}/${path}`;
    }

    _socket = io(fullUrl);

    if (store) {
      _bindAllEvents(store);
      _binded = true;
    }

    return _socket;
  } else {
    if (store && !_binded) {
      _bindAllEvents(store);
      _binded = true;
    }
    return _socket;
  }
};

export {
  connect
};
