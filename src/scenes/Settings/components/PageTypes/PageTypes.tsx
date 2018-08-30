import * as React from 'react';
import { Button, Col, Input, Modal, Row, Table } from 'antd';
import PageTypesQuery from '@source/query/PageTypes';
import Actions from './components/Actions';
import ModalWindow from './components/ModalWindow';
import { adopt } from 'react-adopt';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from 'services/graphql';

const { Component } = React;

export interface Properties {
  edit: (id: number, name: string) => ReduxAction;
  remove: (id: number) => ReduxAction;
  add: (name: string) => ReduxAction;
  types: LooseObject[];
}

export interface State {
  visible: boolean; // Flag if modal for creating and editing is visible
  name: string;
  content: LooseObject[];
  editing: boolean;
  id: string | null;
}

const QueryAndMutationForTable = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => render(data.website)}
    </Query>
  ),
  types: ({ website, render }) => (
    <Query query={queries.PAGE_TYPE_LIST} variables={{ website }}>
      {({ loading, data, error }) => {
        if (loading || error) {
          return render({ loading, error, data: [] });
        }

        return render({ loading, error, data: data.pageTypes });
      }}
    </Query>
  ),
  remove: ({ website, render }) => (
    <Mutation
      mutation={mutations.REMOVE_PAGE_TYPE}
      update={(cache, { data: { deletePageType } }) => {
        const { pageTypes } = cache.readQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website }
        });
        const filterFce = (type: LooseObject) => type.id !== deletePageType.id;
        cache.writeQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website },
          data: { pageTypes: pageTypes.filter(filterFce) }
        });
      }}
    >
      {deletePageType => {
        const fce = (id: string) => {
          // tslint:disable-next-line:no-console
          console.log('REMOVE PAGE TYPE', id);
          deletePageType({ variables: { id } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface QaMForTableVars {
  website: string;
  types: {
    loading: boolean;
    error: boolean;
    data: LooseObject[];
  };
  remove: (id: string) => void;
}

const QueryAndMutationForModal = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data }) => render(data.website)}
    </Query>
  ),
  data: ({ id, website, render }) => {
    if (!id) {
      return render(null);
    }

    return (
      <Query query={queries.PAGE_TYPE_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render(null);
          }

          const fFce = (t: LooseObject) => t.id === id;
          const type = data.pageTypes.find(fFce);

          if (!type) {
            return render(null);
          }

          return render(type);
        }}
      </Query>
    );
  },
  create: ({ website, render }) => (
    <Mutation
      mutation={mutations.CREATE_PAGE_TYPE}
      update={(cache, { data: { createPageType } }) => {
        const { pageTypes } = cache.readQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website },
          data: { pageTypes: pageTypes.concat([ createPageType ]) }
        });
      }}
    >
      {createPageType => {
        const fce = (data: LooseObject) => {
          createPageType({ variables: {
            ...data,
            website
          } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
  update: ({ id, website, render }) => (
    <Mutation
      mutation={mutations.UPDATE_PAGE_TYPE}
      update={(cache, { data: { updatePageType } }) => {
        const { pageTypes } = cache.readQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website }
        });

        const mapFce = (type: LooseObject) => {
          if (type.id === id) {
            return updatePageType;
          }

          return type;
        };

        cache.writeQuery({
          query: queries.PAGE_TYPE_LIST,
          variables: { website },
          data: { pageTypes: pageTypes.map(mapFce) }
        });
      }}
    >
      {updatePageType => {
        const fce = (data: LooseObject) => {
          updatePageType({ variables: {
            ...data,
            id
          } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface QaMForModalVars {
  website: string;
  data: LooseObject | null;
  create: (data: LooseObject) => void;
  update: (data: LooseObject) => void;
}

class PageTypes extends Component<Properties, State> {

  private DEFAULT_STATE = {
    visible: false,
    name: '',
    content: [],
    editing: false,
    id: null
  } as State;

  private COLUMNS = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: 'Plugins',
    dataIndex: 'plugins',
    key: 'plugins'
  }, {
    title: 'Actions',
    key: 'actions',
    render: (record: LooseObject) => <Actions id={record.id} edit={this.handleEdit} remove={this.handleRemove}/>
  }];

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.DEFAULT_STATE
    };

    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.addNew = this.addNew.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleOk() {
    this.setState({
      ...this.DEFAULT_STATE
    });
  }

  handleCancel() {
    this.setState({
      ...this.DEFAULT_STATE
    });
  }

  addNew() {
    this.setState({
      ...this.state,
      visible: true,
      editing: false,
      name: ''
    });
  }

  handleNameChange(name: string) {
    this.setState({
      ...this.state,
      name
    });
  }

  handleEdit(id: string) {
    this.setState({
      visible: true,
      id
    });
  }

  handleRemove(id: string) {
    // Nothing to do
  }

  render() {
    const labelSize = 4;
    const labelStyle = { padding: '6px 12px' };

    return (
      <div>
        <Button type="primary" onClick={this.addNew}>Add new type</Button>
        <br /><br />

        <QueryAndMutationForTable>
          {({ types, remove }: QaMForTableVars) => {
            if (types.loading) {
              return <span>Loading</span>;
            }

            if (types.error) {
              return <span>Error</span>;
            }

            this.handleRemove = remove;

            return <Table columns={this.COLUMNS} dataSource={types.data} />;
          }}
        </QueryAndMutationForTable>

        <QueryAndMutationForModal id={this.state.id}>
          {({ data, create, update }: QaMForModalVars) => {
            if (data) {
              return (
                <ModalWindow
                  data={data}
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  onSave={(obj: LooseObject) => {
                    update(obj);
                    this.handleOk();
                  }}
                />
              );
            }

            return (
              <ModalWindow
                visible={this.state.visible}
                onCancel={this.handleCancel}
                onSave={(obj: LooseObject) => {
                  create(obj);
                  this.handleOk();
                }}
              />
            );
          }}
        </QueryAndMutationForModal>
      </div>
    );
  }

}

export default PageTypes;
