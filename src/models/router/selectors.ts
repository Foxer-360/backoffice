import { createSelector } from 'reselect';

/**
 * Just give pathname from state. If pathname is
 * undefined or something, this selector
 * return blank string
 *
 * @param {object} state
 * @return {string}
 */
const getPathname = (state: StoreState) => {
  // Check if structure to pathname exists
  if (!state.router) {
    return '';
  }
  if (!state.router.location) {
    return '';
  }
  if (!state.router.location.pathname) {
    return '';
  }

  return state.router.location.pathname;
};

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

/**
 * Parse params from pathname by given pattern. For
 * param name, use ':' symbol.
 * Example: /path/:id/static/:param
 *
 * @param {object} state
 * @param {string} pattern
 * @return {object}
 */
const parsePathname = createSelector(
  [getPathname, fallSecondParam],
  (pathname, pattern) => {
    const paramPattern = /\:([a-zA-Z0-9]+)/g;
    const params = pattern.match(paramPattern);

    let regPattern = pattern;
    params.forEach((val: string) => {
      regPattern = regPattern.replace(val, '([a-zA-Z0-9]+)');
    // tslint:disable-next-line:align
    }, this);

    const match = pathname.match(regPattern);
    const names = params.map((val: string) => val.replace(':', ''));
    const result = {};

    for (let i = 0; i < names.length; i++) {
      result[names[i]] = null;
    }

    if (match === null || typeof match === 'undefined') {
      return result;
    }

    for (let i = 1; i < match.length; i++) {
      result[names[i - 1]] = match[i];
    }

    return result;
  }
);

export default {
  getPathname,
  parsePathname
};
