import * as React from 'react';

import Frame from './components/Frame';
import Container from './components/Container';
import { AddComponentObject, ComponentsServiceLikeClass, EditorInfo, LockInfo } from '../../../../Composer';

const { Component } = React;

export interface Properties {
  // content: Array<LooseObject>;
  content: LooseObject;

  // Additional informations about other editors and
  // locks of components
  editors?: EditorInfo[];
  locks?: LockInfo[];
  me?: string; // My ID used in editors and locks

  isThereSource: boolean;
  sourceData: LooseObject;

  layouts?: boolean;

  onEdit: (id: number) => Promise<boolean>;
  onRemove: (id: number) => void;
  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;

  moveComponent: (id: number, position: number) => void;
  addComponent: (data: LooseObject, position: number, container: string) => Promise<boolean>;
  componentsService: ComponentsServiceLikeClass;

  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;
}

class View extends Component<Properties, {}> {

  render() {
    let position = 0;

    return (
      <div className="composer-content-holder">
        <Frame
          componentsService={this.props.componentsService}
        >
          <Container
            {...this.props}
            container={this.props.content.id}
            content={this.props.content.content}
            removeContainer={this.props.removeContainer}
            lockContainer={this.props.lockContainer}
            layouts={this.props.layouts}
            locked={this.props.content.lock}
          />
        </Frame>
      </div>
    );
  }

}

export default View;
