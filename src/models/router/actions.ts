import * as types from './types';

const push = (url: string) => ({
  type: types.PUSH,
  payload: { url }
});

export {
  push
};
