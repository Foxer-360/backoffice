import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import { queries, mutations } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import { message, Button, Table } from 'antd';
import TagModal from './components/TagModal';
import Actions from './components/Actions';

const { Component } = React;

import { Tag, QueryVariables, TagWithJoin } from './interfaces';

const TagQM = adopt({
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
  tags: ({ render, website }) => {
    if (!website) {
      return render([]);
    }

    return (
      <Query query={queries.TAG_LIST} variables={{ website }}>
        {({ loading, data, error }) => {
          if (loading || error) {
            return render([]);
          }

          const tags: Tag[] = data.tags.map((tag: Tag) => {
            const model = {
              id: tag.id,
              name: tag.name,
              displayInNavigation: tag.displayInNavigation,
              plugins: tag.plugins,
              color: tag.color,
            };
            return model;
          });

          return render(tags);
        }}
      </Query>
    );
  },
  createTag: ({ website, render }) => (
    <Mutation
      mutation={mutations.CREATE_TAG}
      update={(cache, { data: { createTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.TAG_LIST,
          variables: { website },
          data: { tags: tags.concat([createTag]) },
        });
      }}
    >
      {createTag => {
        const fce = (data: LooseObject) => {
          createTag({ variables: { ...data, website } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
  deleteTag: ({ render, website }) => (
    <Mutation
      mutation={mutations.DELETE_TAG}
      update={(cache, { data: { deleteTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.TAG_LIST,
          variables: { website },
          data: { tags: tags.filter((tag: Tag) => tag.id !== deleteTag.id) },
        });
      }}
    >
      {deleteTag => render(deleteTag)}
    </Mutation>
  ),
  updateTag: ({ website, render }) => (
    <Mutation
      mutation={mutations.UPDATE_TAG}
      update={(cache, { data: { updateTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website },
        });
        cache.writeQuery({
          query: queries.TAG_LIST,
          variables: { website },
          data: {
            tags: tags.map((tag: Tag) => {
              if (tag.id === updateTag.id) {
                return updateTag;
              }
              return tag;
            }),
          },
        });
      }}
    >
      {updateTag => {
        const fce = (data: LooseObject) => {
          updateTag({ variables: { ...data } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface Properties {}

interface State {
  name: string;
  displayInNavigation: boolean;
  color: string;
  plugins: string[];
  id: string;
  edit: boolean;
  showModal: boolean;
}

interface CreateTagOutput {
  data: {
    createTag: {
      id: string;
    };
  };
}

interface QaMForModalVars {
  tags: Tag[];
  website: string;
  createTag: (data: LooseObject) => Promise<void>;
  updateTag: (data: LooseObject) => Promise<void>;
  deleteTag: (data: LooseObject) => Promise<void>;
}

class Tags extends Component<Properties, State> {
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

  showEditModal(id: string, tag: Tag): void {
    this.setState({
      id,
      name: tag.name,
      displayInNavigation: tag.displayInNavigation,
      color: tag.color,
      plugins: tag.plugins,
      edit: true,
      showModal: true,
    });
  }

  render(): React.ReactNode {
    return (
      <>
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => this.showCreateModal()}>
          Add new tag
        </Button>
        <TagQM>
          {({ tags, website, createTag, updateTag, deleteTag }: QaMForModalVars) => {
            const tableData = tags.map((a: Tag) => ({ ...a, key: a.id }));

            const COLUMNS = [
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: '30%',
              },
              {
                title: 'Display in Navigation',
                key: 'displayInNavigation',
                width: '18%',
                render: (record: Tag) => <span>{record.displayInNavigation ? 'Yes' : 'No'}</span>,
              },
              {
                title: 'Color',
                key: 'color',
                width: '12%',
                render: (record: Tag) => <span style={{ color: record.color }}>{record.color}</span>,
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (record: Tag) => (
                  <Actions
                    id={record.id}
                    edit={(id: string) => this.showEditModal(id, tags.find(a => a.id === id))}
                    remove={async (id: string) => {
                      await deleteTag({ variables: { id } });
                      message.success('Tag removed!');
                    }}
                  />
                ),
              },
            ];

            return (
              <>
                <Table columns={COLUMNS} dataSource={tableData} />
                <TagModal
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
                      plugins,
                    };

                    if (this.state.edit) {
                      await updateTag({ ...data, id: this.state.id });
                      message.success('Tag updated!');
                      this.setState({ ...this.DEFAULT });
                    } else {
                      await createTag({ ...data, website: { connect: { id: website } } });
                      message.success('Tag created!');
                    }
                  }}
                  onCancel={() => this.setState({ ...this.DEFAULT })}
                />
              </>
            );
          }}
        </TagQM>
      </>
    );
  }
}

export default Tags;
