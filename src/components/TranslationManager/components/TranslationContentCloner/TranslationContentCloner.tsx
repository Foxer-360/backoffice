import * as React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { Row, Popover, Icon, Button } from 'antd';
import { ILooseObject } from '@foxer360/delta/lib/@types/@types';

const { Component } = React;

const GET_PAGE = gql`
  query page($pageId: ID!){
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
      translations {
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

const ComposedQuery = adopt({
  pageData: ({ render, variables: { pageId } }) => <Query query={GET_PAGE} variables={{ pageId }}>{page => render(page)}</Query>
});

export interface Properties {
  pageId: string;
  language: ILooseObject;
  resetPageContent: (id: String, content: LooseObject) => void;
}

export interface State {
  editingMode: boolean;
}

class TranslationContentCloner extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      editingMode: false
    };
  }

  cloneTranslation = (translations) => (sourceTranslationId) => {
    const { language, resetPageContent } = this.props;
    const { content: sourceTranslationContent } = translations
      .find(translation => sourceTranslationId === translation.id);
    const { id: targetTranslationId } = translations
      .find(translation => translation.language.id === language.id);
        resetPageContent(targetTranslationId, sourceTranslationContent);
        this.setState({ editingMode: false });
  }

  render() {
    const { pageId, language } = this.props;
    const { editingMode } = this.state;

    return (
      <ComposedQuery variables={{ pageId }}>
        {({
          pageData: {
            data,
            loading,
            error
          }
        }) => {
          if (loading) {
            return 'Loading...';
          } 

          if (error) {
            return 'Error...';
          } 
          const { page: { translations } } = data;

          return (
          <Popover
            visible={editingMode} 
            trigger="click" 
            content={this.getPopOverContent(
              translations.filter((translation) => translation.language.code !== language.code), 
              this.cloneTranslation(translations))}
            placement="bottomLeft"
          >
            <Icon
              style={{ marginLeft: 5 }}
              onClick={() => {
                this.setState({ editingMode: true });
              }}  
              type="copy" 
            />
          </Popover>);
        }}
      </ComposedQuery>);
  }

  getPopOverContent = (translations, updatePageTranslation) => {
    return (
    <div>
      <Row type="flex">
      {translations
        .map((translation) => (
          <Button
            style={{ marginRight: 10 }} 
            size={'small'}
            onClick={() => updatePageTranslation(translation.id)}
          >
            Copy content from {translation.language.englishName}
          </Button>)
        )
      }
        <Button
          size={'small'}
          onClick={() => {
            this.setState({ editingMode: false });
          }}
        >
          Cancel
        </Button>
      </Row>
    </div>);
  }

}

export default TranslationContentCloner;
