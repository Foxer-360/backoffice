import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { Button, Table } from 'antd';
import Actions from './components/Actions';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

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
});

interface Properties {
}

interface State {
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
  };

  constructor(props: Properties) {
    super(props);
    this.state = { ...this.DEFAULT };
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
        >
          <Link to="/datasource/new">Add new datasource</Link>
        </Button>
        <DatasourceQM>
          {({ datasources, deleteDatasource }: QaMForModalVars) => {
            const tableData = datasources.map((a: Datasource) => ({ ...a, key: a.id }));

            const COLUMNS = [{
              title: 'Name',
              dataIndex: 'type',
              key: 'type',
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
                  }}
                />
              )
            }];

            return (
              <>
                <Table columns={COLUMNS} dataSource={tableData} />
              </>
            );
          }}
        </DatasourceQM>
      </>
    );
  }
}

export default Datasources;