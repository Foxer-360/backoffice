import * as React from 'react';
import { Icon, List } from 'antd';

const { Component } = React;

export interface Properties {
  type: string;

  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;
}

export interface State {
  isDragging: boolean;
}

class Card extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      isDragging: false
    };

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const data = {
      pos: -1,
      index: -1,
      type: this.props.type
    };

    e.dataTransfer.setData('application/json', JSON.stringify(data));

    if (this.props.dragStart) {
      this.props.dragStart(data);
    }

    this.setState({
      ...this.state,
      isDragging: true
    });
  }

  handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    if (this.props.dragEnd) {
      this.props.dragEnd();
    }

    this.setState({
      ...this.state,
      isDragging: false
    });
  }

  render() {
    return (
      <div
        draggable={true}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        style={{ width: '100%' }}
      >
        <List.Item.Meta
          avatar={<Icon type="credit-card" style={{ fontSize: 24, width: '100%' }} />}
          title={<span style={{ fontSize: '16px' }}>{this.props.type}</span>}
        />
      </div>
    );
  }

}

export default Card;
