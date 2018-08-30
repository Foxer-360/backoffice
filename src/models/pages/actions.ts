import * as types from './types';
import { CreatePageDto } from '@source/services/api/resources/pages';

/**
 * Action catched by saga to call server API and
 * fetch page types
 *
 * @return {ReduxAction}
 */
const fetchTypes = () => ({
  type: types.FETCH_TYPES,
  payload: {}
});

/**
 * Action catched by saga to call server API and
 * fetch structures
 *
 * @return {ReduxAction}
 */
const fetchStructures = () => ({
  type: types.FETCH_STRUCTURES,
  payload: {}
});

/**
 * Action to save fetched types into reducer
 *
 * @param {LooseObject[]} data
 * @return {ReduxAction}
 */
const saveTypes = (data: LooseObject[]) => ({
  type: types.SAVE_TYPES,
  payload: { data }
});

/**
 * Action to save fetched structures into reducer
 *
 * @param {number} websiteId
 * @param {LooseObject[]} data
 * @return {ReduxAction}
 */
const saveStructures = (websiteId: number, data: LooseObject[]) => ({
  type: types.SAVE_STRUCTURES,
  payload: { websiteId, data }
});

/**
 * Action catched by saga to call API and
 * create new page
 *
 * @param {CreatePageDto} data
 * @return {ReduxAction}
 */
const createPage = (data: CreatePageDto) => ({
  type: types.CREATE_PAGE,
  payload: { data }
});

/**
 * Save created structure to reducer. This structure
 * have to has same format as reducer
 *
 * @param {LooseObject} data
 * @return {ReduxAction}
 */
const saveCreatedStrucutre = (data: LooseObject) => ({
  type: types.SAVE_CREATED_STRUCTURE,
  payload: { data }
});

/**
 * Save created pages to reducer.
 *
 * @param {LooseObject[]} data
 * @return {ReduxAction}
 */
const saveCreatedPages = (data: LooseObject[]) => ({
  type: types.SAVE_CREATED_PAGES,
  payload: { data }
});

/**
 * Action catched by saga to call API and
 * remove page (structure and all pages)
 *
 * @param {number} structureId
 * @return {ReduxAction}
 */
const removePage = (structureId: number) => ({
  type: types.REMOVE_PAGE,
  payload: { structureId }
});

/**
 * Remove structure and pages from reducer after
 * success removing page on API
 *
 * @param {number} structureId
 * @return {ReduxAction}
 */
const removePageSuccess = (structureId: number) => ({
  type: types.REMOVE_PAGE_SUCCESS,
  payload: { structureId }
});

/**
 * Action catched by saga to select page for editing
 *
 * @param {number} structureId
 * @return {ReduxAction}
 */
const selectPage = (structureId: number) => ({
  type: types.SELECT_PAGE,
  payload: { structureId }
});

const prepareForComposer = () => ({
  type: types.PREPARE_FOR_COMPOSER
});

const updatePage = (content: LooseObject) => ({
  type: types.UPDATE_PAGE,
  payload: { content }
});

const replacePage = (data: LooseObject) => ({
  type: types.REPLACE_PAGE,
  payload: { data }
});

/**
 * Action catched by saga to add new page type
 *
 * @param {string} name
 * @return {ReduxAction}
 */
const addType = (name: string) => ({
  type: types.ADD_TYPE,
  payload: { name }
});

/**
 * Action catched by saga to remove page type
 *
 * @param {number} id
 * @return {ReduxAction}
 */
const removeType = (id: number) => ({
  type: types.REMOVE_TYPE,
  payload: { id }
});

/**
 * Action cathced by saga to edit page type
 *
 * @param {number} id
 * @param {string} name
 * @return {ReduxAction}
 */
const editType = (id: number, name: string) => ({
  type: types.EDIT_TYPE,
  payload: { id, name }
});

/**
 * Action to replace type in reducer or add new if doesn't exists
 *
 * @param {LooseObject} data
 * @return {ReduxAction}
 */
const replaceType = (data: LooseObject) => ({
  type: types.REPLACE_TYPE,
  payload: { data }
});

/**
 * Action to remove type from reducer
 *
 * @param {number} id
 * @return {ReduxAction}
 */
const removeTypeSuccess = (id: number) => ({
  type: types.REMOVE_TYPE_SUCCESS,
  payload: { id }
});

/**
 * Action to save locked components info from server
 *
 * @param {LooseObject[]} data
 * @return {ReduxAction}
 */
const saveLockedComponents = (data: LooseObject[]) => ({
  type: types.SAVE_LOCKED_COMPONENTS,
  payload: { data }
});

export {
  fetchTypes,
  fetchStructures,
  saveTypes,
  saveStructures,
  createPage,
  saveCreatedStrucutre,
  saveCreatedPages,
  removePage,
  removePageSuccess,
  selectPage,
  prepareForComposer,
  updatePage,
  replacePage,
  addType,
  removeType,
  editType,
  replaceType,
  removeTypeSuccess,
  saveLockedComponents
};
