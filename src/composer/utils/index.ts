import { ILooseObject } from '@source/composer/types';
import { Context } from './context';
import * as R from 'ramda';

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

const escape = function (str: string) {
  // TODO: escape %x75 4HEXDIG ?? chars
  return str
    .replace(/[\"]/g, '\\"')
    .replace(/[\\]/g, '\\\\')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t'); 
};

const addContextInformationsFromDatasourceItems = function (datasourceItems: Array<LooseObject>, componentData: LooseObject) {
  const regex = /%cx,([^%]*)%/g;
        
  let stringifiedData = JSON.stringify(componentData);
  let replacedData = String(stringifiedData);
  let result;
  while ((result = regex.exec(stringifiedData)) && datasourceItems && datasourceItems.length > 0) {
    if (result[1]) {
      try {
        const searchKeys = result[1].split(',');
        if (Array.isArray(searchKeys) && searchKeys.length > 0) {
          const getValueFromDatasourceItems = R.path(searchKeys);
          const replacement = getValueFromDatasourceItems(datasourceItems.filter(item => item.content).map(item => item.content));
          if (replacement) {
            replacedData = replacedData.replace(result[0], escape(replacement));
          } else {
            replacedData = replacedData.replace(result[0], '');
          }
        }    
      } catch (e) {
        console.log(e);
      }
    }
  }

  return JSON.parse(replacedData);
};

const getSchemaPaths = function (schemaWithoutRefs: LooseObject, path: string, paths: Array<string>) {
  if (!schemaWithoutRefs.properties && schemaWithoutRefs.type === 'string') {
    paths.push(`${path}%`);
  } else if (schemaWithoutRefs.properties) {
    Object.keys(schemaWithoutRefs.properties).forEach(key => {
      let newPath = String(path);
      let prefix = path.length > 0 ? ',' : '';
      if (schemaWithoutRefs.properties[key].type === 'array') {
        newPath += `${prefix}${key},[n]`;
        return getSchemaPaths(schemaWithoutRefs.properties[key].items, newPath, paths);
      } else {
        newPath += `${prefix}${key}`;
        return getSchemaPaths(schemaWithoutRefs.properties[key], newPath, paths);
      }
    
    });
  }
};

export {
  Context,
  deepCopy,
  deepEqual,
  getImgUrl,
  addContextInformationsFromDatasourceItems,
  getSchemaPaths,
};
