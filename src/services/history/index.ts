import createHistory from 'history/createBrowserHistory';
import { GeneralValidator, Validators, ValidatorInfo } from './resources';
import { client, queries } from '@source/services/graphql';

const history = createHistory();

// Array of excluded urls
const EXCLUDE_URL = [
  /\/?selector/,
  /\/?callback/,
];

/**
 * Helper function to parse informations from search part
 * of url
 *
 * @param {string} search
 * @return {LooseObject}
 */
const parseSearch = (search: string): LooseObject => {
  // Parse information from search
  const languageRe = /language=([a-z0-9]+)/;
  const language = location.search.match(languageRe);

  const pageRe = /page=([a-z0-9]+)/;
  const page = location.search.match(pageRe);

  const projectRe = /project=([a-z0-9]+)/;
  const project = location.search.match(projectRe);

  const websiteRe = /website=([a-z0-9]+)/;
  const website = location.search.match(websiteRe);

  const tagRe = /tag=([a-z0-9]+)/;
  const tag = location.search.match(tagRe);

  const result = {
    language: null,
    page: null,
    project: null,
    website: null,
    languages: null,
    navigations: null,
    tag: null,
  } as LooseObject;

  if (language) {
    result.language = language[1];
  }
  if (page) {
    result.page = page[1];
  }
  if (project) {
    result.project = project[1];
  }
  if (website) {
    result.website = website[1];
  }

  if (tag) {
    result.tag = tag[1];
  }

  return result;
};

/**
 * Helper function to check if this pathname is excluded
 * from validation
 *
 * @param {string} pathname
 * @param {RegExp[]} exclude
 * @return {boolean}
 */
const isExcluded = (pathname: string, exclude: RegExp[]): boolean => {
  const res = exclude.find((re: RegExp) => {
    return re.test(pathname);
  });

  if (res) {
    return true;
  }

  return false;
};

/**
 * Validation function for the router. This validation is for
 * persistent urls and automatically check url and local state
 * and make them consistent. Also, it loads all necessary data like
 * website detail or languages, etc
 *
 * @param {string} pathname
 * @param {string} search
 * @return {void}
 */
const validateUrl = (pathname: string, search: string): void => {
  // Parse information from search
  const info = parseSearch(search);

  // Check if it's excluded
  const excluded = isExcluded(pathname, EXCLUDE_URL);
  if (excluded) {
    return;
  }

  // Find validator
  const validator = Validators.find(val => {
    return val.test.test(location.pathname);
  });
  if (validator) {
    validator.validator({ path: pathname, search, info }, history);
  } else {
    GeneralValidator.validator({ path: pathname, search, info }, history);
  }
};

// Add listener to handle persistent urls
history.listen((location: LooseObject, action: string) => {
  // Perform validation of url just on PUSH and POP action
  if (action === 'PUSH' || action === 'POP') {
    validateUrl(location.pathname, location.search);
  }
});

// Validate newly created history
validateUrl(history.location.pathname, history.location.search);

/**
 * Generate ValidatorInfo object from history
 *
 * @return {ValidatorInfo}
 */
const generateValidatorInfo = () => {
  const res = {
    path: history.location.pathname,
    search: history.location.search,
    info: parseSearch(history.location.search)
  } as ValidatorInfo;

  return res;
};

// Add listener to Apollo to handle changes like
// language switch
const observableLanguageQuery = client.watchQuery({
  query: queries.LOCAL_SELECTED_LANGUAGE
});
observableLanguageQuery.subscribe({
  next: ({ data }) => {
    const info = generateValidatorInfo();

    const excluded = isExcluded(info.path, EXCLUDE_URL);
    if (excluded) {
      return;
    }

    // Match path and call handler
    const validator = Validators.find(val => {
      return val.test.test(location.pathname);
    });
    if (validator) {
      validator.handler(info, history, 'language');
    } else {
      GeneralValidator.handler(info, history, 'language');
    }
  },
});

export default history;
