import * as React from 'react';
import { Row, Col, Table, Button, Popconfirm } from 'antd';
import Form from 'react-jsonschema-form';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { client } from '@source/services/graphql';

const DATASOURCE = gql`
  query datasource($id: ID!) {
    datasource(where: { id: $id }) {
      id
      type
      schema
      slug
      datasourceItems {
        id
        slug
        content
      }
    }
  }
`;

const CREATE_DATASOURCE_ITEM = gql`
  mutation createDatasourceItem($id: ID!, $content: Json!, $slug: String!) {
    createDatasourceItem(
      data: {
        content: $content,
        slug: $slug,
        datasource: {
          connect: {
            id: $id
          }
        },
      }
    ) {
      id
      slug
      content
    }
  }
`;

const UPDATE_DATASOURCE_ITEM = gql`
  mutation updateDatasourceItem($id: ID!, $content: Json!, $slug: String!) {
    updateDatasourceItem(
      data: {
        content: $content,
        slug: $slug
      },
      where: {
        id: $id
      }
    ) {
      id
      slug
      content
    }
  }
`;

const { Component } = React;

interface Properties extends RouteComponentProps<LooseObject> { }  

interface State {
  formData?: {};
  slug: String;
}

class DatasourceItem extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      formData: null,
      slug: ''
    };
  }

  public render() {
    const {
      match: {
        params: {
          datasourceId,
          datasourceItemId,
          ...rest
        }
      }
    } = this.props;

    return (
      <div>
        <Query query={DATASOURCE} variables={{ id: datasourceId }}>
          {({ data, loading, error }) => {

            if (loading) { 
              return 'loading...';
            }

            if (error) { 
              return 'error...';
            }

            const { datasource } = data;
            return  <div>
              <Row>
                <h3>Url slug: {this.state.slug}</h3>
              </Row>
              <Row>
                <Form 
                  schema={datasource.schema}
                  uiSchema={datasource.uiSchema || {}}
                  onChange={this.onChange(datasource)}
                  onSubmit={this.onSubmit(datasource)}
                  onError={this.onError}
                  formData={
                    this.state.formData ||
                    (datasourceItemId && 
                      datasourceItemId !== 'new' &&
                      datasource.datasourceItems
                        .find(item => item.id === datasourceItemId).content
                    ) || {}}
                />
              </Row>
            </div>;

          }}
        </Query>
      </div>
    );
  }

  onChange = (datasource) => async ({ formData }: LooseObject) => {

    await this.setState({ formData });
    const slug = datasource.slug
      .map(p => 
        p.split('.').reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, formData) || ''
      )
      .join('-').toLowerCase();
    const uniqueSlug = this.getUniqueSlug(datasource, slug, 0);

    await this.setState({ 
      slug: uniqueSlug
    });
  }

  getUniqueSlug = (datasource: LooseObject, slug: string, index: number) => {
    const {
      match: {
        params: {
          datasourceItemId
        }
      }
    } = this.props;

    if (datasource.datasourceItems.some(item => item.slug === `${slug}-${index}` && datasourceItemId !== item.id)) {
      index++;
      return this.getUniqueSlug(datasource, slug, index);
    } else {
      return `${slug}-${index}`;
    }
  }

  onSubmit = (datasource) => () => {
    const {
      match: {
        params: {
          datasourceItemId,

        }
      }
    } = this.props;

    if (datasourceItemId === 'new') { 
      this.createNewItem(datasource); 
      return;
    }

    this.updateItem(datasource, datasourceItemId);

  }

  createNewItem(datasource: LooseObject) {
    const { 
      history: {
        push
      }
    } = this.props;
    client.mutate({
      mutation: CREATE_DATASOURCE_ITEM,
      variables: {
        content: this.state.formData,
        slug: this.state.slug,
        id: datasource.id,
      },
      update: (cache, { data: { createDatasourceItem } }: LooseObject) => {
        cache.writeQuery({
          query: DATASOURCE,
          data: {
            datasource: { 
              ...datasource,
              datasourceItems: [
                ...datasource.datasourceItems,
                createDatasourceItem
              ]
            }
          },
          variables: {
            id: datasource.id
          }
        });
        push(`/datasource-items/${datasource.id}`);
      }
    });
  }

  updateItem(datasource: LooseObject, id: String) {
    const { 
      history: {
        push
      }
    } = this.props;
    client.mutate({
      mutation: UPDATE_DATASOURCE_ITEM,
      variables: {
        content: this.state.formData,
        slug: this.state.slug,
        id,
      },
      update: (cache, { data: { updateDatasourceItem } }: LooseObject) => {
        cache.writeQuery({
          query: DATASOURCE,
          data: {
            datasource: { 
              ...datasource,
              datasourceItems: [
                ...datasource.datasourceItems.map((datasourceItem) => {
                  if (datasourceItem.id === updateDatasourceItem.id) { return updateDatasourceItem; }
                  return datasourceItem;
                }),
              ]
            }
          },
          variables: {
            id: datasource.id
          }
        });
        push(`/datasource-items/${datasource.id}`);
      }
    });
  }

  onError(e: LooseObject) {
    console.log(e);
  }

}

export default withRouter(DatasourceItem);
