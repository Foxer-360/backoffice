import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import { IComponentsServiceLikeClass, IEditorInfo, ILockInfo } from '../../../../../../Composer';
import Slot from '../Slot';
import Wrapper from '../Wrapper';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  content: ILooseObject[];
  componentsService: IComponentsServiceLikeClass;
  isThereSource: boolean;
  sourceData: ILooseObject | null;
  container?: string; // ID of this container

  editors?: IEditorInfo[];
  locks?: ILockInfo[];
  me?: string; // My ID used in editors and locks

  layouts?: boolean;
  locked: boolean;

  context: Context;

  moveComponent: (id: number, position: number) => void;
  addComponent: (data: ILooseObject, position: number, container: string) => Promise<boolean>;

  onEdit: (id: number) => Promise<boolean>;
  onRemove: (id: number) => void;

  onHandleTemplateSave?: (id: number) => void;
  onHandleTemplateUse?: (id: number) => void;
  componentTemplates?: LooseObject[];
  dragStart: (data: ILooseObject) => void;
  dragEnd: () => void;

  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;
}

class Container extends React.Component<IProperties, {}> {
  constructor(props: IProperties) {
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
        {this.props.layouts && (
          <div className="containerEditor">
            <button
              className="antBtn black"
              onClick={() => this.props.removeContainer(this.props.container ? this.props.container : '')}
            >
              Remove
            </button>
            <button
              className={`antBtn ${this.props.locked ? 'green' : 'red'}`}
              onClick={() =>
                this.props.lockContainer(this.props.container ? this.props.container : '', !this.props.locked)
              }
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
        {this.props.content &&
          this.props.content.map((component, index) => {
            if (component.type === 'container') {
              // It it's container
              return (
                <Container
                  key={index}
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
                      onHandleTemplateSave={this.props.onHandleTemplateSave}
                      onHandleTemplateUse={this.props.onHandleTemplateUse}
                      componentTemplates={this.props.componentTemplates}
                      dragStart={this.props.dragStart}
                      dragEnd={this.props.dragEnd}
                      componentsService={this.props.componentsService}
                      editors={this.props.editors}
                      locks={this.props.locks}
                      me={this.props.me}
                      context={this.props.context}
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
