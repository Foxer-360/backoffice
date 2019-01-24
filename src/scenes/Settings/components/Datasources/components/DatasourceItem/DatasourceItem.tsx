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

class DatsourceItem extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      formData: {}
    };

    this.onChange = this.onChange.bind(this);

  }

  public render() {

    const {  } = this.state;
    const {
      match: {
        params: {
          id
        }
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
                render: (record) => (
                  <>
                    <Popconfirm
                      title="Are you sure, you want to remove this record?"
                      onConfirm={() => this.onDelete(datasource)(record.id)}
                    >
                      <Button size="small" type="danger">Remove</Button>
                    </Popconfirm>
                  </>
                )
              }
            ];
            
            return  <div>
              <Row style={{ marginBottom: '20px' }}>
                <h2>New datasource item:</h2>
              </Row>
              <Row>
                <Col span={8}>
                  <Form 
                    schema={datasource.schema}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit(datasource)}
                    onError={this.onError}
                    formData={this.state.formData || {}}
                  />
                </Col>
                <Col span={16}>
                  <Table
                    columns={datasourceItemColumns} 
                    dataSource={datasource.datasourceItems.map(({ content, id: itemId }) => ({ ...content, id: itemId }) )} 
                  />
                </Col>
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
      }
    }).catch((e) => {
      console.log('error', e);
    });
  }

  onDelete = (datasource) => (id) => {
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

export default withRouter(DatsourceItem);
