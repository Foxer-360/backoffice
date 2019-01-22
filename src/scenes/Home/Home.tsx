import * as React from 'react';
import { Row, Col, Card, Icon } from 'antd';
import TaskList from '@source/components/Ui/TaskList';
import ChatList from '@source/components/Ui/ChatList';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const PAGE_TASK_LIST = gql`
  query getPageTaskList {
    pageTasks(orderBy: updatedAt_DESC) {
      id
      name
      description
      done
      updatedAt
      user {
        username
      }
      pageTranslation {
        id
        name
        page {
          id
          website {
            id
            defaultLanguage {
              id
            }
          }
        }
      }
    }
  }
`;

const PAGE_CHAT_LIST = gql`
  query getPageChatList {
    pageChats(orderBy: createdAt_DESC) {
      id
      text
      createdAt
      user {
        username
        avatar
        email
      }
      page {
        id
        translations {
          language {
            id
          }
          name
        }
        website {
          id
          defaultLanguage {
            id
          }
        }
      }
    }
  }
`;

const Home = () => (
  <div className={'dashBoard'}>
    <Row>
      <Col span={24}>
        <Card>
          <span>
            <h1>Welcome Back!</h1>
          </span>
          <span
            style={{
              color: '#000000a6',
              fontSize: '16px',
            }}
          >
            Here is all the info from when you let last time.
          </span>
        </Card>
      </Col>
    </Row>

    <Row style={{ marginTop: '24px' }} justify={'space-between'} type={'flex'} gutter={24}>
      <Col span={12}>
        <Card>
          <h3>
            <Icon
              type={'check'}
              style={{
                color: '#1890FF',
                fontSize: '25px',
                marginRight: '12px',
              }}
            />
            Recent Tasks
          </h3>

          <div className={'dashBoard__card__cont'}>
            <Query query={PAGE_TASK_LIST}>
              {({ loading, data, error, subscribeToMore, refetch }) => {
                return (
                  <TaskList
                    tasks={data && data.pageTasks && data.pageTasks.filter(task => !task.done)}
                    loading={loading}
                  />
                );
              }}
            </Query>
          </div>
        </Card>
      </Col>

      <Col span={12}>
        <Card>
          <h3>
            <Icon
              type={'message'}
              style={{
                color: '#1890FF',
                fontSize: '25px',
                marginRight: '12px',
              }}
            />
            Recent Chats
          </h3>

          <div className={'dashBoard__card__cont'}>
            <Query query={PAGE_CHAT_LIST}>
              {({ loading, data, error, subscribeToMore, refetch }) => {
                return <ChatList chats={data && data.pageChats && data.pageChats.slice(0, 15)} loading={loading} />;
              }}
            </Query>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

export default Home;
