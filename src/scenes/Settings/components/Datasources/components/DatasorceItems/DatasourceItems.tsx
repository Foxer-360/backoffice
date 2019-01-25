import * as React from 'react';
import { Row, Table, Button, Popconfirm } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { client } from '@source/services/graphql';
import Pluralize from 'pluralize';
import { Link } from 'react-router-dom';

import Actions from '../Actions';

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

const DELETE_DATASOURCE_ITEM = gql`
  mutation deleteDatasourceItem($id: ID!) {
    deleteDatasourceItem(
      where: { id: $id }
    ) {
      id
      content
    }
  }
`;

const { Component } = React;

interface Properties extends RouteComponentProps<LooseObject> { }  

interface State {
  formData: {};
}

class DatasourceItems extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      formData: {}
    };

    this.onChange = this.onChange.bind(this);

  }

  public render() {
    const {
      match: {
        params: {
          id
        }
      },
      history: {
        push
      }
    } = this.props;

    return (
      <div>
        <Query query={DATASOURCE} variables={{ id }}>
          {({ data, loading, error }) => {

            if (loading) { 
              return 'loading...';
            }

            if (error) { 
              return 'error...';
            }

            const { datasource } = data;
            
            const datasourceItemColumns = [
              ...Object.keys(datasource.schema.properties).map((propertyKey, key) => {
                return {
                  key,
                  title: datasource.schema.properties[propertyKey].title,
                  dataIndex: propertyKey
                };
              }),
              {
                title: 'Actions',
                key: 'actions',
                render: (record) => {
                  console.log(record);
                  return (<Actions
                    id={record.id}
                    edit={() => push(`/datasource-item/${datasource.id}/${record.id}`)}
                    remove={async (datasourceItemId: string) => {
                      this.onDelete(datasource)(datasourceItemId);
                    }}
                  />);
                }
              }
            ];
            
            return  <div>
              <Row style={{ marginBottom: '20px' }}>
                <h2>{Pluralize(datasource.type, 42)}:</h2>
              </Row>
              <Row>
                <Button
                  type="primary"
                  style={{ marginBottom: 16 }}
                >
                  <Link to={`/datasource-item/${datasource.id}/new`}>Add new datasource item.</Link>
                </Button>
              </Row>
              <Row>
                <Table
                  columns={datasourceItemColumns} 
                  dataSource={datasource.datasourceItems.map(({ content, id: itemId }) => ({ ...content, id: itemId }) )} 
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
        push('/settings#datasources');
      }
    });
  }

  onDelete = (datasource) => (id) => {
    const { 
      history: {
        push
      }
    } = this.props;
    client.mutate({
      mutation: DELETE_DATASOURCE_ITEM,
      variables: {
        content: this.state.formData,
        id,
      },
      update: (cache, { data: { deleteDatasourceItem } }: LooseObject) => {
        cache.writeQuery({
          query: DATASOURCE,
          data: {
            datasource: { 
              ...datasource,
              datasourceItems: [
                ...datasource.datasourceItems.filter((datasourceItem) => datasourceItem.id !== deleteDatasourceItem.id)
              ]
            }
          },
          variables: {
            id: datasource.id
          }
        });
      }
    }).catch((e) => {
      console.log('error', e);
    });
  }

  onError(e: LooseObject) {
    console.log(e);
  }

}

export default withRouter(DatasourceItems);
