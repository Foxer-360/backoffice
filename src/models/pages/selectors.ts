import { createSelector } from 'reselect';

import { selectors as envSelectors } from '../environment';
import { selectors as routerSelectors } from '../router';

/**
 * Simply get raw structures from state
 *
 * @param {StoreState} state
 * @return {LooseObject[]}
 */
const structures = (state: StoreState): LooseObject[] => state.pages.structures;

/**
 * Simply get raw types from state
 *
 * @param {StoreState} state
 * @return {LooseObject[]}
 */
const types = (state: StoreState): LooseObject[] => state.pages.types;

/**
 * Simple get raw pages from state
 *
 * @param {StoreState} state
 * @return {LooseObject[]}
 */
const pages = (state: StoreState): LooseObject[] => state.pages.pages;

/**
 * Simple get selected page id
 *
 * @param {StoreState} state
 * @return {number | null}
 */
const selectedPage = (state: StoreState): number | null => state.pages.selectedPage;

/**
 * This selector transform data from reducer to flat structure
 * with all information to structure table
 *
 * @param {StoreState} state
 * @return {LooseObject[]}
 */
const getStructuresTable = createSelector([
  envSelectors.websiteId,
  envSelectors.languageId,
  structures
], (websiteId: number, languageId: number, structs: LooseObject[]) => {
  if (structs === null || structs === undefined) {
    return [];
  }

  let res = structs.filter((v: LooseObject) => {
    return v.websiteId === websiteId;
  });

  if (res.length < 1) {
    return [];
  }

  res = res[0].data; // Get structures for filtered websiteId
  res = res.map((v: LooseObject) => {
    // Get page info for given languageId
    let p = v.pages.filter((vp: LooseObject) => {
      return vp.languageId === languageId;
    });

    if (p.length < 1) {
      p = {
        url: 'undefined',
        name: 'undefined',
        status: 'undefined'
      };
    }
    p = p[0];

    // Return flat data prepared for table
    return {
      id: v.id,
      key: v.id,
      parentId: v.parentId,
      typeId: v.typeId,
      url: p.url,
      name: p.name,
      status: p.status
    };
  });

  return res;
});

/**
 * Get page id for given structureId and env language id
 *
 * @param {StoreState} state
 * @param {number} structureId
 * @return {number | null}
 */
const getPageId = createSelector([
  envSelectors.languageId,
  structures,
  (state: StoreState, structureId: number) => structureId
], (langId: number, structs: LooseObject[], structureId) => {
  let key = null as number;
  structs.forEach((v: LooseObject) => {
    v.data.forEach((s: LooseObject) => {
      if (s.id === structureId) {
        s.pages.forEach((p: LooseObject) => {
          if (p.languageId === langId) {
            key = p.id;
          }
        });
      }
    }, this);
  }, this);

  return key;
});

/**
 * Get content for given structureId and env language id
 *
 * @param {StoreState} state
 * @param {number} structureId
 * @return {LooseObject[]}
 */
const getContentForStructure = createSelector([
  getPageId,
  pages
], (pageId: number, p: LooseObject[]) => {
  let content = [] as LooseObject[];
  p.forEach((v: LooseObject) => {
    if (v.id === pageId) {
      if (!Array.isArray(v.content)) {
        // Something is wrong ! Return empty array
        content = [];
      } else {
        content = [ ...v.content ];
      }
    }
  }, this);

  return content;
});

/**
 * Get structure id from router
 *
 * @param {StoreState} state
 * @return {number}
 */
const getStructureIdFromRoute = createSelector([
  (state: StoreState) => routerSelectors.parsePathname(state, '/:env/page/:id')
], (path: LooseObject) => {
  if (path.id) {
    return Number(path.id.substring(1));
  }

  return null;
});

/**
 * Get name of page for given structureId and env language id
 *
 * @param {StoreState} state
 * @return {string}
 */
const getNameForStructure = createSelector([
  (state: StoreState) => {
    const structureId = getStructureIdFromRoute(state);
    return getPageId(state, structureId);
  },
  pages
], (pageId: number, p: LooseObject[]) => {
  // tslint:disable-next-line:no-console
  console.log(pageId);
  let name = null as string;
  p.forEach((v: LooseObject) => {
    if (v.id === pageId) {
      name = v.name;
    }
  }, this);

  return name;
});

/**
 * This selector check if page is loaded in redux
 *
 * @param {StoreState} state
 * @param {number} pageId
 */
const pageExists = createSelector([
  pages,
  (state: StoreState, pageId: number) => pageId
], (p: LooseObject[], pageId: number) => {
  let found = false;

  p.forEach((v: LooseObject) => {
    if (v.id === pageId) {
      found = true;
    }
  }, this);

  return found;
});

/**
 * Get list of locked components
 *
 * @param {StoreState} state
 * @return {LooseObject[]}
 */
const getLockedComponents = createSelector([
  (state: StoreState) => getPageId(state, selectedPage(state)),
  (state: StoreState) => state.pages.locked
], (pageId: number, locked: LooseObject[]) => {
  let pIdx = null as number;
  // tslint:disable-next-line:no-console
  console.log(pageId, locked);
  locked.forEach((v: LooseObject, i: number) => {
    if (v.pageId === pageId) {
      pIdx = i;
    }
  }, this);

  if (pIdx === null) {
    return [];
  }

  return locked[pIdx].components;
});

export {
  structures,
  types,
  getStructuresTable,
  getPageId,
  getContentForStructure,
  pageExists,
  selectedPage,
  getLockedComponents,
  getNameForStructure
};
