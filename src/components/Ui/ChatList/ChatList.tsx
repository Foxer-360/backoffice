import * as React from 'react';
import { List, Avatar, Spin } from 'antd';

import moment from 'moment';

export interface ChatListProps {
  chats: Chat[];
  loading?: boolean;
}

interface Chat {
  id: string;
  text: string;
  createdAt: string | Date;
  user?: LooseObject;
}

export interface ChatListState {}

class ChatList extends React.Component<ChatListProps, ChatListState> {
  constructor(props: ChatListProps) {
    super(props);
    this.state = {};
  }
  render() {
    const { loading } = this.props;
    return (
      <>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Spin />
          </div>
        )}

        {!loading && (
          <List
            dataSource={this.props.chats}
            renderItem={(chat: Chat) => (
              <div className={`chatItem chatItem--outgoing`}>
                {chat.user && chat.user.avatar && (
                  <div className={'chatAvatar'}>
                    <Avatar src={chat.user.avatar} />
                  </div>
                )}

                <div className="chatBubble">
                  {chat.user && chat.user.username && (
                    <span>
                      {chat.user.username} , {moment(chat.createdAt).format('h:mm A')}
                    </span>
                  )}

                  <div className="chatBubble__content">
                    <p>{chat.text}</p>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </>
    );
  }
}

export default ChatList;
