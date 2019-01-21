import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { message, Button, Table } from 'antd';
import DatasourceModal from './components/DatasourceModal';
import Actions from './components/Actions';

const { Component } = React;

import { Datasource, QueryVariables, DatasourceWithJoin } from './interfaces';

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
      <Query query={queries.DATASOURCE_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render([]);
          }

          const datasources: Datasource[] = data.datasources.map((datasource: Datasource) => {
            const model = {
              id: datasource.id,
              name: datasource.name,
              displayInNavigation: datasource.displayInNavigation,
              plugins: datasource.plugins,
              color: datasource.color
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
      mutation={mutations.CREATE_DATASOURCE}
      update={(cache, { data: { createDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: queries.DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.DATASOURCE_LIST,
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
      mutation={mutations.DELETE_DATASOURCE}
      update={(cache, { data: { deleteDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: queries.DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.DATASOURCE_LIST,
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
      mutation={mutations.UPDATE_DATASOURCE}
      update={(cache, { data: { updateDatasource } }) => {
        const { datasources } = cache.readQuery({
          query: queries.DATASOURCE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.DATASOURCE_LIST,
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
  name: string;
  displayInNavigation: boolean;
  color: string;
  plugins: string[];
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
    name: null,
    displayInNavigation: false,
    color: '#FFFF',
    plugins: [],
    id: null,
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
      name: datasource.name,
      displayInNavigation: datasource.displayInNavigation,
      color: datasource.color,
      plugins: datasource.plugins,
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
            }, {
              title: 'Color',
              key: 'color',
              width: '12%',
              render: (record: Datasource) => (
                <span style={{ color: record.color}}>{record.color}</span>
              )
            }, {
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
                <DatasourceModal
                  visible={this.state.showModal}
                  edit={this.state.edit}
                  data={{
                    name: this.state.name,
                    displayInNavigation: this.state.displayInNavigation,
                    plugins: this.state.plugins,
                    color: this.state.color,
                  }}
                  onSave={async (name: string, displayInNavigation: boolean, color: string, plugins: string[]) => {
                    this.setState({ showModal: false });
                    const data = {
                      name,
                      displayInNavigation,
                      color,
                      plugins
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