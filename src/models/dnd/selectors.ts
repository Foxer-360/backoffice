import { createSelector } from 'reselect';
import { isNullOrUndefined } from 'util';

/**
 * Just return flag if some source is dragging
 *
 * @param {object} state
 * @return {boolean}
 */
const isSomeDragging = (state: StoreState) => state.dnd.isSomeDragging;

/**
 * Get active source data
 *
 * @param {object} state
 * @return {object | null}
 */
const getActiveSource = (state: StoreState) => state.dnd.activeSource;

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
 * This method return true only if there is some active
 * (dragging) source for given target name
 *
 * @param {object} state
 * @param {string} name target name
 * @return {boolean}
 */
const isDraggingSourceForTarget = createSelector([
  fallSecondParam,
  isSomeDragging,
  getActiveSource
], (name, isDragging, source) => {
  if (!isDragging) {
    return false;
  }

  if (!source || !source.name) {
    return false;
  }

  if (source.name === name) {
    return true;
  }

  return false;
});

/**
 * Get data for given target name
 *
 * @param {object} state
 * @param {string} name target name which has to much with source name
 * @return {object | null}
 */
const getDataForTarget = createSelector([
  fallSecondParam,
  isDraggingSourceForTarget,
  getActiveSource
], (name, isThereSomeSource, source) => {
  if (!isThereSomeSource) {
    return null;
  }

  if (source.data) {
    return source.data;
  }

  // For example if source has no data
  return null;
});

export {
  isDraggingSourceForTarget,
  getDataForTarget
};
