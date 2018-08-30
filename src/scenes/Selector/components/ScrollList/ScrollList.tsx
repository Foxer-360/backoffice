import * as React from 'react';
import { List } from 'antd';

import Item from './components/Item';
import './scrolllist.css';

const { Component } = React;

export interface ScrollListProps {
  data?: LooseObject[];
  type?: string;
  emptyText?: string;
  loading?: boolean;

  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

class ScrollList extends Component<ScrollListProps, {}> {

  constructor(props: ScrollListProps) {
    super(props);
  }

  loadMore() {
    return false;
  }

  render() {
    if (this.props.loading) {
      return (
        <List
          dataSource={[]}
          loading={true}
          renderItem={null}
        />
      );
    }

    return (
      <div className="scroll-list-wrapper">
        <List
          dataSource={this.props.data}
          locale={{ emptyText: this.props.emptyText ? this.props.emptyText : '' }}
          renderItem={(item: LooseObject) => (
            <Item
              id={item.id}
              name={this.getTitleOrName(item.title, item.name)}
              type={this.props.type}
              onClick={this.props.onSelect}
              onEdit={this.props.onEdit}
              onRemove={this.props.onRemove}
            />
          )}
        />
      </div>
    );
  }

  private getTitleOrName = (title: string | null, name: string | null) => {
    if (title == null) {
      return name;
    }

    return title;
  }

}

export default ScrollList;
