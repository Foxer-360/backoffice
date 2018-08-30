import { createSelector } from 'reselect';

const getCache = (state: StoreState) => state.cache;

/**
 * This selector just return second parametr.
 * It's for reselect selector.
 *
 * @param {object} state
 * @param {any} param
 * @return {any}
 */
// tslint:disable-next-line:no-any
const fallSecondParam = (state: StoreState, param: any) => param;

const getData = createSelector([
  getCache,
  fallSecondParam
], (cache, name) => {
  if (!cache[name]) {
    return null;
  }

  return cache[name].data;
});

const isValid = createSelector([
  getData
], (data) => {
  if (!data) {
    return false;
  }

  return data.valid;
});

export {
  getData,
  isValid
};
