import * as React from 'react';
import { Alert, Card, Col, Icon, Row } from 'antd';
import Sidebar from './components/Sidebar';
import View from './components/View';
import { AddComponentObject, ComponentsServiceLikeClass, EditorInfo, LockInfo } from '../../Composer';
import DelayComponent from './components/DelayComponent';
import { getObjectFromContent, IContent, IComponent } from '@foxer360/delta';

const { Component } = React;

export interface Properties {
  // content: Array<LooseObject>;
  content: LooseObject;
  pageName: string;

  // Additional informations about other editors and
  // locks of components
  editors?: EditorInfo[];
  locks?: LockInfo[];
  me?: string; // My ID used in editors and locks

  layouts?: boolean;

  selectedComponent: number | null;
  updateComponent: (data: LooseObject) => void;
  selectComponent: (id: number) => Promise<boolean>;
  cancelComponent: () => Promise<boolean>;
  saveComponent: () => Promise<boolean>;
  moveComponent: (id: number, position: number) => void;
  addComponent: (data: LooseObject, position: number, container: string) => Promise<boolean>;
  removeComponent: (id: number) => void;
  addContainer: () => void;
  removeContainer: (id: string) => void;
  lockContainer: (id: string, lock: boolean) => void;

  componentsService: ComponentsServiceLikeClass;
}

export interface State {
  // Things for DnD -- Better move into Context
  isSomethingDragging: boolean;
  activeSourceData: LooseObject | null;
}

class Editor extends Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      isSomethingDragging: false,
      activeSourceData: null
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
  }

  // When drag start
  onDragStart(data: LooseObject) {
    this.setState({
      isSomethingDragging: true,
      activeSourceData: data
    });
  }

  // When drag stop
  onDragStop() {
    this.setState({
      isSomethingDragging: false,
      activeSourceData: null
    });
  }

  handleAdd(name: string) {
    const res = this.props.componentsService.getComponentResource(name) as AddComponentObject;
    this.props.addComponent(res, -1, 'root');
  }

  getComponentFromContent() {
    const id = this.props.selectedComponent;
    return getObjectFromContent(this.props.content as IContent, id + '') as IComponent;

    // if (id === null) {
    //   return null as LooseObject;
    // }

    // let res = null as LooseObject;
    // this.props.content.forEach((c: LooseObject) => {
    //   if (c.id === id) {
    //     res = c;
    //   }
    // }, this);

    // return res;
  }

  render() {
    let type = '';
    let data = {};
    let component = this.getComponentFromContent();
    if (component !== null) {
      type = component.name;
      data = component.data;
      // tslint:disable-next-line:no-console
      console.log(component);
    }

    let Title = (
      <h2 style={{ paddingBottom: 0, marginBottom: 0 }}>
        <Icon type="appstore" style={{ marginRight: '8px' }} />
        Components
      </h2>
    );
    if (this.props.selectedComponent) {
      Title = (
        <h2 style={{ paddingBottom: 0, marginBottom: 0 }}>
          <Icon type="edit" style={{ marginRight: '8px' }} />
          {type}
        </h2>
      );
    }

    const PageName = <h2 style={{ paddingBottom: 0, marginBottom: 0 }}>{this.props.pageName}</h2>;

    const size = 16;

    return (
      <div className={'editor'}>
        <Row>
          <Col span={size}>
            <Card title={PageName}>
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
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Editor;
