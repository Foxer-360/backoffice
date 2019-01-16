import * as React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { Row, Popover, Icon, Button, TreeSelect } from 'antd';
import { ILooseObject } from '@foxer360/delta/lib/@types/@types';

const TreeNode = TreeSelect.TreeNode;
const { Component } = React;

const GET_CONTEXT = gql`
{
  page @client
}
`;

const GET_PAGES = gql`
  query pages{
    pages {
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
  getContext: ({ render }) => (
    <Query query={GET_CONTEXT} >
      {({ data }) => render(data)}
    </Query>
  ),
  pagesData: ({ render }) => <Query query={GET_PAGES} >{page => render(page)}</Query>
});

export interface Properties {
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

  cloneTranslation = (sourceTranslationContent, targetTranslationId) => {
    const { resetPageContent } = this.props;
    
    resetPageContent(targetTranslationId, sourceTranslationContent);
    this.setState({ editingMode: false });
  }

  render() {
    const { editingMode } = this.state;

    return (
      <ComposedQuery>
        {({
          pagesData: {
            data,
            loading,
            error
          },
          getContext: {
            page: pageId
          }
        }) => {
          if (loading) {
            return 'Loading...';
          } 

          if (error) {
            return 'Error...';
          } 
          const { pages } = data;

          return (
          <Popover
            visible={editingMode} 
            trigger="click" 
            content={this.getPopOverContent(
              pages, 
              pageId,
              this.cloneTranslation)}
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

  getPopOverContent = (pages, pageId, updatePageTranslation) => {
    const { language } = this.props;
    const currentPage = pages.find(p => p.id === pageId);
    return (
    <div>
      <Row type="flex" style={{ margin: '10px 0' }}>
        <strong>Copy content from current page:</strong>
      </Row>
      <Row type="flex" style={{ margin: '0 0 10px' }}>
      {currentPage && currentPage.translations
        .filter((translation) => translation.language.code !== language.code)
        .map((translation, i) => (
          <Button
            key={i}
            style={{ marginRight: 10, width: 100 }} 
            size={'small'}
            onClick={() => 
              updatePageTranslation(
                translation.content, currentPage.translations
                .find((t) => t.language.code === language.code).id
              )}
          >
            From {translation.language.englishName}
          </Button>)
        )
      }
      </Row>
      <Row type="flex" style={{ margin: '0 0 10px' }}>
        <strong>Copy from another page:</strong>
      </Row>
      <Row type="flex">
        {pages &&
          pages.length > 0  &&

          (<TreeSelect
            showSearch={true}
            size={'small'}
            style={{ width: 100, marginRight: 10 }}
            dropdownStyle={{ maxHeight: 300, maxWidth: 300, overflow: 'auto' }}
            placeholder="Click"
            allowClear={true}
            treeDefaultExpandAll={true}
          >
            {
              pages.filter(p => p.id !== pageId).map((p, i) =>
              (<TreeNode 
                selectable={false} 
                value={JSON.stringify(p.translations.map(t => t.name))} 
                title={`${p.translations[0].name}`} 
                key={p.id}
              >
                {p.translations.map(t =>
                  <TreeNode
                    value={`${t.name}`}
                    title={
                      <Button
                        size={'small'}
                        style={{ marginRight: 10 }}
                        onClick={() => 
                          updatePageTranslation(
                            t.content, currentPage.translations
                            .find((tr) => tr.language.code === language.code).id
                          )}
                      >
                        Copy from {t.language.englishName} ({t.name})  
                      </Button>} 
                    key={t.id} 
                  />
                )}
              </TreeNode>))
            }
          </TreeSelect>)
        }
        <Button
          size={'small'}
          style={{ width: 100 }}
          type="danger"
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
