import gql from 'graphql-tag';
import { fragments } from '../fragments';

export const LANGUAGES = gql`
  query languages {
    languages {
      id
      name
      code
    }
  }
`;

export const LANGUAGES_FOR_PROJECT = gql`
  query languagesForProject($id: ID!) {
    project( where: { id: $id } ) {
      id
      languages {
        id
        name
        code
      }
    }
  }
`;

export const LANGUAGES_FOR_WEBSITE = gql`
  query languagesForWebsite($id: ID!) {
    website( where: { id: $id} ) {
      id
      languages {
        id
        name
        code
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query getProjects {
    projects {
      id,
      name,
      websites {
        id
        title
        defaultLanguage {
          id
          name
        }
      }
      languages {
        id
        name
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query getProject($id: ID!) {
    project( where: { id: $id } ) {
      id
      name
      defaultName
      websites {
        id
        title
        defaultLanguage {
          id
          name
        }
      }
      languages {
        id
        name
      }
      defaultLanguage {
        id
        name
      }
    }
  }
`;

export const WEBSITE_DETAIL = gql`
  query getWebsiteDetail($id: ID!) {
    website( where: { id: $id } ) {
      id
      title
      languages {
        id
        code
        name
      }
      defaultLanguage {
        id
        code
        name
      }
      urlMask
      project {
        id
      }
    }
  }
`;

/**
 * Get list of pages for given website. This list
 * is informative, without detailed info
 */
export const PAGE_LIST = gql`
  query getPageList($website: ID!) {
    pages( where: { website: { id: $website } } ) {
      id
      parent {
        id
      }
      type {
        id
        name
      }
      translations {
        id
        language {
          id
          code
        }
        url
        name
      }
    }
  }
`;

export const PAGE_DETAIL = gql`
  query getPageDetail($id: ID!) {
    page( where: { id: $id } ) {
      id
      parent {
        id
      }
      type {
        id
        name
      }
      translations {
        id
        language {
          id
          code
        }
        url
        name
        status
        content
      }
    }
  }
`;

export const PAGE_TYPE_LIST = gql`
  query getPageTypeList($website: ID!) {
    pageTypes( where: { website: { id: $website } }) {
      id
      name
      plugins
      content
    }
  }
`;

export const PAGE_TASK_LIST = gql`
  query getPageTaskList($pageTranslation: ID!) {
    pageTasks(
      where: { pageTranslation: { id: $pageTranslation } }
      orderBy: updatedAt_DESC
    ) {
      ...TaskDetail
    }
  }
  ${fragments.TASK_FRAGMENT}
`;

export const PAGE_CHAT_LIST = gql`
  query getPageChatList($page: ID!) {
    pageChats(
      where: { page: { id: $page } }
      orderBy: createdAt_DESC
    ) {
      ...ChatDetail
    }
  }
  ${fragments.CHAT_FRAGMENT}
`;

// subscription onPageChatIsAdded($page: ID!) {
//   pageChat(
//     where: {
//       node: {
//         page: {
//           id: $page
//         }
//       }
//     }
//   ) {
//     node {
//       id
//       text
//       createdAt
//     }
//   }
// }

export const NAVIGATION_LIST = gql`
  query getNavigations($website: ID!) {
    navigations( where: { website: { id: $website } } ) {
      id
      name
    }
  }
`;

export const NAVIGATION_PAGE_LIST = gql`
  query getPageList($website: ID!) {
    pages( where: { website: { id: $website } } ) {
      id
      parent {
        id
      }
      translations {
        id
        language {
          id
          code
        }
        url
        name
      }
    }
  }
`;

export const NAVIGATION_NODES = gql`
  query getNavigationNodes($navigation: ID!) {
    navigationNodes(
      where: { navigation: { id: $navigation } }
    ) {
      id
      page
      order
      parent
      navigation {
        id
      }
    }
  }
`;

export const PAGE_PLUGINS = gql`
  query getPagePlugins($page: ID!, $language: ID!, $plugin: String!) {
    pagePlugins( where: {
      page: { id: $page },
      language: { id: $language },
      plugin: $plugin
    } ) {
      id
      page {
        id
      }
      language {
        id
      }
      plugin
      content
    }
  }
`;

export const TAG_LIST = gql`
  query getTags($website: ID!) {
    tags( where: { website: { id: $website } } ) {
      id
      name
      displayInNavigation
      plugins
      color
    }
  }
`;