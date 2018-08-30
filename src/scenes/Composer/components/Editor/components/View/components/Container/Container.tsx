import * as React from 'react';
import Slot from '../Slot';
import Wrapper from '../Wrapper';
import { ComponentsServiceLikeClass, EditorInfo, LockInfo } from '../../../../../../Composer';

const { Component } = React;

export interface Properties {
  content: LooseObject[];
  componentsService: ComponentsServiceLikeClass;
  isThereSource: boolean;
  sourceData: LooseObject;
  container?: string; // ID of this container

  editors?: EditorInfo[];
  locks?: LockInfo[];
  me?: string; // My ID used in editors and locks

  layouts?: boolean;
  locked: boolean;

  moveComponent: (id: number, position: number) => void;
  addComponent: (data: LooseObject, position: number, container: string) => Promise<boolean>;

  onEdit: (id: number) => Promise<boolean>;
  onRemove: (id: number) => void;
  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;

  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;
}

class Container extends Component<Properties, {}> {

  constructor(props: Properties) {
    super(props);
  }

  public render(): JSX.Element {
    let position = 0;

    let className = 'layout';
    if (this.props.layouts && this.props.container !== 'root') {
      className += ' active';
    }

    return (
      <div className={className}>
        {(this.props.layouts) && (
          <div>
            <button
              style={{ fontSize: '20px' }}
              onClick={() => this.props.removeContainer(this.props.container)}
            >
              Remove
            </button>
            <button
              style={{ fontSize: '20px' }}
              onClick={() => this.props.lockContainer(this.props.container, !this.props.locked)}
            >
              {this.props.locked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        )}
        <Slot
          pos={position++}
          isThereSource={this.props.isThereSource}
          sourceData={this.props.sourceData}
          moveComponent={this.props.moveComponent}
          addComponent={this.props.addComponent}
          componentsService={this.props.componentsService}
          container={this.props.container}
          containerLocked={this.props.locked}
        />
        {this.props.content && this.props.content.map((component, index) => {
            if (component.type === 'container') {
              // It it's container
              return (
                <Container
                  {...this.props}
                  container={component.id}
                  content={component.content}
                  removeContainer={this.props.removeContainer}
                  lockContainer={this.props.lockContainer}
                  layouts={this.props.layouts}
                  locked={component.lock}
                />
              );
            } else {
              // If it's component
              return (
                <div key={index}>
                  <Slot
                    pos={position++}
                    isThereSource={this.props.isThereSource}
                    sourceData={this.props.sourceData}
                    moveComponent={this.props.moveComponent}
                    addComponent={this.props.addComponent}
                    componentsService={this.props.componentsService}
                    container={this.props.container}
                    containerLocked={this.props.locked}
                  >
                    <Wrapper
                      content={this.props.content}
                      id={component.id}
                      position={index}
                      name={component.name}
                      onEdit={this.props.onEdit}
                      onRemove={this.props.onRemove}
                      dragStart={this.props.dragStart}
                      dragEnd={this.props.dragEnd}
                      componentsService={this.props.componentsService}
                      editors={this.props.editors}
                      locks={this.props.locks}
                      me={this.props.me}
                    />
                  </Slot>
                  <Slot
                    pos={position++}
                    isThereSource={this.props.isThereSource}
                    sourceData={this.props.sourceData}
                    moveComponent={this.props.moveComponent}
                    addComponent={this.props.addComponent}
                    componentsService={this.props.componentsService}
                    container={this.props.container}
                    containerLocked={this.props.locked}
                  />
                </div>
              );
            }
          })}
      </div>
    );
  }

}

export default Container;
