import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { adopt } from 'react-adopt';
import { Row, Button, Modal } from 'antd';
import { ILooseObject } from '@foxer360/delta/lib/@types/@types';

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
  displayCopy: boolean;
}

class TranslationContentCloner extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      displayCopy: false,
    };
  }

  showModal = () => this.setState({ displayCopy: true, });
  handleOk = (e) => this.setState({ displayCopy: false, });
  handleCancel = (e) => this.setState({ displayCopy: false, });

  cloneTranslation = (sourceTranslationContent, targetTranslationId) => {
    const { resetPageContent } = this.props;
    
    resetPageContent(targetTranslationId, sourceTranslationContent);
    this.setState({ displayCopy: false });
  }

  render() {

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
                title="Copy content to current page"
                visible={this.state.displayCopy}
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
        <Row type="flex" style={{ margin: '10px 0' }}>
          {currentPage.translations && currentPage.translations.length > 1 && 
            <strong>Copy content from current page:</strong> || ''
          }
        </Row>
        <Row type="flex" style={{ margin: '0 0 10px' }}>
          {currentPage && currentPage.translations
            .filter((translation) => translation.language.code !== language.code)
            .map((translation) => (
              <div style={{ width: '100%' }}>
                <Button
                  block={true}
                  size={'default'}
                  type={'dashed'}
                  onClick={() => 
                    updatePageTranslation(
                      translation.content, currentPage.translations
                      .find((t) => t.language.code === language.code).id
                    )}
                >
                  From {translation.language.englishName}
                </Button>
              </div>
              )
            )
          }
        </Row>
        <Row type="flex" style={{ margin: '0 0 10px' }}>
          <strong>Copy content from another page:</strong>
        </Row>
        <Row type="flex">

          {pages && pages.length > 0 &&
            <div>
              {pages.filter(p => p.id !== pageId).map((p, i) => 
                p.translations.map((t, j) => (
                  <Button 
                    key={j}
                    block={true}
                    type={'dashed'}
                    size={'default'}
                    style={{ marginBottom: 10 }}
                    onClick={() => 
                      updatePageTranslation(
                        t.content, currentPage.translations
                        .find((tr) => tr.language.code === language.code).id
                    )}
                  >
                    {t.name} - <span style={{ color: '#1890ff' }}>{t.language.code}</span>
                  </Button>
                ))
              )}
            </div>
          }
        </Row>
      </div>
    );
  }

}

export default TranslationContentCloner;