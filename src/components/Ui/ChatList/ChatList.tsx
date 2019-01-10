import * as React from 'react';
import { List, Avatar } from 'antd';

import moment from 'moment';

export interface ChatListProps {
  chats: Chat[];
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
    return (
      <List
        dataSource={this.props.chats}
        renderItem={(chat: Chat) => (
          <div className={`chatItem chatItem--outgoing`}>
            {chat.user && chat.user.avatar &&
              <div className={'chatAvatar'}>
                <Avatar src={chat.user.avatar} />
              </div>
            }

            <div className="chatBubble">
              {chat.user && chat.user.name &&
                <span>{chat.user.name} , {moment(chat.createdAt).format('h:mm A')}</span>
              }

              <div className="chatBubble__content">
                <p>{chat.text}</p>
              </div>
            </div>
          </div>
        )}
      />
    );
  }
}

export default ChatList;
