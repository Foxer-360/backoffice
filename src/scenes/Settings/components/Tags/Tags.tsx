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
              color: tag.color
            };
            return model;
          });

          return render(tags);
        }}
      </Query>
    );
  },
  createTag: ({ render, website }) => (
    <Mutation
      mutation={mutations.CREATE_TAG}
      update={(cache, { data: { createTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.TAG_LIST,
          variables: { website },
          data: { tags: tags.concat([createTag]) }
        });
      }}
    >
      {createTag => render(createTag)}
    </Mutation>
  ),
  deleteTag: ({ render, website }) => (
    <Mutation
      mutation={mutations.DELETE_TAG}
      update={(cache, { data: { deleteTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website }
        });
        cache.writeQuery({
          query: queries.TAG_LIST,
          variables: { website },
          data: { tags: tags.filter((tag: Tag) => tag.id !== deleteTag.id) }
        });
      }}
    >
      {deleteTag => render(deleteTag)}
    </Mutation>
  ),
  updateTag: ({ render, website }) => (
    <Mutation
      mutation={mutations.UPDATE_TAG}
      update={(cache, { data: { updateTag } }) => {
        const { tags } = cache.readQuery({
          query: queries.TAG_LIST,
          variables: { website }
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
            })
          }
        });
      }}
    >
      {updateTag => render(updateTag)}
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

interface DeleteTagInput {
  id: string;
}

interface CreateTagInput {
  data: TagWithJoin;
}

interface UpdateTagInput {
  id: string;
  data: TagWithJoin;
}

interface CreateTagOutput {
  data: {
    createTag: {
      id: string;
    };
  };
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
          Add new tag
        </Button>
        <TagQM>
          {({ tags, website, createTag, updateTag, deleteTag }: {
            tags: Tag[],
            website: string,
            createTag: (data: QueryVariables<CreateTagInput>) => Promise<CreateTagOutput>,
            updateTag: (data: QueryVariables<UpdateTagInput>) => Promise<void>,
            deleteTag: (data: QueryVariables<DeleteTagInput>) => Promise<void>
          }) => {
            const tableData = tags.map((a: Tag) => ({ ...a, key: a.id }));

            const COLUMNS = [{
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              width: '30%',
            }, {
              title: 'Display in Navigation',
              key: 'displayInNavigation',
              width: '18%',
              render: (record: Tag) => (
                <span>{record.displayInNavigation ? 'Yes' : 'No'}</span>
              )
            }, {
              title: 'Color',
              dataIndex: 'color',
              key: 'color',
              width: '12%',
            }, {
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
              )
            }];

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
                    const data: TagWithJoin = {
                      name,
                      displayInNavigation,
                      color,
                      plugins,
                      website: { connect: { id: website } }
                    };

                    if (this.state.edit) {
                      await updateTag({ variables: { data, id: this.state.id } });
                      message.success('Tag updated!');
                      this.setState({ ...this.DEFAULT });
                    } else {
                      await createTag({ variables: { data } });
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