import { History } from 'history';
import { client, mutations, queries } from '@source/services/graphql';

import { PageValidator } from './page';

export interface ValidatorInfo {
  path: string;
  search: string;
  info: LooseObject;
}

/**
 * Definition of validator function, this function is called when url is changed and
 * path will match test RegExp
 *
 * @param {ValidatorInfo} info about url, like path, search and informations parsed from search
 * @param {History} history can be used to replace url with new search
 * @return {void}
 */
export type ValidatorFce = (info: ValidatorInfo, history: History) => void;

/**
 * Definition of handler function, this function is called when some data was changed
 * and url needs new validation (respectively handle change of application data).
 * This function can be called for example, if user changes language in application
 * to handle this change and replace id of language in url
 *
 * @param {ValidatorInfo} info about url
 * @param {History} history can be used to redirect to new url
 * @param {string} name of change, for example language if language was changed
 * @return {void}
 */
export type HandlerFce = (info: ValidatorInfo, history: History, name: string) => void;

export interface UrlValidator {
  test: RegExp;
  validator: ValidatorFce;
  handler: HandlerFce;
}

/**
 * General validator which check selected website and language
 *
 * @param {ValidatorInfo}
 * @param {History} history
 * @return {void}
 */
const validator = ({ path, search, info }: ValidatorInfo, history: History): void => {
  // Get website and language from cache
  let website = client.cache.readQuery({
    query: queries.LOCAL_SELECTED_WEBSITE
  }) as LooseObject;
  if (website) {
    website = website.website;
  }
  let language = client.cache.readQuery({
    query: queries.LOCAL_SELECTED_LANGUAGE
  }) as LooseObject;
  if (language) {
    language = language.language;
  }

  let newSearch = search.replace('?', '');
  if (info.website) {
    if (info.website !== website) {
      // Select website from url
      client.mutate({
        mutation: mutations.LOCAL_SELECT_WEBSITE,
        variables: {
          id: info.website
        }
      });
    }
  } else {
    if (!website) {
      history.push('/selector');
      return;
    }
    
    // Add website into search
    if (newSearch.length > 1) {
      newSearch += '&';
    }
    newSearch += 'website=' + website;
  }

  if (info.language) {
    if (info.language !== language && info.language !== 'null') {

      console.log('setting new lang', info.language);
      client.mutate({
        mutation: mutations.LOCAL_SELECT_LANGUAGE,
        variables: {
          id: info.language
        }
      });
    }
  } else {
    if (!language) {
      history.push('/selector');
      return;
    }
    // Add language into search
    if (newSearch.length > 1) {
      newSearch += '&';
    }
    newSearch += '&language=' + language;
  }

  // If search is different, than replace url
  if (search !== newSearch) {
    history.replace(`${path}?${newSearch}`);
  }
};

/**
 * General handler which handle language changes
 *
 * @param {ValidatorInfo} info
 * @param {History} history
 * @param {string} name of change
 * @return {void}
 */
const handler = ({ path, search, info }: ValidatorInfo, history: History, name: string): void => {
  // If language was changed
  if (name === 'language') {
    let language = client.cache.readQuery({
      query: queries.LOCAL_SELECTED_LANGUAGE
    }) as LooseObject;
    if (language) {
      language = language.language;
    }

    const newSearch = search.replace(/language=[a-z0-9]+/g, `language=${language}`).replace(/[\?]*/g, '');
    history.push(`${path}?${newSearch}`);
  }
};

const GeneralValidator = {
  test: /.*/,
  validator,
  handler,
} as UrlValidator;

const Validators = [
  PageValidator,
] as UrlValidator[];

export {
  GeneralValidator,
  Validators,
};
