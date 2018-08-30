import { Dispatch } from 'redux';

// tslint:disable-next-line:no-any
export type AnyFunction = (...args: any[]) => any;
export type EventCallback = (socket: SocketIOClient.Socket) => AnyFunction;
export type EventReduxCallback = (socket: SocketIOClient.Socket, state: StoreState,
  dispatch: Dispatch<StoreState>) => AnyFunction;

export interface EventDescription {
  name: string;
  callback: EventCallback | EventReduxCallback;
  redux: boolean;
}

const DEBUG_ENABLED = true;

/**
 * Create handler for event.
 *
 * @param {string} name of event
 * @param {EventCallback} callback is function which can recieve data from
 *  server in params
 * @return {EventDescription}
 */
const handleEvent = (name: string, callback: EventCallback): EventDescription => ({
  name,
  callback,
  redux: false
});

/**
 * Create handler for event with Redux store
 *
 * @param {string} name of event
 * @param {EventCallback} callback is function with two params (state, dispatch) and
 *  have to return function
 * @return {EventDescription}
 */
const handleEventRedux = (name: string, callback: EventReduxCallback): EventDescription => ({
  name,
  callback,
  redux: true
});

/**
 * Debug message
 *
 * @param {string} event
 * @param {any[]} args
 * @return {void}
 */
// tslint:disable-next-line:no-any
const debugMessage = (event: string, ...args: any[]): void => {
  if (!DEBUG_ENABLED) {
    return;
  }

  // tslint:disable-next-line:no-console
  console.log(`[SOCKET] Handled event ${event}`, ...args);
};

export {
  handleEvent,
  handleEventRedux,
  debugMessage
};
