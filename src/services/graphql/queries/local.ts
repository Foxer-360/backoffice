import gql from 'graphql-tag';

export const LOCAL_SELECTED_LANGUAGE = gql`
  query getSelectedLanguage {
    language @client
  }
`;

export const LOCAL_SELECTED_PAGE = gql`
  query getSelectedPage {
    page @client
  }
`;

export const LOCAL_SELECTED_PROJECT = gql`
  query getSelectedProject {
    project @client
  }
`;

export const LOCAL_SELECTED_WEBSITE = gql`
  query getSelectedWebsite {
    website @client
  }
`;
