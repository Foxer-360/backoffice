import * as React from 'react';
import { Row, Col, Form, Input, Card, Icon, Button, List, Checkbox, Avatar, Tag } from 'antd';

interface Chat {
  contact: string;
  lastMessage: string;
}

const tasks = [
  'Prototype',
  'Test Framework',
  'Call Client',
  'Build CSS',
  'Replace Text',
  'Add Componets',
  'Fix Mailing',
  'Prototype',
  'Test Framework',
  'Call Client',
  'Build CSS',
  'Replace Text',
  'Add Componets',
  'Fix Mailing'
];

const chats = [
  {
    contact: 'John Doe',
    lastMessage: 'Hey, How are you!?'
  },
  {
    contact: 'Zachariah Tadeo',
    lastMessage: 'Did you send the new PDF for the design?'
  },
  {
    contact: 'Denny Lafleur',
    lastMessage: 'Want to grab coffee after work?'
  },
  {
    contact: 'John Doe',
    lastMessage: 'Hey, How are you!?'
  },
  {
    contact: 'Zachariah Tadeo',
    lastMessage: 'Did you send the new PDF for the design?'
  },
  {
    contact: 'Denny Lafleur',
    lastMessage: 'Want to grab coffee after work?'
  },
  {
    contact: 'John Doe',
    lastMessage: 'Hey, How are you!?'
  },
  {
    contact: 'Zachariah Tadeo',
    lastMessage: 'Did you send the new PDF for the design?'
  },
  {
    contact: 'Denny Lafleur',
    lastMessage: 'Want to grab coffee after work?'
  }
];

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
              fontSize: '16px'
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
                marginRight: '12px'
              }}
            />
            Recent Tasks
          </h3>

          <div className={'dashBoard__card__cont'}>
            <List
              size={'large'}
              dataSource={tasks}
              renderItem={(task: string) => (
                <List.Item>
                  <div className={'dashBoard__card__task'}>
                    <div className={'dashBoard__card__task__main'}>
                      <Checkbox>
                        <span style={{ fontSize: '17px' }}>{task}</span>
                      </Checkbox>
                      <span className={'dueDate'}>
                        <Icon style={{ marginRight: '5px' }} type={'clock-circle'} />
                        29/09/2018
                      </span>
                    </div>

                    <div className={'dashBoard__card__task__detail'}>
                      {/* <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" /> */}
                      <span style={{ color: '#c6c6c6' }}>By Emilio Herrera</span>

                      <div>
                        <Icon type={'tag'} />
                        <span>
                          <Tag color="geekblue">BUG</Tag>
                          <Tag color="blue">JS</Tag>
                          <Tag color="cyan">CSS</Tag>
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div className={'dashBoard__card__btn'}>
            <Button type="primary" icon="plus">
              Add New Task
            </Button>
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
                marginRight: '12px'
              }}
            />
            Recent Chats
          </h3>

          <div className={'dashBoard__card__cont'}>
            <List
              dataSource={chats}
              renderItem={(chat: Chat) => (
                <List.Item style={{ padding: '12px' }}>
                  <List.Item.Meta
                    avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                    title={
                      <a href="https://ant.design">
                        {chat.contact}
                        <span>
                          <Icon type={'arrow-right'} style={{ color: 'green', fontSize: '10px', marginLeft: '12px' }} />
                        </span>
                      </a>
                    }
                    description={chat.lastMessage}
                  />
                  <span className={'dueDate'} style={{ color: '#c6c6c6', fontSize: '12px' }}>
                    <Icon style={{ marginRight: '5px', marginTop: '2px' }} type={'clock-circle'} />
                    29/09/2018
                  </span>
                </List.Item>
              )}
            />
          </div>

          <div className={'dashBoard__card__btn'}>
            <Button type="primary" icon="message">
              New Chat
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

export default Home;
