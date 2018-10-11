import { ILooseObject } from '@source/composer/types';
import { Context } from './context';

/**
 * Simple method to deep copy some object
 *
 * @param {ILooseObject} object which will be copied
 * @return {ILooseObject} copied object
 */
const deepCopy = (object: ILooseObject): ILooseObject => {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Simple method to compare deeply two objects
 *
 * @param {ILooseObject} a first object
 * @param {ILooseObject} b second object
 * @return {boolean} true if these objects are the same
 */
const deepEqual = (a: ILooseObject, b: ILooseObject): boolean => {
  const aS = JSON.stringify(a);
  const bS = JSON.stringify(b);

  return aS === bS;
};

/**
 * !! DANGER !! This is method for Media Library, to get url of given image.
 * Move configuration of this address to some config file !
 *
 * @param {ILooseObject} data
 */
const getImgUrl = (data: ILooseObject) => {
  const baseUrl = 'http://foxer360-media-library.s3.eu-central-1.amazonaws.com/';
  return baseUrl + data.category + data.hash + '_' + data.filename;
};

export {
  Context,
  deepCopy,
  deepEqual,
  getImgUrl,
};
