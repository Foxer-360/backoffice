import * as React from 'react';
import { Dropdown, Icon, List, Menu, Popconfirm } from 'antd';

import { UserProfile } from '@source/contexts';
import './item.css';

const { Component } = React;

export interface ItemProps {
  id: string;
  type: string;
  name: string;

  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const Avatar = ({ type }: LooseObject) => (
  <div style={{ fontSize: '32px' }}>
    <Icon type={type} />
  </div>
);

class Item extends Component<ItemProps, {}> {

  constructor(props: ItemProps) {
    super(props);

    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick() {
    if (this.props.onClick) {
      this.props.onClick(this.props.id);
    }
  }

  render() {
    let edit = (id: string) => {return; };
    if (this.props.onEdit) {
      edit = this.props.onEdit;
    }
    let remove = (id: string) => {return; };
    if (this.props.onRemove) {
      remove = this.props.onRemove;
    }

    const moreMenu = (
      <Menu theme="light">
        <Menu.Item key="edit">
          <span onClick={() => edit(this.props.id)}><Icon type="edit" /> Edit</span>
        </Menu.Item>
        <Menu.Item key="remove">
          <Popconfirm
            title="Are you sure to delete this project ?"
            onConfirm={() => remove(this.props.id)}
          >
            <span><Icon type="delete" /> Delete</span>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );

    return (
      <List.Item>
        <div onClick={this.handleItemClick} className="item-clickable-area">
          <List.Item.Meta
            avatar={<Avatar type={this.props.type} />}
            title={this.props.name}
            description="No description here"
          />
        </div>
        <UserProfile.Consumer>
          {(userProfile) => userProfile.owner ? (

            <div style={{ float: 'right', marginRight: '20px', paddingTop: '14px' }}>
              <Dropdown
                overlay={moreMenu}
                trigger={['click']}
              >
                <Icon style={{ fontSize: '18px', cursor: 'pointer' }} type="ellipsis" />
              </Dropdown>
            </div>
          ) : null }
        </UserProfile.Consumer>
      </List.Item>
    );
  }

}

export default Item;
