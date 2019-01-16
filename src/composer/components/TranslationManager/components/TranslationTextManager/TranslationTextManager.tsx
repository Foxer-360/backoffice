import * as React from 'react';
import { Input, Button, Popover, Icon, Form, Row, Modal } from 'antd';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
import { ILooseObject } from '@source/composer/types';

const { Component } = React;
const { Item: FormItem } = Form;
const { TextArea } = Input;

const UPDATE_PAGE_TRANSLATION = gql`
  mutation updatePageTranslation($name: String!, $url: String!, $description: String, $id: ID!) {
    updatePageTranslation(data: { name: $name, url: $url, description: $description }, where: { id: $id }) {
      id
      name
      url
      description
      content
      language {
        id
        code
        name
        englishName
      }
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
  pageData: ({ render, variables: { pageId, languageCode } }) => <Query query={GET_PAGE} variables={{ pageId, languageCode }}>{page => render(page)}</Query>,
  updatePageTranslation: ({ render, variables: { pageId } }) => (
    <Mutation
      mutation={UPDATE_PAGE_TRANSLATION}
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
  translation: ILooseObject; 
  editingMode: boolean;
}

class TranslationTextManager extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      translation: {},
      editingMode: false
    };
  }

  showModal = () => {
    this.setState({
      editingMode: true,
    });
  }

  handleOk = () => {
    this.setState({
      editingMode: false,
    });
  }

  handleCancel = () => {
    this.setState({
      editingMode: false,
    });
  }

  render(): JSX.Element {
    const { pageId, language } = this.props;

    return (
      <ComposedQuery variables={{ pageId, languageCode: language.code }}>
        {({ pageData: { data, loading, error }, updatePageTranslation }) => {
        
          if (loading) {
            return 'Loading...';
          } 

          if (error) {
            return 'Error...';
          } 

          const { page: { translations : { 0: translation }}} = data;
          return (
            <span style={{ float: 'right', marginRight: 10 }}>
              <Button 
                type={'default'} 
                icon={'edit'} 
                size={'small'} 
                onClick={this.showModal}
              />
              <Modal
                title="Update Page Info"
                visible={this.state.editingMode}
                onCancel={this.handleCancel}
                footer={[
                  <Button 
                    key="submit" 
                    type="primary" 
                    size="default" 
                    onClick={() => {
                      updatePageTranslation({ variables: { 
                        ...translation,
                        ...this.state.translation
                      }}).then(this.handleCancel);
                    }}
                  >
                    Update
                  </Button>,
                  <Button key="back" onClick={this.handleCancel}>Cancel</Button>
                ]}
              >
                {this.getPopOverContent(translation)}
              </Modal>
            </span>
          );
        }}
      </ComposedQuery>
    );
  }

  getPopOverContent = (translation) => {

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      }, 
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div>
        <FormItem label="Page name" {...formItemLayout}>
          <Input
            placeholder="Page name"
            size={'default'}
            defaultValue={translation.name}
            prefix={<Icon type="bold" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={({ target: { value: newName }}) => {
              this.setState({
                translation: {
                  ...translation,
                  name: newName
                }
              });
            }}
          />
        </FormItem>
        <FormItem label="Url slag" {...formItemLayout}>
          <Input
            placeholder="Url slag"
            size={'default'}
            defaultValue={translation.url}
            prefix={<Icon type="link" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={({ target: { value: newUrl }}) => {
              this.setState({
                translation: {
                  ...translation,
                  url: newUrl
                }
              });
            }}
          />
        </FormItem>
        <FormItem label="Description" {...formItemLayout}>
          <TextArea
            placeholder="Description"
            defaultValue={translation.description}
            onChange={({ target: { value: newDescription }}) => {
              this.setState({
                translation: {
                  ...translation,
                  description: newDescription
                }
              });
            }}
          />
        </FormItem>
      </div>
    );
  }
}

export default TranslationTextManager;