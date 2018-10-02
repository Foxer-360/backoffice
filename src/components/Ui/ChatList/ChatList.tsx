import * as React from 'react';
import { Icon, List, Checkbox, Tag, Avatar } from 'antd';

export interface ChatListProps {
  chats: Chat[];
}

interface Chat {
  id: string;
  text: string;
  createdAt: string | Date;
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
            <div className={'chatAvatar'}>
              <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
            </div>

            <div className="chatBubble">
              <span>Emilio , 12:15</span>

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
