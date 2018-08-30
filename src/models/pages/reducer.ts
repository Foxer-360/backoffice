import * as types from './types';
import { mapKeys } from 'lodash';

const initState = {
  selectedPage: null as number | null,
  structures: [] as LooseObject[],
  pages: [] as LooseObject[],
  types: [] as LooseObject[],
  locked: [] as LooseObject[]
};

/**
 * Save structures into structures array
 *
 * @param {LooseObject[]} structures from state
 * @param {LooseObject[]} data
 * @param {number} websiteId
 * @return {LooseObject[]}
 */
const saveStructures = (structures: LooseObject[], data: LooseObject[], websiteId: number) => {
  let res = [ ...structures ];

  // There is no in res array
  if (res.length < 1) {
    res.push({ websiteId, data });
    return res;
  }

  // Find websiteId, if exists replace data and if not
  // add new data
  let key = null as number;
  res.forEach((v: LooseObject, i: number) => {
    if (v.websiteId === websiteId) {
      key = i;
    }
  }, this);

  if (key !== null) {
    res[key].data = data;
  } else {
    res.push({ websiteId, data });
  }

  return res;
};

/**
 * Insert new structure into structures array
 *
 * @param {LooseObject[]} structures form state
 * @param {LooseObject} data
 * @return {LooseObject[]}
 */
const insertStruct = (structures: LooseObject[], data: LooseObject) => {
  // Copy structures object
  let res = [ ...structures ];
  let edited = false;

  res = res.map((s: LooseObject) => {
    if (s.websiteId !== data.websiteId) {
      return s;
    }

    edited = true;
    s.data = [ ...s.data, data ];
    return s;
  });

  // This means, that no structure exist for given website
  // so it's neccessary to add one
  if (!edited) {
    res.push({
      websiteId: data.websiteId,
      data: [ data ]
    });
  }

  return res;
};

/**
 * Insert new pages into pages array
 *
 * @param {LooseObject[]} pages from state
 * @param {LooseObject[]} data
 * @return {LooseObject[]}
 */
const insertPages = (pages: LooseObject[], data: LooseObject[]) => {
  let res = [ ...pages, ...data ];
  return res;
};

/**
 * Remove structure and also pages from reducer
 *
 * @param {LooseObject} state
 * @param {number} structureId
 * @return {LooseObject}
 */
const removePage = (state: LooseObject, structureId: number) => {
  let websiteId = null as number;
  let pageIds = [] as number[];

  const structs = state.structures.map((v: LooseObject) => {
    // If we already found it
    if (websiteId !== null) {
      return v;
    }

    // Check if there is structureId and remove it
    let key = null as number;
    v.data.forEach((s: LooseObject, i: number) => {
      if (s.id === structureId) {
        key = i;
        websiteId = v.websiteId;
        pageIds = s.pages.map((p: LooseObject) => {
          return p.id;
        });
      }
    });

    // Remove it
    if (key !== null) {
      v.data.splice(key, 1);
    }

    return v;
  });

  const pages = state.pages.filter((v: LooseObject) => pageIds.indexOf(v.id) < -1);

  return {
    ...state,
    structures: [ ...structs ],
    pages: [ ...pages ]
  };
};

/**
 * Replace page in pages array
 *
 * @param {LooseObject[]} pages
 * @param {LooseObject} page
 * @return {LooseObject[]}
 */
const replacePage = (pages: LooseObject[], page: LooseObject) => {
  const pageId = page.id;

  if (pages.length < 1) {
    return [ page ];
  }

  let updated = false;
  const res = pages.map((v: LooseObject) => {
    if (v.id !== pageId) {
      return v;
    }

    updated = true;
    return page;
  });

  if (!updated) {
    // Add new
    res.push(page);
  }

  return [ ...res ];
};

/**
 * Replace type in types array (or add new)
 *
 * @param {LooseObject[]} typesArr
 * @param {LooseObject} type
 * @return {LooseObject[]}
 */
const replaceType = (typesArr: LooseObject[], type: LooseObject) => {
  const typeId = type.id;

  if (typesArr.length < 1) {
    return [ type ];
  }

  let updated = false;
  const res = typesArr.map((v: LooseObject) => {
    if (v.id !== typeId) {
      return v;
    }

    updated = true;
    return type;
  });

  if (!updated) {
    // Add new type
    res.push(type);
  }

  return [ ...res ];
};

/**
 * Remove type from types array
 *
 * @param {LooseObject[]} typesArr
 * @param {number} id
 * @return {LooseObject[]}
 */
const removeType = (typesArr: LooseObject[], id: number) => {
  const res = typesArr.filter((v: LooseObject) => v.id !== id);

  return [ ...res ];
};

/**
 * Standard Redux reducer for pages
 *
 * @param {LooseObject} state
 * @param {ReduxAction} action
 * @return {LooseObject}
 */
const reducer = (state = initState, action: ReduxAction) => {
  const { payload } = action;

  switch (action.type) {
    case types.SELECT_PAGE:
      return {
        ...state,
        selectedPage: payload.structureId
      };
    case types.SAVE_STRUCTURES:
      return {
        ...state,
        structures: saveStructures(state.structures, payload.data, payload.websiteId)
      };
    case types.SAVE_TYPES:
      return {
        ...state,
        types: payload.data
      };
    case types.SAVE_CREATED_STRUCTURE:
      return {
        ...state,
        structures: insertStruct(state.structures, payload.data)
      };
    case types.SAVE_CREATED_PAGES:
      return {
        ...state,
        pages: insertPages(state.pages, payload.data)
      };
    case types.REMOVE_PAGE_SUCCESS:
      return removePage(state, payload.structureId);
    case types.REPLACE_PAGE:
      return {
        ...state,
        pages: replacePage(state.pages, payload.data)
      };
    case types.REPLACE_TYPE:
      return {
        ...state,
        types: replaceType(state.types, payload.data)
      };
    case types.REMOVE_TYPE_SUCCESS:
      return {
        ...state,
        types: removeType(state.types, payload.id)
      };
    case types.SAVE_LOCKED_COMPONENTS:
      return {
        ...state,
        locked: [ ...payload.data ]
      };
    default:
      return state;
  }
};

export default reducer;
