import * as types from './types';

// tslint:disable-next-line:no-any
const saveData = (name: string, data: any) => ({
  type: types.SAVE_DATA,
  payload: { name, data }
});

// tslint:disable-next-line:no-any
const appendDataWithId = (name: string, data: any) => ({
  type: types.APPEND_DATA_WITH_ID,
  payload: { name, data }
});

// tslint:disable-next-line:no-any
const addItem = (name: string, item: any) => ({
  type: types.ADD_ITEM,
  payload: { name, item }
});

// tslint:disable-next-line:no-any
const editItem = (name: string, id: number, item: any) => ({
  type: types.EDIT_ITEM,
  payload: { name, id, item }
});

const removeItem = (name: string, id: number) => ({
  type: types.REMOVE_ITEM,
  payload: { name, id }
});

export {
  saveData,
  appendDataWithId,

  addItem,
  editItem,
  removeItem
};
