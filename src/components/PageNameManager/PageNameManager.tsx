import * as React from 'react';
import { Input, Button, Popover, Icon } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { ILooseObject } from '@source/composer/types';

const { Component } = React;

const UPDATE_PAGE_TRANSLATION_NAME = gql`
  mutation updatePageTranslationName($newPageName: String!, $translationId: ID!) {
    updatePageTranslation(data: { name: $newPageName }, where: { id: $translationId }) {
      id
      name
      content
      __typename
    }
  }
`;

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
        __typename
      }
      __typename
    }
  }
`;

const ComposedQuery = adopt({
  pageData: ({ render, variables: { pageId } }) => <Query query={GET_PAGE} variables={{ pageId }}>{page => render(page)}</Query>,
  updatePageTranslationName: ({ render, variables: { pageId } }) => (
    <Mutation
      mutation={UPDATE_PAGE_TRANSLATION_NAME}
      update={(cache, { data: { updatePageTranslationName } }) => {
        const { page } = cache.readQuery({ query: GET_PAGE });

        const updatedPage = { 
          ...page, 
          translations: page.translations.map((translation) => {
            if (translation.id === updatePageTranslationName.id ) {
              return updatePageTranslationName;
            } else {
              return translation;
            }
          })
        };

        cache.writeQuery({
          query: GET_PAGE,
          data: {
            page: updatedPage
          },
          variables: {
            pageId
          }
        });
      }}
    >
      {updatePageTranslationName => render(updatePageTranslationName)}
    </Mutation>
  )
});

export interface Properties {
  pageId?: string;
  popOver?: boolean;
  language: ILooseObject;
}

export interface State {
  newPageName: string; 
  editingMode: boolean;

}

class PageNameManager extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      newPageName: '',
      editingMode: false
    };
  }

  render(): JSX.Element {
    const { pageId, language } = this.props;
    const { editingMode } = this.state;

    return (
      <div>
        <ComposedQuery variables={{ pageId, languageCode: language.code }}>
          {({ pageData: { data, loading, error }, updatePageTranslationName }) => {
          
            if (loading) {
              return 'Loading...';
            } 

            if (error) {
              return 'Error...';
            } 

            const { page: { translations : { 0: { name: pageNameInLocalLanguage, id: pageTranslationId } }}} = data;
            const content = <div>
              <Button
                size={'small'}
                onClick={() => {
                  updatePageTranslationName({ variables: { 
                    newPageName: this.state.newPageName || pageNameInLocalLanguage, 
                    translationId: pageTranslationId
                  }});
                  this.setState({ editingMode: false });
                }} 
                type="primary"
                style={{ marginRight: 10 }}
              >
                Change name
              </Button>
              <Button
                size={'small'}
                onClick={() => {
                  this.setState({ editingMode: false });
                }}
              >
                Cancel
              </Button>
          </div>;

            if (!editingMode) {
              return (
                
                  <div 
                    onClick={() => {
                      this.setState({ editingMode: true });
                    }}
                  >
                    {pageNameInLocalLanguage} <Icon type="edit" />
                  </div>);
            } else {
              return <div>
                <Popover visible={true} content={content} trigger="click" placement="bottomLeft">
                  <Input 
                    size={'small'}
                    defaultValue={pageNameInLocalLanguage}
                    onChange={({ target: { value: newPageName }}) => {
                      this.setState({ newPageName });
                    }} 
                    placeholder="New page name" 
                    style={{ 
                      width: 200, 
                      marginBottom: 10
                    }}
                  />
                </Popover>
              </div>;
            }
          }}
        </ComposedQuery>
      </div>
    );
  }
}

export default PageNameManager;
