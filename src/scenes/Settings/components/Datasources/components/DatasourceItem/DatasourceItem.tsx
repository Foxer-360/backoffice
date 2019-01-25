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
      datasourceItems {
        id
        content
      }
    }
  }
`;

const CREATE_DATASOURCE_ITEM = gql`
  mutation createDatasourceItem($id: ID!, $content: Json!) {
    createDatasourceItem(
      data: {
        content: $content,
        datasource: {
          connect: {
            id: $id
          }
        },
      }
    ) {
      id
      content
    }
  }
`;

const UPDATE_DATASOURCE_ITEM = gql`
  mutation updateDatasourceItem($id: ID!, $content: Json!) {
    updateDatasourceItem(
      data: {
        content: $content,
      },
      where: {
        id: $id
      }
    ) {
      id
      content
    }
  }
`;

const { Component } = React;

interface Properties extends RouteComponentProps<LooseObject> { }  

interface State {
  formData?: {};
}

class DatasourceItem extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      formData: null
    };

    this.onChange = this.onChange.bind(this);

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
                <Form 
                  schema={datasource.schema}
                  uiSchema={datasource.uiSchema || {}}
                  onChange={this.onChange}
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

  onChange({ formData }: LooseObject) {
    this.setState({ formData });
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
