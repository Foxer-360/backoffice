import gql from 'graphql-tag';
import { fragments } from '../fragments';

export const CREATE_PROJECT = gql`
  mutation createProject($name: String!, $defaultName: String!,
    $languages: LanguageCreateManyInput, $defaultLanguage: LanguageWhereUniqueInput!) {
      createProject(
        data: {
          name: $name
          defaultName: $defaultName,
          languages: $languages
          defaultLanguage: {
            connect: $defaultLanguage
          }
        }
      ) {
        id
        name
        defaultName
        websites {
          id
          title
          urlMask
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

export const UPDATE_PROJECT = gql`
    mutation updateProject($id: ID!, $name: String!, $defaultName: String!,
      $languages: LanguageUpdateManyInput, $defaultLanguage: LanguageWhereUniqueInput!) {
        updateProject(
          where: {
            id: $id
          }
          data: {
            name: $name
            defaultName: $defaultName
            languages: $languages
            defaultLanguage: {
              connect: $defaultLanguage
            }
          }
        ) {
          id
          name
          defaultName
          websites {
            id
            title
            urlMask
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

export const REMOVE_PROJECT = gql`
    mutation removeProject($id: ID!) {
      deleteProject(
        where: {
          id: $id
        }
      ) { id }
    }
`;

export const CREATE_WEBSITE = gql`
  mutation createWebsite($title: String!, $project: ID!,
    $languages: LanguageCreateManyInput, $defaultLanguage: LanguageWhereUniqueInput,
    $urlMask: String!) {
    createWebsite(
      data: {
        title: $title
        project: {
          connect: { id: $project }
        }
        languages: $languages
        defaultLanguage: {
          connect: $defaultLanguage
        }
        urlMask: $urlMask
      }
    ) {
      id
      title
      urlMask
      defaultLanguage {
        id
        name
      }
      languages {
        id
        name
      }
    }
  }
`;

export const UPDATE_WEBSITE = gql`
  mutation updateWebsite($id: ID!, $title: String!,
    $languages: LanguageUpdateManyInput, $defaultLanguage: LanguageWhereUniqueInput,
    $urlMask: String!) {
    updateWebsite(
      where: {
        id: $id
      }
      data: {
        title: $title
        languages: $languages
        defaultLanguage: {
          connect: $defaultLanguage
        }
        urlMask: $urlMask
      }
    ) {
      id
      title
      urlMask
      defaultLanguage {
        id
        name
      }
      languages {
        id
        name
      }
    }
  }
`;

export const REMOVE_WEBSITE = gql`
  mutation removeWebsite($id: ID!) {
    deleteWebsite(
      where: {
        id: $id
      }
    ) {
      id
    }
  }
`;

export const CREATE_PAGE = gql`
  mutation createPage($website: WebsiteCreateOneWithoutPagesInput!, $parent: PageCreateOneInput,
    $type: PageTypeCreateOneInput!, $name: String, $url: String, $content: Json, $status: PageStatus!) {
    createPage(
      data: {
        parent: $parent
        website: $website
        type: $type
        name: $name
        url: $url
        content: $content
        status: $status
      }
    ) {
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

export const REMOVE_PAGE = gql`
  mutation removePage($id: ID!) {
    deletePage(
      where: { id: $id }
    ) { id }
  }
`;

export const CREATE_TASK = gql`
  mutation createTask($pageTranslation: PageTranslationCreateOneWithoutTasksInput!, $name: String!,
  $description: String!, $done: Boolean!) {
    createPageTask(
      data: {
        pageTranslation: $pageTranslation
        name: $name
        description: $description
        done: $done
      }
    ) {
      ...TaskDetail
    }
  }
  ${fragments.TASK_FRAGMENT}
`;

export const UPDATE_TASK = gql`
  mutation updateTask($id: ID!, $name: String!, $description: String!) {
    updatePageTask(
      where: { id: $id }
      data: {
        name: $name
        description: $description
      }
    ) {
      ...TaskDetail
    }
  }
  ${fragments.TASK_FRAGMENT}
`;

export const TOGGLE_TASK_DONE = gql`
  mutation toggleTask($id: ID!, $done: Boolean!) {
    updatePageTask(
      where: { id: $id }
      data: {
        done: $done
      }
    ) {
      ...TaskDetail
    }
  }
  ${fragments.TASK_FRAGMENT}
`;

export const REMOVE_TASK = gql`
  mutation removeTask($id: ID!) {
    deletePageTask(
      where: { id: $id }
    ) {
      ...TaskDetail
    }
  }
  ${fragments.TASK_FRAGMENT}
`;

export const CREATE_CHAT = gql`
  mutation createChat($page: PageCreateOneWithoutChatsInput!, $text: String!) {
    createPageChat(
      data: {
        page: $page
        text: $text
      }
    ) {
      ...ChatDetail
    }
  }
  ${fragments.CHAT_FRAGMENT}
`;

export const CREATE_PAGE_TYPE = gql`
  mutation createPageType($name: String!, $website: ID!, $content: Json, $plugins: [String!]!) {
    createPageType(
      data: {
        website: {
          connect: { id: $website }
        }
        name: $name
        content: $content
        plugins: {
          set: $plugins
        }
      }
    ) {
      id
      name
      content
      plugins
    }
  }
`;

export const UPDATE_PAGE_TYPE = gql`
  mutation updatePageType($id: ID!, $name: String!, $content: Json, $plugins: [String!]!) {
    updatePageType(
      where: {
        id: $id
      }
      data: {
        name: $name
        content: $content
        plugins: {
          set: $plugins
        }
      }
    ) {
      id
      name
      content
      plugins
    }
  }
`;

export const REMOVE_PAGE_TYPE = gql`
  mutation removePageType($id: ID!) {
    deletePageType(
      where: {
        id: $id
      }
    ) { id }
  }
`;

export const CREATE_NAVIGATION = gql`
  mutation createNavigation($data: NavigationCreateInput!) {
    createNavigation(
      data: $data
    ) {
      id
      name
    }
  }
`;

export const UPDATE_NAVIGATION = gql`
  mutation updateNavigation($id: ID!, $data: NavigationUpdateInput!) {
    updateNavigation(
      where: { id: $id },
      data: $data
    ) {
      id
      name
    }
  }
`;

export const DELETE_NAVIGATION = gql`
  mutation deleteNavigation($id: ID!) {
    deleteNavigation( where: { id: $id } ) {
      id
    }
  }
`;

export const CREATE_NAVIGATION_STRUCTURE = gql`
  mutation createNavigationStructure($id: ID!, $data: [NavigationNodeCreateInput]!) {
    createNavigationStructure(
      navigation: $id,
      data: $data
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

export const SAVE_PAGE_PLUGIN = gql`
    mutation savePagePlugin(
        $page: ID,
        $language: ID,
        $plugin: String!,
        $content: Json,
    ) {
        savePagePlugin(
            data: {
                page: {
                    connect: {
                        id: $page
                    }
                },
                language: {
                    connect: {
                        id: $language
                    }
                },
                plugin: $plugin,
                content: $content
            }
        ) {
            id
            plugin
            content
        }
    }
`;
