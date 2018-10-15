import { ILooseObject } from '@source/composer/types';
import * as React from 'react';
import { IAddComponentObject, IComponentsServiceLikeClass } from '../../../../../../Composer';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  pos: number;
  isThereSource: boolean;
  sourceData: ILooseObject | null;
  componentsService: IComponentsServiceLikeClass;
  container?: string; // ID of contaier owner
  containerLocked: boolean;

  moveComponent: (id: number, position: number) => void;
  addComponent: (data: IAddComponentObject, position: number, container: string) => Promise<boolean>;
}

export interface IState {
  canDrop: boolean;
  isOver: boolean;
}

class Slot extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
    super(props);

    this.state = {
      canDrop: false,
      isOver: false
    };

    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
  }

  public componentWillReceiveProps(nextProps: IProperties) {
    let canDrop = false;
    if (nextProps.isThereSource && nextProps.sourceData) {
      // We can drop if some rules apply
      const source = nextProps.sourceData;
      canDrop = this.handleCanDrop(nextProps, source);
    }

    this.setState({
      canDrop
    });
  }

  public handleCanDrop(props: IProperties, source: ILooseObject) {
    if (this.props.containerLocked) {
      return false;
    }
    if (source.container && source.container !== this.props.container) {
      return false;
    }

    if (source.pos < 0 && props.pos % 2 !== 1) {
      return true;
    }
    if (props.pos % 2 === 1 && source.pos !== props.pos) {
      return false;
    }

    // And also can't drop into position before and after
    if (props.pos === source.pos - 1 || props.pos === source.pos + 1) {
      return false;
    }

    // Can drop into actual position (it's redundant operation)
    if (props.pos === source.pos) {
      return false;
    }

    // Others can be dropped
    return true;
  }

  // tslint:disable-next-line:no-any
  public handleDragOver(e: any) {
    if (this.state.canDrop) {
      e.preventDefault();
    }
  }

  // tslint:disable-next-line:no-any
  public handleDrop(e: any) {
    if (this.props.pos % 2 === 1) {
      this.setState({
        isOver: false
      });
      return;
    }

    const data = JSON.parse(e.dataTransfer.getData('application/json'));

    const index = data.index;
    const pos = this.props.pos / 2;

    // If index is below zero, it's new component
    if (index < 0) {
      const res = this.props.componentsService.getComponentResource(data.type) as IAddComponentObject;
      if (this.props.container) {
        this.props.addComponent(res, pos, this.props.container);
      }
    } else {
      this.props.moveComponent(index, pos);
    }

    this.setState({
      isOver: false
    });
  }

  // tslint:disable-next-line:no-any
  public handleDragEnter(e: any) {
    if (this.state.canDrop) {
      this.setState({
        isOver: true
      });
    }
  }

  // tslint:disable-next-line:no-any
  public handleDragLeave(e: any) {
    this.setState({
      isOver: false
    });
  }

  public render() {
    let className = 'target';
    if (this.state.canDrop) {
      className += ' can-drop';
    }
    if (this.state.isOver) {
      className += ' active';
    }

    let fontSize = 'unset';
    if (!this.props.children) {
      if (!(this.state.canDrop || this.state.isOver)) {
        fontSize = '0px';
      }
    }

    return (
      <div
        className={className}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        style={{
          fontSize,
          textAlign: this.props.children ? 'unset' : 'center',
        }}
      >
        {this.props.children ? this.props.children : 'You can place component right here'}
      </div>
    );
  }
}

export default Slot;
