import * as types from './types';

// tslint:disable-next-line:no-any
const setContent = (content: any) => ({
  type: types.SET_CONTENT,
  payload: { content }
});

const clearContent = () => ({
  type: types.CLEAR_CONTENT
});

const addComponent = (component: LooseObject, position: number) => ({
  type: types.ADD_COMPONENT,
  payload: { component, position }
});

const selectComponent = (component: number) => ({
  type: types.SELECT_COMPONENT,
  payload: { component }
});

const deselectComponent = () => ({
  type: types.DESELECT_COMPONENT
});

// tslint:disable-next-line:no-any
const updateComponent = (index: number, data: any) => ({
  type: types.UPDATE_COMPONENT,
  payload: { index, data }
});

const removeComponent = (index: number) => ({
  type: types.REMOVE_COMPONENT,
  payload: { index }
});

const moveComponent = (index: number, pos: number) => ({
  type: types.MOVE_COMPONENT,
  payload: { index, pos }
});

const startEditComponent = (id: number) => ({
  type: types.START_EDIT_COMPONENT,
  payload: { id }
});

const stopEditComponent = (id: number) => ({
  type: types.STOP_EDIT_COMPONENT,
  payload: { id }
});

const setPageId = (id: number) => ({
  type: types.SET_PAGE_ID,
  payload: { id }
});

const resetPageId = () => ({
  type: types.RESET_PAGE_ID,
});

export {
  setContent,
  clearContent,
  addComponent,
  selectComponent,
  deselectComponent,
  updateComponent,
  removeComponent,
  moveComponent,
  startEditComponent,
  stopEditComponent,
  setPageId,
  resetPageId
};
