import gql from 'graphql-tag';

export const PAGE_CHAT_SUBSCRIPTION = gql`
  subscription onPageChat($page: ID!) {
    pageChat(
      where: {
        mutation_in: [CREATED]
        node: {
          page: { id: $page }
        }
    }) {
      mutation
      node {
        id
        text
        createdAt
        user {
          name
          avatar
          email
        }
      }
    }
  }
`;

export const PAGE_TASK_SUBSCRIPTION = gql`
  subscription onPageTask($pageTranslation: ID!) {
    pageTask(
      where: {
        mutation_in: [CREATED, UPDATED, DELETED]
        node: {
          pageTranslation: { id: $pageTranslation }
        }
    }) {
      mutation
      node {
        id
        name
        description
        done
        updatedAt
        user {
          name
          avatar
          email
        }
      }
    }
  }
`;
