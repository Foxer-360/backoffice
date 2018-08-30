import gql from 'graphql-tag';

export const TASK_FRAGMENT = gql`
  fragment TaskDetail on PageTask {
    id
    name
    description
    done
    updatedAt
  }
`;

export const CHAT_FRAGMENT = gql`
  fragment ChatDetail on PageChat {
    id
    text
    createdAt
  }
`;
