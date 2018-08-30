import { createSelector } from 'reselect';

import { selectors as cacheSelector } from '../cache';

const projectId = (state: StoreState) => state.env.projectId;
const websiteId = (state: StoreState) => state.env.websiteId;
const languageId = (state: StoreState) => state.env.languageId;

const getProjectWebsite = createSelector([
  projectId,
  websiteId
], (pId, wId) => {
  return {
    projectId: pId,
    websiteId: wId
  };
});

const _getProjectObject = createSelector([
  projectId,
  cacheSelector.getData
], (pId, projects) => {
  if (!projects || projects.length < 1) {
    return null;
  }

  const project = projects.filter((p: LooseObject) => {
    if (p.id === pId) {
      return true;
    }

    return false;
  });

  if (project.length < 1) {
    return null;
  }

  return project[0];
});

const getProjectObject = (state: StoreState): LooseObject => _getProjectObject(state, 'projects');

const _getWebsiteObject = createSelector([
  websiteId,
  cacheSelector.getData
], (wId, websites) => {
  if (!websites || websites.length < 1) {
    return null;
  }

  const website = websites.filter((w: LooseObject) => {
    if (w.id === wId) {
      return true;
    }

    return false;
  });

  if (website.length < 1) {
    return null;
  }

  return website[0];
});

const getWebsiteObject = (state: StoreState): LooseObject => _getProjectObject(state, 'websites');

export {
  projectId,
  websiteId,
  languageId,
  getProjectWebsite,
  getProjectObject,
  getWebsiteObject,
};
