import * as types from './types';

const initState = {
  isSomeDragging: false,
  activeSource: null as LooseObject
};

const reducer = (state = initState, action: ReduxAction) => {
  const { payload } = action;

  switch (action.type) {
    case types.DRAG_START:
      return {
        ...state,
        isSomeDragging: true,
        activeSource: {
          name: payload.name,
          data: payload.data
        }
      };
    case types.DRAG_END:
      return {
        ...state,
        isSomeDragging: false,
        activeSource: null
      };
    default:
      return state;
  }
};

export default reducer;
