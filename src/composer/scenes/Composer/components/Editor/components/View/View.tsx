import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import {
  IComponentsServiceLikeClass,
  IEditorInfo,
  ILockInfo,
} from '../../../../Composer';
import Container from './components/Container';
import Frame from './components/Frame';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  // content: Array<ILooseObject>;
  content: ILooseObject;

  // Additional informations about other editors and
  // locks of components
  editors?: IEditorInfo[];
  locks?: ILockInfo[];
  me?: string; // My ID used in editors and locks

  isThereSource: boolean;
  sourceData: ILooseObject | null;

  layouts?: boolean;

  context: Context;

  onEdit: (id: number) => Promise<boolean>;
  onRemove: (id: number) => void;
  dragStart: (data: ILooseObject) => void;
  dragEnd: () => void;

  moveComponent: (id: number, position: number) => void;
  addComponent: (data: ILooseObject, position: number, container: string) => Promise<boolean>;
  componentsService: IComponentsServiceLikeClass;

  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;
}

class View extends React.Component<IProperties, {}> {
  public arrowHover = (direction: string) => {
    const frame = document.querySelectorAll('[kwframeid]')[0] as HTMLIFrameElement;

    if (!frame || !frame.contentWindow) {
      return;
    }

    // setInterval(function() {
    if (direction === 'up') {
      frame.contentWindow.scrollBy({ top: -400, behavior: 'smooth' });
      // frame.scroll({ top: -100, behavior: 'smooth' });
    } else {
      frame.contentWindow.scrollBy({ top: 400, behavior: 'smooth' });
      // frame.scroll({ top: 100, behavior: 'smooth' });
    }
    // }, 1);
  }

  public render() {
    const dragging = this.props.isThereSource;

    return (
      <div className="composer-content-holder">
        <Frame
          componentsService={this.props.componentsService}
        >
          {
            <div
              onDragOver={() => this.arrowHover('up')}
              className={`composerArrow composerArrow__up  ${
                dragging ? 'composerArrow__active' : ''
              }`}
            >
              Scroll Up
            </div>
          }
          <Container
            {...this.props}
            container={this.props.content.id}
            content={this.props.content.content}
            removeContainer={this.props.removeContainer}
            lockContainer={this.props.lockContainer}
            layouts={this.props.layouts}
            locked={this.props.content.lock}
            context={this.props.context}
          />
          {
            <div
              onDragOver={() => this.arrowHover('down')}
              className={`composerArrow composerArrow__down ${
                dragging ? 'composerArrow__active' : ''
              }`}
            >
              Scroll Down
            </div>
          }
        </Frame>
      </div>
    );
  }
}

export default View;
