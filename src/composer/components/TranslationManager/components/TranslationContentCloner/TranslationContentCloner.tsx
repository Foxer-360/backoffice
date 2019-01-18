import * as React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { Row, Popover, Icon, Button, TreeSelect, Modal } from 'antd';
import { ILooseObject } from '@foxer360/delta/lib/@types/@types';
import { spawn } from 'child_process';

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
  pagesData: ({ render }) => <Query query={GET_PAGES}>{page => render(page)}</Query>
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

  showModal = () => this.setState({ editingMode: true, });	
  handleOk = (e) => this.setState({ editingMode: false, });	
  handleCancel = (e) => this.setState({ editingMode: false, });

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
          if (loading) { return 'Loading...'; } 
          if (error) { return 'Error...'; }

          const { pages } = data;

          return (
            <span style={{ float: 'right' }}>
              <Button
                type={'default'}
                icon={'copy'}
                size={'small'}
                onClick={this.showModal}
              />
              <Modal
                title={'Copy content to current page'}
                visible={this.state.editingMode}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={null}
              >
                {this.getPopOverContent(pages, pageId, this.cloneTranslation)}
              </Modal>
            </span>
          );
        }}
      </ComposedQuery>);
  }

  getPopOverContent = (pages, pageId, updatePageTranslation) => {
    const { language } = this.props;
    const currentPage = pages.find(p => p.id === pageId);

    return (
      <div>
        {currentPage.translations && currentPage.translations.length > 1 &&
          <Row type="flex" style={{ margin: '10px 0' }}>
            <strong>Copy content from current page:</strong> 
          </Row>
        }
        <Row type="flex" style={{ margin: '0 0 10px' }}>
        {currentPage && currentPage.translations
          .filter((translation) => translation.language.code !== language.code)
          .map((translation, i) => (
            <Button
              key={i}
              style={{ marginRight: 10 }} 
              size={'small'}
              type={'dashed'}
              onClick={() => 
                updatePageTranslation(
                  translation.content, currentPage.translations
                  .find((t) => t.language.code === language.code).id
                )}
            >
             {translation.language.code}
            </Button>
            )
          )
        }
        </Row>
        <Row type="flex" style={{ margin: '0 0 10px' }}>
          {pages && pages.length > 0  && <strong>Copy content from another page:</strong> || ''}
        </Row>
        <Row type="flex">
          {pages && pages.length > 0  && (
            <TreeSelect
              showSearch={true}
              size={'default'}
              style={{ width: '100%', marginRight: 10 }}
              dropdownStyle={{ maxHeight: 400, maxWidth: 300, overflow: 'auto' }}
              placeholder="Click"
              allowClear={true}
              treeDefaultExpandAll={true}
            >
              {pages.filter(p => p.id !== pageId).map((p, i) => (
                <TreeNode 
                  selectable={false} 
                  value={JSON.stringify(p.translations.map(t => t.name))} 
                  title={`${p.translations[0].name}`} 
                  key={p.id}
                >
                  {p.translations.map(t =>
                    <TreeNode
                      value={`${t.name}`}
                      selectable={false}
                      title={
                        <span>
                          copy <strong>{t.name}</strong> from: 
                          <Button 
                            type={'dashed'}
                            size={'small'}
                            style={{ marginLeft: 5 }}
                            onClick={() => 
                              updatePageTranslation(
                                t.content, currentPage.translations.find((tr) => tr.language.code === language.code).id)}
                          >
                            {t.language.code}
                          </Button>
                        </span>
                        } 
                      key={t.id} 
                    />
                  )}
                </TreeNode>))
              }
            </TreeSelect>)
          }
        </Row>
      </div>
    );
  }

}

export default TranslationContentCloner;