import { ILooseObject } from '@source/composer/types';
import { Icon, List } from 'antd';
import * as React from 'react';

import './style.scss';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  type: string;
  projectName: string;

  dragStart: (data: ILooseObject) => void;
  dragEnd: () => void;
}

export interface IState {
  isDragging: boolean;
}

class Card extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);

    this.state = {
      isDragging: false
    };

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  public handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const data = {
      index: -1,
      pos: -1,
      type: this.props.type,
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

  public handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    if (this.props.dragEnd) {
      this.props.dragEnd();
    }

    this.setState({
      ...this.state,
      isDragging: false
    });
  }

  public render() {
    {/* preferable image size: 412x250, format: jpg */}
    let img = `/assets/${this.props.projectName}/images/screenshots/${this.props.type}.jpg`;

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
        <img 
          src={img} 
          className={'rolled-image'} 
          onError={(e) => (e.target as HTMLInputElement).style.display = 'none'}
        />
      </div>
    );
  }
}

export default Card;