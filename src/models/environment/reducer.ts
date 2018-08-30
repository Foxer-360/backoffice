import * as types from './types';

const initState = {
  projectId: null as number,
  websiteId: null as number,
  languageId: 1 as number
};

const reducer = (state = initState, action: ReduxAction) => {
  const { payload } = action;

  switch (action.type) {
    case types.SET_PROJECT_WEBSITE:
      return {
        ...state,
        projectId: payload.projectId,
        websiteId: payload.websiteId
      };
    case types.SELECT_LANGUAGE:
      return {
        ...state,
        languageId: payload.id
      };
    default:
      return state;
  }
};

export default reducer;
