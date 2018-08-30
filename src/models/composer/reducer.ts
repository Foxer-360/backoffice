import * as types from './types';

type Step = 'editor' | 'plugins' | null;

const initState = {
  content: [] as LooseObject[],
  selectedComponent: null as number,

  currentStep: null as Step, // Current step in Composer
  pageType: null as number, // ID of page type
  plugins: [] as string[], // Plugins available in composer
  pageId: null as number,
};

const moveComponent = (arr: LooseObject[], index: number, pos: number) => {
  const res = [] as LooseObject[];
  const component = arr[index];

  // If position is after index, it's mean that position calculate with
  // component which will be moved, so real position is minus one
  let newPos = pos;
  if (newPos > index) {
    newPos--;
  }

  arr.forEach((c, i) => {
    if (res.length === newPos) {
      res.push(component);
    }
    if (i !== index) {
      res.push(c);
    }

  }, this);
  if (res.length === newPos) {
    res.push(component);
  }

  return res;
};

const reducer = (state = initState, action: ReduxAction) => {
  const { payload } = action;

  switch (action.type) {
    case types.SET_CONTENT:
      return { ...state, content: payload.content };
    case types.CLEAR_CONTENT:
      return { ...state, content: [] };
    case types.ADD_COMPONENT:
      let content = [ ...state.content ];

      // Get id for this new component
      let id = 0;
      if (content.length > 0) {
        content.forEach((com: LooseObject) => {
          if (com.id > id) {
            id = com.id + 1;
          }
        }, this);
      }

      const newComponent = {
        ...payload.component,
        id
      };

      // Insert at specific position or end
      if (payload.position < 0) {
        content.push(newComponent);
      } else {
        content.splice(payload.position, 0, newComponent);
      }

      return {
        ...state,
        content
      };
    case types.SELECT_COMPONENT:
      return {
        ...state,
        selectedComponent: payload.component
      };
    case types.DESELECT_COMPONENT:
      return {
        ...state,
        selectedComponent: null
      };
    case types.UPDATE_COMPONENT:
      content = [ ...state.content ];
      content[payload.index].data = payload.data;

      return {
        ...state,
        content
      };
    case types.REMOVE_COMPONENT:
      content = [ ...state.content ];
      content.splice(payload.index, 1);

      let selected = state.selectedComponent;
      if (selected === payload.index) {
        selected = null;
      }

      return {
        ...state,
        content,
        selectedComponent: selected
      };
    case types.MOVE_COMPONENT:
      content = moveComponent(state.content, payload.index, payload.pos);

      return {
        ...state,
        content
      };
    case types.SET_PAGE_ID:
      return {
        ...state,
        pageId: payload.id
      };
    case types.RESET_PAGE_ID:
      return {
        ...state,
        pageId: null,
      };
    default:
      return state;
  }
};

export default reducer;
