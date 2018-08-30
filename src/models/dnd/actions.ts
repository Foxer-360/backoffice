import * as types from './types';

const dragStart = (name: string, data: LooseObject) => ({
  type: types.DRAG_START,
  payload: {
    name,
    data
  }
});

const dragEnd = () => ({
  type: types.DRAG_END,
  payload: {}
});

export {
  dragStart,
  dragEnd
};
