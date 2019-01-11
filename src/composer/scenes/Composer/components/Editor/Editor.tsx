import { getObjectFromContent, IComponent, IContent } from '@foxer360/delta';
import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import { Alert, Card, Col, Icon, Row } from 'antd';
import * as React from 'react';
import { IAddComponentObject, IComponentsServiceLikeClass, IEditorInfo, ILockInfo } from '../../Composer';
import DelayComponent from './components/DelayComponent';
import Sidebar from './components/Sidebar';
import View from './components/View';
import Tags from '@source/composer/components/Tags';
import TranslationManager from '@source/composer/components/TranslationManager';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  // content: Array<ILooseObject>;
  content: ILooseObject;
  pageName: string;
  pageId?: string;

  // Additional informations about other editors and
  // locks of components
  editors?: IEditorInfo[];
  locks?: ILockInfo[];
  me?: string; // My ID used in editors and locks

  layouts?: boolean;

  context: Context;

  selectedComponent: number | null;
  updateComponent: (data: ILooseObject) => void;
  selectComponent: (id: number) => Promise<boolean>;
  cancelComponent: () => Promise<boolean>;
  saveComponent: () => Promise<boolean>;
  moveComponent: (id: number, position: number) => void;
  addComponent: (data: ILooseObject, position: number, container: string) => Promise<boolean>;
  removeComponent: (id: number) => void;
  addContainer: () => void;
  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;
  resetPageContent: (id: String, content: LooseObject) => void;
  componentsService: IComponentsServiceLikeClass;
  language?: ILooseObject;
}

export interface IState {
  // Things for DnD -- Better move into Context
  isSomethingDragging: boolean;
  activeSourceData: ILooseObject | null;
}

class Editor extends React.Component<IProperties, IState> {
  constructor(props: IProperties) {
    super(props);

    this.state = {
      activeSourceData: null,
      isSomethingDragging: false,
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
  }

  // When drag start
  public onDragStart(data: ILooseObject) {
    this.setState({
      activeSourceData: data,
      isSomethingDragging: true,
    });
  }

  // When drag stop
  public onDragStop() {
    this.setState({
      activeSourceData: null,
      isSomethingDragging: false,
    });
  }

  public handleAdd(name: string) {
    const res = this.props.componentsService.getComponentResource(name) as IAddComponentObject;
    this.props.addComponent(res, -1, 'root');
  }

  public getComponentFromContent() {
    const id = this.props.selectedComponent;
    return getObjectFromContent(this.props.content as IContent, id + '') as IComponent;

    // if (id === null) {
    //   return null as ILooseObject;
    // }

    // let res = null as ILooseObject;
    // this.props.content.forEach((c: ILooseObject) => {
    //   if (c.id === id) {
    //     res = c;
    //   }
    // }, this);

    // return res;
  }

  public render() {
    const { pageId } = this.props;
    let type = '';
    let data = {};
    const component = this.getComponentFromContent();
    if (component !== null) {
      type = component.name;
      data = component.data;
    }

    let Title = (
      <h3 style={{ paddingBottom: 0, marginBottom: 0 }}>
        <Icon type="appstore" style={{ marginRight: '8px' }} />
        Components
      </h3>
    );
    if (this.props.selectedComponent) {
      Title = (
        <h3 style={{ paddingBottom: 0, marginBottom: 0 }}>
          <Icon type="edit" style={{ marginRight: '8px' }} />
          {type}
        </h3>
      );
    }

    const PageName = <h3 style={{ paddingBottom: 0, marginBottom: 0 }}>{this.props.pageName}</h3>;

    const size = 16;

    return (
      <div className={'editor'}>
        <Row>
          <Col span={size}>
            <Card
              title={
                <div>
                  {this.props.language && pageId && (
                    <span>
                      <TranslationManager
                        pageId={pageId}
                        language={this.props.language}
                        resetPageContent={this.props.resetPageContent}
                      />
                    </span>
                  )}
                  {pageId && (
                    <div style={{ marginTop: 12 }}>
                      <Tags pageId={pageId} />
                    </div>
                  )}
                </div>
              }
            >
              {!this.props.content || this.props.content.length < 1 ? (
                <DelayComponent delay={100}>
                  <Alert
                    message="Add your first component"
                    description="There is no component yet. Please add your first
                  component from selector on the right side."
                    type="success"
                  />
                </DelayComponent>
              ) : null}
              <View
                content={this.props.content}
                onEdit={this.props.selectComponent}
                onRemove={this.props.removeComponent}
                editors={this.props.editors}
                locks={this.props.locks}
                me={this.props.me}
                dragStart={this.onDragStart}
                dragEnd={this.onDragStop}
                isThereSource={this.state.isSomethingDragging}
                sourceData={this.state.activeSourceData}
                moveComponent={this.props.moveComponent}
                addComponent={this.props.addComponent}
                componentsService={this.props.componentsService}
                removeContainer={this.props.removeContainer}
                lockContainer={this.props.lockContainer}
                layouts={this.props.layouts}
                context={this.props.context}
              />
            </Card>
          </Col>

          <Col span={24 - size} style={{ paddingLeft: '10px' }}>
            <Card title={Title}>
              <Sidebar
                type={type}
                data={data}
                onAdd={name => this.handleAdd(name)}
                selectedComponent={this.props.selectedComponent}
                onChange={this.props.updateComponent}
                onCancel={this.props.cancelComponent}
                onSave={this.props.saveComponent}
                componentsService={this.props.componentsService}
                dragStart={this.onDragStart}
                dragEnd={this.onDragStop}
                addContainer={this.props.addContainer}
                layouts={this.props.layouts}
                context={this.props.context}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Editor;
