import * as React from 'react';
import { Row, Table, Button, Col, Input } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import { client } from '@source/services/graphql';
import Pluralize from 'pluralize';
import { Link } from 'react-router-dom';

import Actions from '../Actions';
const Search = Input.Search;

const DATASOURCE = gql`
  query datasource($id: ID!) {
    datasource(where: { id: $id }) {
      id
      type
      schema
      datasourceItems {
        id
        slug
        content
        createdAt
        updatedAt
      }
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
  searchedText?: string;
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
              {
                title: 'Slug',
                key: 'slug',
                dataIndex: 'slug'
              },
              {
                title: 'Created at',
                key: 'createdAt',
                dataIndex: 'createdAt'
              },
              {
                title: 'Updated at',
                key: 'updatedAt',
                dataIndex: 'updatedAt'
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (record) => {
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
              <div className="pages-filter-header">
                <Row type="flex" justify="end">
                  <Col span={6}>
                    <Button type="primary">
                      <Link to={`/datasource-item/${datasource.id}/new`}>Add new datasource item.</Link>
                    </Button>
                  </Col>
                  <Col span={14} />
                  <Col span={4}>
                    <Search
                      placeholder="search text"
                      onChange={({ target: { value: searchedText } }) => this.setState({ searchedText })}
                      onSearch={searchedText => this.setState({ searchedText })}
                    />
                  </Col>
                </Row>
              </div>
              <Row>
                <Table
                  columns={datasourceItemColumns} 
                  dataSource={datasource.datasourceItems.filter(item => 
                    !this.state.searchedText ||
                    JSON.stringify(item).toLowerCase().includes(this.state.searchedText.toLowerCase()))} 
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
