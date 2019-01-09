import * as React from 'react';
import { Icon, List, Checkbox, Tag, Avatar } from 'antd';
import { userInfo } from 'os';
import { CALL_HISTORY_METHOD } from 'react-router-redux';

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
                <span>{chat.user.name} , 12:15</span>
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
