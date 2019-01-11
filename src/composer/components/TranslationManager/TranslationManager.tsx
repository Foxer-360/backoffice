import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { ILooseObject } from '@source/composer/types';
import { TranslationContentCloner, TranslationTextManager } from './components';

const { Component } = React;

export interface Properties {
  pageId?: string;
  popOver?: boolean;
  language: ILooseObject;
  resetPageContent: (id: String, content: LooseObject) => void;
}

export interface State {
  translation: ILooseObject; 
  editingMode: boolean;

}

const GET_PAGE = gql`
  query page($pageId: ID!, $languageCode: String ){
    page(where: { id: $pageId }) {
      id
      type {
        id
        name
        __typename
      }
      tags {
        id
        name
        __typename
      }
      translations(where: {language: {code: $languageCode}}) {
        id
        name
        content
        url
        description
        language {
          id
          code
          name
          englishName
        }
        __typename
      }
      __typename
    }
  }
`;

class TranslationManager extends Component<Properties, State> {

  render(): JSX.Element {
    const { pageId, language, resetPageContent } = this.props;

    return (
        <Query query={GET_PAGE} variables={{ pageId, languageCode: language.code }} >
          {({ data, loading, error }) => {

            if (loading) { return 'Loading...'; }
            if (error) { return 'Error...'; }

            const { page: { translations : { 0: translation }}} = data;

            return (
            <span>{translation.name} 
              <TranslationContentCloner
                language={language} 
                resetPageContent={resetPageContent}
              />
              <TranslationTextManager 
                pageId={pageId} 
                language={language} 
              />
            </span>);
          }}
        </Query>
    );
  }
}

export default TranslationManager;
