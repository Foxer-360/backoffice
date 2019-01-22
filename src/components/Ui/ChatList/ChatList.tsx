import * as React from 'react';
import { List, Avatar, Spin, Icon, Tag } from 'antd';
import history from '@source/services/history';
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
  page?: LooseObject;
}

export interface ChatListState {}

class ChatList extends React.Component<ChatListProps, ChatListState> {
  // tslint:disable-next-line:no-any
  private ChatList: any;

  constructor(props: ChatListProps) {
    super(props);
    this.state = {};
    this.ChatList = React.createRef();
  }

  componentDidUpdate(prevProps: ChatListProps) {
    if (prevProps.chats) {
      if (prevProps.chats.length !== this.props.chats.length) {
        this.ChatList.current.scrollTop = this.ChatList.current.scrollHeight + 100;
      }
    }
  }

  componentDidMount() {
    this.ChatList.current.scrollTop = this.ChatList.current.scrollHeight + 100;
  }

  goToPage = chat => {
    history.push(
      `/page?page=${chat.page.id}&website=${chat.page.website.id}&language=${chat.page.website.defaultLanguage.id}`
    );
  };

  render() {
    const { loading } = this.props;
    return (
      <div ref={this.ChatList}>
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

                <div className="chatBubble" onClick={() => this.goToPage(chat)} style={{ cursor: 'pointer' }}>
                  {chat.user && chat.user.username && (
                    <span>
                      {chat.user.username} , {moment(chat.createdAt).format('h:mm A')}
                    </span>
                  )}

                  <div className="chatBubble__content">
                    <p>{chat.text}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', width: '100%' }}>
                    <Icon type={'tag'} style={{ color: '#c6c6c6', fontSize: '19px', marginRight: '6px' }} />
                    <span>
                      {chat.page && (
                        <Tag color="geekblue">
                          {
                            chat.page.translations.find(t => t.language.id === chat.page.website.defaultLanguage.id)
                              .name
                          }
                        </Tag>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    );
  }
}

export default ChatList;
