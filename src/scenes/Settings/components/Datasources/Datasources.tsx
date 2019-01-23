import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { message, Button, Table } from 'antd';
import DatasourceDetail from './components/DatasourceDetail';
import Actions from './components/Actions';
import gql from 'graphql-tag';

const { Component } = React;

import { Datasource } from './interfaces';

const DATASOURCE_LIST = gql`
  query {
    datasources {
      id
      type
      schema
      displayInNavigation
    }
  }
`;

const CREATE_DATASOURCE = gql`
  mutation createDatasource(
    $type: String
    $schema: Json
    $displayInNavigation: Boolean
  ) {
    createDatasource(data: { 
      type: $type,
      schema: $schema,
      displayInNavigation: $displayInNavigation
    }) {
      id
      type
      schema
      displayInNavigation
    }
  }
`;

const UPDATE_DATASOURCE = gql`
  mutation updateDatasource(
    $type: string
    $schema: Json
    $displayInNavigation: Boolean
    $id: ID!
  ) {
    updateDatasource(data: {
      type: $type
      schema: $schema
      displayInNavigation: $displayInNavigation
      
    },
    where: {
      id: $id
    }) {
      id
      type
      schema
      displayInNavigation
    }
  }
`;

const DELETE_DATASOURCE = gql`
  mutation deleteDatsource($id: ID!) {
    deleteDatasource(where: {  id: $id }) {
      id
    }
  }
`;

const DatasourceQM = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => {
        return render(data.website);
      }}
    </Query>
  ),
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data }) => {
        return render(data.language);
      }}
    </Query>
  ),
  datasources: ({ render, website }) => {
    if (!website) {
      return render([]);
    }

    return (
      <Query query={DATASOURCE_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render([]);
          }

          const datasources: Datasource[] = data.datasources.map((datasource: Datasource) => {
            const model = {
              id: datasource.id,
              type: datasource.type,
              schema: datasource.schema,
              displayInNavigation: datasource.displayInNavigation
            };
            return model;
          });

          return render(datasources);
        }}
      </Query>
    );
  },
  createDatasource: ({ website, render}) => (
    <Mutation
      mutation={CREATE_DATASOURCE}
      update={(cache, { data: { createDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: DATASOURCE_LIST,
          variables: { website },
          data: { datasources: datasources.concat([createDatasource]) }
        });
      }}
    >
      {createDatasource => {
        const fce = (data: LooseObject) => {
          createDatasource({ variables: { ...data, website }});
        };

        return render(fce);
      }}
    </Mutation>
  ),
  deleteDatasource: ({ render, website }) => (
    <Mutation
      mutation={DELETE_DATASOURCE}
      update={(cache, { data: { deleteDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: DATASOURCE_LIST,
          variables: { website },
          data: { datasources: datasources.filter((datasource: Datasource) => datasource.id !== deleteDatasource.id) }
        });
      }}
    >
      {deleteDatasource => render(deleteDatasource)}
    </Mutation>
  ),
  updateDatasource: ({ website, render }) => (
    <Mutation
      mutation={UPDATE_DATASOURCE}
      update={(cache, { data: { updateDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: DATASOURCE_LIST,
          variables: { website },
          data: {
            datasources: datasources.map((datasource: Datasource) => {
              if (datasource.id === updateDatasource.id) {
                return updateDatasource;
              }
              return datasource;
            })
          }
        });
      }}
    >
      {updateDatasource => {
        const fce = (data: LooseObject) => {
          updateDatasource({ variables: { ...data }});
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface Properties {
}

interface State {
  type: string;
  displayInNavigation: boolean;
  schema: string;
  id: string;
  edit: boolean;
  showModal: boolean;
}

interface CreateDatasourceOutput {
  data: {
    createDatasource: {
      id: string;
    };
  };
}

interface QaMForModalVars {
  datasources: Datasource[];
  website: string;
  createDatasource: (data: LooseObject) => Promise<void>;
  updateDatasource: (data: LooseObject) => Promise<void>;
  deleteDatasource: (data: LooseObject) => Promise<void>;
}

class Datasources extends Component<Properties, State> {

  private readonly DEFAULT: State = {
    id: null,
    type: '',
    displayInNavigation: false,
    schema: '',
    edit: false,
    showModal: false,
  };

  constructor(props: Properties) {
    super(props);
    this.state = { ...this.DEFAULT };
  }

  showCreateModal(): void {
    this.setState({ showModal: true });
  }

  showEditModal(id: string, datasource: Datasource): void {
    this.setState({
      id,
      type: datasource.type,
      displayInNavigation: datasource.displayInNavigation,
      schema: datasource.schema,
      edit: true,
      showModal: true
    });
  }

  render(): React.ReactNode {

    return (
      <>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => this.showCreateModal()}
        >
          Add new datasource
        </Button>
        <DatasourceQM>
          {({ datasources, website, createDatasource, updateDatasource, deleteDatasource }: QaMForModalVars) => {
            const tableData = datasources.map((a: Datasource) => ({ ...a, key: a.id }));

            const COLUMNS = [{
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              width: '30%',
            }, {
              title: 'Display in Navigation',
              key: 'displayInNavigation',
              width: '18%',
              render: (record: Datasource) => (
                <span>{record.displayInNavigation ? 'Yes' : 'No'}</span>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (record: Datasource) => (
                <Actions
                  id={record.id}
                  edit={(id: string) => this.showEditModal(id, datasources.find(a => a.id === id))}
                  remove={async (id: string) => {
                    await deleteDatasource({ variables: { id } });
                    message.success('Datasource removed!');
                  }}
                />
              )
            }];

            return (
              <>
                <Table columns={COLUMNS} dataSource={tableData} />
                <DatasourceDetail
                  visible={this.state.showModal}
                  edit={this.state.edit}
                  data={{
                    type: this.state.type,
                    displayInNavigation: this.state.displayInNavigation,
                    schema: this.state.schema,
                  }}
                  onSave={async (type: string, displayInNavigation: boolean, schema: string) => {
                    this.setState({ showModal: false });
                    const data = {
                      type,
                      displayInNavigation,
                      schema,
                    };

                    if (this.state.edit) {
                      await updateDatasource({ ...data, id: this.state.id });
                      message.success('Datasource updated!');
                      this.setState({ ...this.DEFAULT });
                    } else {
                      await createDatasource({ ...data, website: { connect: { id: website } } });
                      message.success('Datasource created!');
                    }
                  }}
                  onCancel={() => this.setState({ ...this.DEFAULT })}
                />
              </>
            );
          }}
        </DatasourceQM>
      </>
    );
  }
}

export default Datasources;