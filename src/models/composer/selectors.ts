import { createSelector } from 'reselect';

const getContent = (state: StoreState) => state.composer.content;
const getSelectedComponent = (state: StoreState) => state.composer.selectedComponent;
const getPageId = (state: StoreState) => state.composer.pageId;

const getComponent = createSelector([
    getContent,
    getSelectedComponent
  ], (content, id) => {
    if (id === null || !Number.isInteger(id)) {
      return null;
    }

    return content[id];
  }) as (state: StoreState) => LooseObject[];

export {
  getContent,
  getSelectedComponent,
  getComponent,
  getPageId
};
