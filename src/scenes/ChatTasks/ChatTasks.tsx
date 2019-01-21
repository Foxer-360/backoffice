import * as React from 'react';
import { Card, Col, Icon, Row, Spin, Drawer, Button, Tabs } from 'antd';
import { Query, Mutation, Subscription } from 'react-apollo';
import { queries, mutations, subscriptions } from '@source/services/graphql';
import { adopt } from 'react-adopt';
import Chat from './components/Chat';
import { ChatItem } from './components/Chat/Chat';
import Tasks from './components/Tasks';
import { TaskItem } from './components/Tasks/Tasks';
import './style.css';
import { takeLatest } from 'redux-saga/effects';
import gql from 'graphql-tag';

const { Component } = React;

export interface Properties {
  page: string;
  pageTranslation: string;
  taskAndChatHidden: boolean;
  handleToggleDisplayTaskAndChat: () => void;
}

export interface State {
  hidden: boolean;
}

const PAGE_TASK_LIST = gql`
  query getPageTaskList($pageTranslation: ID!) {
    pageTasks(where: { pageTranslation: { id: $pageTranslation } }, orderBy: updatedAt_DESC) {
      id
      name
      description
      done
      updatedAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation createTask(
    $pageTranslation: PageTranslationCreateOneWithoutTasksInput!
    $name: String!
    $description: String!
    $done: Boolean!
  ) {
    createPageTask(data: { pageTranslation: $pageTranslation, name: $name, description: $description, done: $done }) {
      id
      name
      description
      done
      updatedAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($id: ID!, $name: String!, $description: String!) {
    updatePageTask(where: { id: $id }, data: { name: $name, description: $description }) {
      id
      name
      description
      done
      updatedAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

export const TOGGLE_TASK_DONE = gql`
  mutation toggleTask($id: ID!, $done: Boolean!) {
    updatePageTask(where: { id: $id }, data: { done: $done }) {
      id
      name
      description
      done
      updatedAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

export const REMOVE_TASK = gql`
  mutation removeTask($id: ID!) {
    deletePageTask(where: { id: $id }) {
      id
      name
      description
      done
      updatedAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

const PAGE_CHAT_LIST = gql`
  query getPageChatList($page: ID!) {
    pageChats(where: { page: { id: $page } }, orderBy: createdAt_DESC) {
      id
      text
      createdAt
      user {
        username
        avatar
        email
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation createChat($page: PageCreateOneWithoutChatsInput!, $text: String!) {
    createPageChat(data: { page: $page, text: $text }) {
      id
      text
      createdAt
      user {
        username
        avatar
        email
      }
    }
  }
`;
const QueryAndMutationsForTasks = adopt({
  tasks: ({ pageTranslation, render }) => (
    <Query query={PAGE_TASK_LIST} variables={{ pageTranslation }}>
      {({ loading, data, error, subscribeToMore, refetch }) => {
        const subscribe = () => {
          subscribeToMore({
            document: subscriptions.PAGE_TASK_SUBSCRIPTION,
            variables: { pageTranslation },
            updateQuery: (prev, { subscriptionData }) => {
              const { pageTask } = subscriptionData.data;
              // tslint:disable-next-line:no-console
              console.log('SUBSCRIBE', subscriptionData);

              if (!pageTask) {
                return prev;
              }

              const { mutation, node } = pageTask;

              // Created new task
              if (mutation === 'CREATED') {
                // Check if it's already exists
                const exists = prev.pageTasks.find((task: LooseObject) => {
                  if (task.id === node.id) {
                    return true;
                  }
                  return false;
                });
                if (exists) {
                  return prev;
                }

                // Add node into array
                return {
                  ...prev,
                  pageTasks: prev.pageTasks.concat([node]),
                };
              }

              // Updated task
              if (mutation === 'UPDATED') {
                return {
                  ...prev,
                  pageTask: prev.pageTasks.map((task: LooseObject) => {
                    if (task.id === node.id) {
                      return {
                        ...task,
                        ...node,
                      };
                    }

                    return task;
                  }),
                };
              }

              // Deleted task
              if (mutation === 'DELETED') {
                return {
                  ...prev,
                  pageTasks: prev.pageTasks.filter((task: LooseObject) => {
                    if (task.id === node.id) {
                      return false;
                    }

                    return true;
                  }),
                };
              }
            },
          });
        };

        if (loading || error) {
          return render({ subscribe, loading, error, data: [], refetch });
        }
        const { pageTasks } = data;
        return render({ subscribe, loading, error, data: pageTasks, refetch });
      }}
    </Query>
  ),
  create: ({ pageTranslation, render }) => (
    <Mutation
      mutation={CREATE_TASK}
      update={(cache, { data: { createPageTask } }) => {
        const { pageTasks } = cache.readQuery({
          query: PAGE_TASK_LIST,
          variables: { pageTranslation },
        });
        cache.writeQuery({
          query: PAGE_TASK_LIST,
          variables: { pageTranslation },
          data: { pageTasks: pageTasks.concat([createPageTask]) },
        });
      }}
    >
      {createTask => {
        const fce = (task: LooseObject) => {
          // Add pageTranslation into task
          const res = {
            ...task,
            pageTranslation: {
              connect: { id: pageTranslation },
            },
          };

          createTask({ variables: res });
        };
        return render(fce);
      }}
    </Mutation>
  ),
  toggle: ({ render }) => (
    <Mutation mutation={TOGGLE_TASK_DONE}>
      {toggleTask => {
        const fce = (id: string, done: boolean) => {
          toggleTask({
            variables: {
              id,
              done,
            },
          });
        };

        return render(fce);
      }}
    </Mutation>
  ),
  update: ({ render }) => (
    <Mutation mutation={UPDATE_TASK}>
      {updateTask => {
        const fce = (id: string, task: LooseObject) => {
          updateTask({
            variables: {
              id,
              ...task,
            },
          });
        };

        return render(fce);
      }}
    </Mutation>
  ),
  remove: ({ pageTranslation, render }) => (
    <Mutation
      mutation={REMOVE_TASK}
      update={(cache, { data: { deletePageTask } }) => {
        const { pageTasks } = cache.readQuery({
          query: PAGE_TASK_LIST,
          variables: { pageTranslation },
        });
        const removed = pageTasks.filter((task: LooseObject) => {
          if (task.id === deletePageTask.id) {
            return false;
          }

          return true;
        });
        cache.writeQuery({
          query: PAGE_TASK_LIST,
          variables: { pageTranslation },
          data: { pageTasks: removed },
        });
      }}
    >
      {removeTask => {
        const fce = (id: string) => {
          removeTask({ variables: { id } });
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface QaMForTasksVars {
  create: (task: LooseObject) => void;
  update?: (id: string, task: LooseObject) => void;
  toggle?: (id: string, done: boolean) => void;
  remove?: (id: string) => void;
  tasks: {
    loading: boolean;
    error: boolean;
    data: TaskItem[];
    subscribe: () => void;
    refetch: () => void;
  };
}

const QueryAndMutationsForChats = adopt({
  chats: ({ page, render }) => (
    <Query query={PAGE_CHAT_LIST} variables={{ page }}>
      {({ loading, data, error, subscribeToMore, refetch }) => {
        const subscribe = () => {
          subscribeToMore({
            document: subscriptions.PAGE_CHAT_SUBSCRIPTION,
            variables: { page },
            updateQuery: (prev, { subscriptionData }) => {
              const { pageChat } = subscriptionData.data;
              if (!pageChat) {
                return prev;
              }

              // Skip if it's not CREATED mutation
              if (pageChat.mutation !== 'CREATED') {
                return prev;
              }

              // If this node is already in cache, fuck it...
              const node = prev.pageChats.find((chat: LooseObject) => {
                if (chat.id === pageChat.node.id) {
                  return true;
                }
                return false;
              });
              if (node) {
                return prev;
              }

              // Add newly added message into storage
              const res = prev.pageChats.concat([pageChat.node]);

              return {
                ...prev,
                pageChats: res,
              };
            },
          });
        };

        if (error || loading) {
          return render({ subscribe, loading, error, data: [], refetch });
        }
        const { pageChats } = data;
        return render({ subscribe, loading, error, data: pageChats, refetch });
      }}
    </Query>
  ),
  create: ({ page, render }) => (
    <Mutation
      mutation={CREATE_CHAT}
      update={(cache, { data: { createPageChat } }) => {
        const { pageChats } = cache.readQuery({
          query: PAGE_CHAT_LIST,
          variables: { page },
        });

        cache.writeQuery({
          query: PAGE_CHAT_LIST,
          variables: { page },
          data: { pageChats: pageChats.concat([createPageChat]) },
        });
      }}
    >
      {creeatePageChat => {
        const fce = (text: string) => {
          creeatePageChat({
            variables: {
              page: { connect: { id: page } },
              text,
            },
          });
        };

        return render(fce);
      }}
    </Mutation>
  ),
});

interface QaMForChatsVars {
  create: (text: string) => void;
  chats: {
    loading: boolean;
    error: boolean;
    data: ChatItem[];
    subscribe: () => void;
    refetch: () => void;
  };
}

class ChatTasks extends Component<Properties, State> {
  private RESET_STATE = {
    hidden: true,
  } as State;

  private CHAT_COLUMN_SIZE = 15;

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE,
    };
  }

  public render() {
    // We have no idea about which page is editing and in which translation
    // So do not render
    if (!this.props.page || !this.props.pageTranslation) {
      return null;
    }

    return (
      <div>
        <Drawer
          placement="right"
          closable={true}
          onClose={this.props.handleToggleDisplayTaskAndChat}
          visible={!this.props.taskAndChatHidden}
          width={500}
          zIndex={1}
        >
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Tasks" key="1">
              <QueryAndMutationsForTasks pageTranslation={this.props.pageTranslation}>
                {({ tasks, create, toggle, update, remove }: QaMForTasksVars) => {
                  if (tasks.loading) {
                    return (
                      <Spin spinning={true}>
                        <Tasks tasks={[]} />
                      </Spin>
                    );
                  }

                  if (tasks.error) {
                    return <Tasks tasks={[]} />;
                  }

                  return (
                    <Tasks
                      tasks={tasks.data}
                      onCreate={create}
                      onRemove={remove}
                      onEdit={update}
                      onToggleDone={toggle}
                      subscribe={tasks.subscribe}
                      refetch={tasks.refetch}
                    />
                  );
                }}
              </QueryAndMutationsForTasks>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Chat" key="2">
              <QueryAndMutationsForChats page={this.props.page}>
                {({ create, chats }: QaMForChatsVars) => {
                  if (chats.loading) {
                    return (
                      <Spin spinning={true}>
                        <Chat chats={[]} />
                      </Spin>
                    );
                  }

                  if (chats.error) {
                    return <Chat chats={[]} />;
                  }

                  return (
                    <Chat chats={chats.data} onCreate={create} subscribe={chats.subscribe} refetch={chats.refetch} />
                  );
                }}
              </QueryAndMutationsForChats>
            </Tabs.TabPane>
          </Tabs>
        </Drawer>
      </div>
    );
  }
}

export default ChatTasks;
