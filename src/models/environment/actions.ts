import * as types from './types';
import {
  CreateWebsiteDto,
  UpdateWebsiteDto,
  CreateProjectDto,
  UpdateProjectDto
} from '../../services/api/resources/environment';

const setProjectWebsite = (projectId: number, websiteId: number) => ({
  type: types.SET_PROJECT_WEBSITE,
  payload: { projectId, websiteId }
});

/**
 * There are some action for projects. These actions are catched by saga and
 * call API for you. So you need just dispatch these actions and saga will
 * automatically update, remove, add object to store
 */

const createProject = (data: CreateProjectDto) => ({
  type: types.CREATE_PROJECT,
  payload: { data }
});

const updateProject = (id: number, data: UpdateProjectDto) => ({
  type: types.UPDATE_PROJECT,
  payload: { id, data }
});

const removeProject = (id: number) => ({
  type: types.REMOVE_PROJECT,
  payload: { id }
});

/**
 * There are some action for websites. These actions are catched by saga and
 * call API for you. So you need just dispatch these actions and saga will
 * automatically update, remove, add object to store
 */

const fetchWebsites = (projectId: number) => ({
  type: types.FETCH_WEBSITES_FOR_PROJECT,
  payload: { projectId }
});

const createWebsite = (data: CreateWebsiteDto) => ({
  type: types.CREATE_WEBSITE,
  payload: { data }
});

const updateWebsite = (id: number, data: UpdateWebsiteDto) => ({
  type: types.UPDATE_WEBSITE,
  payload: { id, data }
});

const removeWebsite = (id: number) => ({
  type: types.REMOVE_WEBSITE,
  payload: { id }
});

const fetchLanguages = () => ({
  type: types.FETCH_LANGUAGES
});

const selectLanguage = (id: number) => ({
  type: types.SELECT_LANGUAGE,
  payload: { id }
});

export {
  setProjectWebsite,

  createProject,
  updateProject,
  removeProject,

  fetchWebsites,
  createWebsite,
  updateWebsite,
  removeWebsite,
  fetchLanguages,
  selectLanguage
};
