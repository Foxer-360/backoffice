import * as React from 'react';
import { Row, Col, Form, Input, Card, Icon, Button, List, Checkbox, Avatar, Tag } from 'antd';
import TaskList from '@source/components/Ui/TaskList';
import ChatList from '@source/components/Ui/ChatList';

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
            <TaskList tasks={tasks} />
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
            {/* <ChatList chats={chats}/> */}
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
