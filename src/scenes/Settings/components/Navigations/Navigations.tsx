import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { message, Button, Table } from 'antd';
import NavigationModal from './components/NavigationModal';
import BuilderModal from './components/BuilderModal';
import Actions from './components/Actions';

const { Component } = React;

import { Navigation, QueryVariables, NavigationWithJoin } from './interfaces';

const NavigationQM = adopt({
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
  navigations: ({ render, website }) => {
    if (!website) {
      return render([]);
    }

    return (
      <Query query={queries.NAVIGATION_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render([]);
          }

          const navigations: Navigation[] = data.navigations.map((nav: Navigation) => {
            const model = {
              id: nav.id,
              name: nav.name,
            };
            return model;
          });

          return render(navigations);
        }}
      </Query>
    );
  },
  createNavigation: ({ render, website }) => (
    <Mutation
      mutation={mutations.CREATE_NAVIGATION}
      update={(cache, { data: { createNavigation } }) => {
        const { navigations } = cache.readQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
          data: { navigations: navigations.concat([createNavigation]) },
        });
      }}
    >
      {createNavigation => render(createNavigation)}
    </Mutation>
  ),
  deleteNavigation: ({ render, website }) => (
    <Mutation
      mutation={mutations.DELETE_NAVIGATION}
      update={(cache, { data: { deleteNavigation } }) => {
        const { navigations } = cache.readQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
          data: { navigations: navigations.filter((nav: Navigation) => nav.id !== deleteNavigation.id) },
        });
      }}
    >
      {deleteNavigation => render(deleteNavigation)}
    </Mutation>
  ),
  updateNavigation: ({ render, website }) => (
    <Mutation
      mutation={mutations.UPDATE_NAVIGATION}
      update={(cache, { data: { updateNavigation } }) => {
        const { navigations } = cache.readQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.NAVIGATION_LIST,
          variables: { website },
          data: {
            navigations: navigations.map((nav: Navigation) => {
              if (nav.id === updateNavigation.id) {
                return updateNavigation;
              }
              return nav;
            }),
          },
        });
      }}
    >
      {updateNavigation => render(updateNavigation)}
    </Mutation>
  ),
});

interface Properties {}

interface State {
  name: string;
  id: string;
  edit: boolean;
  showModal: boolean;
  showBuilder: boolean;
}

interface DeleteNavigationInput {
  id: string;
}

interface CreateNavigationInput {
  data: NavigationWithJoin;
}

interface UpdateNavigationInput {
  id: string;
  data: NavigationWithJoin;
}

interface CreateNavigationOutput {
  data: {
    createNavigation: {
      id: string;
    };
  };
}

class Navigations extends Component<Properties, State> {
  private readonly DEFAULT: State = {
    name: null,
    id: null,
    edit: false,
    showModal: false,
    showBuilder: false,
  };

  constructor(props: Properties) {
    super(props);
    this.state = { ...this.DEFAULT };
  }

  showCreateModal(): void {
    this.setState({ showModal: true });
  }

  showEditModal(id: string, name: string): void {
    this.setState({
      id,
      name,
      edit: true,
      showModal: true,
    });
  }

  showBuilder(id: string): void {
    this.setState({
      id,
      showBuilder: true,
    });
  }

  render(): React.ReactNode {
    return (
      <>
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => this.showCreateModal()}>
          Add new navigation
        </Button>
        <NavigationQM>
          {({
            navigations,
            website,
            createNavigation,
            updateNavigation,
            deleteNavigation,
          }: {
            navigations: Navigation[];
            website: string;
            createNavigation: (data: QueryVariables<CreateNavigationInput>) => Promise<CreateNavigationOutput>;
            updateNavigation: (data: QueryVariables<UpdateNavigationInput>) => Promise<void>;
            deleteNavigation: (data: QueryVariables<DeleteNavigationInput>) => Promise<void>;
          }) => {
            const tableData = navigations.map((a: Navigation) => ({ ...a, key: a.id }));

            const COLUMNS = [
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: '50%',
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (record: Navigation) => (
                  <Actions
                    id={record.id}
                    edit={(id: string) => this.showEditModal(id, navigations.find(a => a.id === id).name)}
                    build={(id: string) => this.showBuilder(id)}
                    remove={async (id: string) => {
                      await deleteNavigation({ variables: { id } });
                      message.success('Navigation removed!');
                    }}
                  />
                ),
              },
            ];

            return (
              <>
                <Table columns={COLUMNS} dataSource={tableData} />
                <NavigationModal
                  visible={this.state.showModal}
                  edit={this.state.edit}
                  name={this.state.name}
                  onSave={async (name: string) => {
                    this.setState({ showModal: false });
                    const data: NavigationWithJoin = {
                      name,
                      website: { connect: { id: website } },
                    };

                    if (this.state.edit) {
                      await updateNavigation({ variables: { data, id: this.state.id } });
                      message.success('Navigation updated!');
                      this.setState({ ...this.DEFAULT });
                    } else {
                      const result = await createNavigation({ variables: { data } });
                      const id = result.data.createNavigation.id;
                      message.success('Navigation created!');
                      this.showBuilder(id);
                    }
                  }}
                  onCancel={() => this.setState({ ...this.DEFAULT })}
                />
                {this.state.showBuilder && (
                  <BuilderModal
                    visible={this.state.showBuilder}
                    id={this.state.id}
                    onCancel={() => this.setState({ ...this.DEFAULT })}
                    onSave={() => {
                      this.setState({ ...this.DEFAULT });
                      message.success('Navigation structure saved!');
                    }}
                  />
                )}
              </>
            );
          }}
        </NavigationQM>
      </>
    );
  }
}

export default Navigations;
