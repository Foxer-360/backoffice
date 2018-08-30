import { History } from 'history';
import { client, mutations, queries } from '@source/services/graphql';
import { ValidatorInfo } from '.';

const validator = ({ path, search, info }: ValidatorInfo, history: History): void => {
  // Get website, language and page from cache
  const { website } = client.cache.readQuery({
    query: queries.LOCAL_SELECTED_WEBSITE
  });
  const { language } = client.cache.readQuery({
    query: queries.LOCAL_SELECTED_LANGUAGE
  });
  const { page } = client.cache.readQuery({
    query: queries.LOCAL_SELECTED_PAGE
  });

  let newSearch = search.replace('?', '');

  // Process website
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
      return history.push('/selector');
    }
    // Add website into search
    if (newSearch.length > 1) {
      newSearch += '&';
    }
    newSearch += 'website=' + website;
  }

  // Process language
  if (info.language) {
    if (info.language !== language) {
      // Select language from url
      client.mutate({
        mutation: mutations.LOCAL_SELECT_LANGUAGE,
        variables: {
          id: info.language
        }
      });
    }
  } else {
    if (!language) {
      return history.push('/selector');
    }
    // Add language into search
    if (newSearch.length > 1) {
      newSearch += '&';
    }
    newSearch += 'language=' + language;
  }

  // Process page
  if (info.page) {
    if (info.page !== page) {
      // Select page from url
      client.mutate({
        mutation: mutations.LOCAL_SELECT_PAGE,
        variables: {
          id: info.page
        }
      });
    }
  } else {
    if (!page) {
      return history.push('/selector');
    }
    // Add page into search
    if (newSearch.length > 1) {
      newSearch += '&';
    }
    newSearch += 'page=' + page;
  }

  // If search is different, than replace url
  if (search !== newSearch) {
    history.replace(`${path}?${newSearch}`);
  }
};

export const PageValidator = {
  test: /^\/?page[^s]*$/g,
  validator,
};
