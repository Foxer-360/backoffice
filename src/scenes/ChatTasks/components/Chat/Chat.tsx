import * as React from 'react';
import { List, Button, Input, Row } from 'antd';

const { Component } = React;
const { TextArea } = Input;

export interface Properties {
  chats: ChatItem[];
  onCreate?: (text: string) => void;
  subscribe?: () => void;
  refetch?: () => void;
}

export interface State {
  message: string;
}

export interface ChatItem {
  id: string;
  text: string;
  createdAt: string | Date;
}

const Title = (name: string, date: Date) => (
  <div className="chat__message">
    <span className={'chat__author'}>{name}</span>
    <span className="task-title-date">{date.toUTCString()}</span>
  </div>
);

class Chat extends Component<Properties, State> {
  private RESET_STATE = {
    message: ''
  } as State;

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }

  public componentDidMount() {
    // If refetch is available than refetch data
    if (this.props.refetch) {
      this.props.refetch();
    }
    // Subscribe to new chat messages
    if (this.props.subscribe) {
      this.props.subscribe();
    }
  }

  public render() {
    const data = this.transformedData();

    return (
      <div className="chat-wrapper">
        {/* Chat */}
        <div className="chat-list-wrapper" style={{ paddingRight: '10px' }}>
          <List
            renderItem={(item: LooseObject) => (
              <List.Item>
                <List.Item.Meta title={Title('Author', item.createdAt)} description={item.text} />
              </List.Item>
            )}
            dataSource={data}
          />
        </div>

        {/* Bottom control */}
        <div className="chat-control-wrapper">
          <TextArea
            placeholder="Here you can write your message..."
            rows={4}
            onChange={this.handleMessageChange}
            value={this.state.message}
            style={{ marginTop: '26px' }}
          />
          <Row style={{ marginTop: '12px', textAlign: 'right' }}>
            <Button
              type="primary"
              icon="check"
              disabled={this.state.message.length < 1}
              onClick={this.handleSendMessage}
            >
              Send
            </Button>
          </Row>
        </div>
      </div>
    );
  }

  private handleMessageChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const msg = event.target.value;
    this.setState({
      message: msg
    });
  }

  private transformedData() {
    // Map f-ce to transform date into Date object
    const transform = (ch: ChatItem) => ({ ...ch, createdAt: new Date(ch.createdAt) });

    // Sort f-ce to sort by date DESC
    const sortByDate = (a: ChatItem, b: ChatItem) => (a.createdAt > b.createdAt ? 1 : -1);

    // Default data format
    let data = this.props.chats.map(transform).sort(sortByDate);

    return data;
  }

  private handleSendMessage() {
    if (this.props.onCreate) {
      this.props.onCreate(this.state.message);
    }

    this.setState({
      message: ''
    });
  }
}

export default Chat;
