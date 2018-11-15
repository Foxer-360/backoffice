import { builder, Delta, getObjectFromContent } from '@foxer360/delta';
import { IComponent, IContent, IOperation } from '@foxer360/delta';
import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import { Button, Card, Icon, Modal, Tabs } from 'antd';
import * as React from 'react';
import Editor from './components/Editor';
import Spinner from './components/Spinner';
import Users from './components/Users';

// import './composer.css';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda
// tslint:disable:max-classes-per-file

const { confirm } = Modal;

export interface IComponentObject {
  id: number;
  name: string;
  position: number;
  data: ILooseObject;
  plugins: string[];
}

export interface IAddComponentObject {
  id?: number;
  name: string;
  position?: number;
  data: ILooseObject;
  parent?: string;
}

export interface IComponentsServiceLikeClass {
  getAllowedTypes(): string[];
  getComponent(type: string): typeof React.Component;
  getComponentResource(type: string): ILooseObject;
  getForm(type: string): typeof React.Component;
}

export interface IPluginServiceLikeClass {
  getPluginTabName(name: string): string;
  getPluginComponent(name: string): typeof React.Component;
  getPlugin(name: string): any; // tslint:disable-line:no-any
}

export interface IData {
  content: IContent;
  plugins: ILooseObject;
}

export interface IEditorInfo {
  id: string;
  name?: string;
  icon?: string; // URL of icon image
}

export interface ILockInfo {
  id: number; // ID of component
  editorId: string; // ID of editor
}

export interface IProperties {
  onSave?: (data: IData) => void;
  onCancel?: () => void;
  onTabChange?: () => void;
  onComponentStartEditing?: (id: number) => void;
  onComponentStopEditing?: (id: number) => void;
  toggleChatAndTask?: () => void;
  pageId?: string;
  locked?: number[];
  componentService: IComponentsServiceLikeClass; // Service for components
  pluginService: IPluginServiceLikeClass; // Service for plugins

  // Additional informations about other editors and
  // locks of components
  editors?: IEditorInfo[];
  locks?: ILockInfo[];
  me?: string; // My ID used in editors and locks

  layouts?: boolean;

  context: Context;

  // Event handlers
  onComponentAdded?: (data: ILooseObject) => void;
  onComponentTryAdd?: (data: ILooseObject) => void;
  onComponentRemoved?: (id: number) => void;
  onComponentTryRemove?: (id: number) => void;
  onComponentUpdated?: (id: number, data: ILooseObject) => void;
  onComponentTryUpdate?: (id: number, data: ILooseObject) => void;
  onComponentMoved?: (id: number, position: number) => void;
  onComponentTryMove?: (id: number, position: number) => void;
  onComponentTryStartEdit?: (id: number) => void;
  onComponentStartEdit?: (id: number) => void;
  onComponentTryStopEdit?: (id: number) => void;
  onComponentStopEdit?: (id: number) => void;

  // Activators
  activateComponentAdd?: (data: ILooseObject) => Promise<boolean>;
  activateComponentRemove?: (id: number) => Promise<boolean>;
  activateComponentUpdate?: (id: number, data: ILooseObject) => Promise<boolean>;
  activateComponentMove?: (id: number, position: number) => Promise<boolean>;
  activateComponentStartEdit?: (id: number) => Promise<boolean>;
  activateComponentStopEdit?: (id: number) => Promise<boolean>;
  activateCommit?: (data: ILooseObject) => Promise<boolean>;
  resetPageContent?: (id: String, content: LooseObject) => void;
  language?: ILooseObject;
}

// Controls

// addComponent --
// moveComponent --
// removeComponent --
// updateComponent -- MUST BE EDITED, more in method comments
// lockComponent
// unlockComponent
// updateLocks --
// updateUsers --
// setContent
// setName
// getContent
// getPluginData
// setPluginData
// enablePlugins
// disablePlugins
// resetContent
// resetPluginData
// resetPlugins
// updatePositions

export interface IState {
  // content: IComponentObject[]; // Content composed from components
  // contentNew: ILooseObject;
  content: IContent;
  data: ILooseObject; // Data from each plugin
  plugins: string[]; // Array of available plugins
  step: string; // Active step like editor
  name: string; // Name of current editing page
  componentEditor: {
    id: number | null; // ID of edited component
    revData: ILooseObject; // Reverse data. If user cancel his updates, these data will be pushed into component
  };
}

const cleanContent = ((): IContent => {
  const d = new Delta();
  d.commit('init', { data: {} });
  d.push();

  return builder(d);
})();

const dummySpinner = {
  disable: () => { 
    return;
  },
  enable: () => { 
    return;
  }
} as Spinner;

class Composer extends React.Component<IProperties, IState> {

  private RESET_STATE = {
    componentEditor: {
      id: null,
      revData: {},
    },
    content: cleanContent,
    data: {},
    name: 'Editor',
    plugins: [],
    step: 'editor',
  } as IState;

  // Simple debug flag
  private DEBUG = true;

  // Spinner reference
  private spinner: Spinner = dummySpinner;

  // Plugins
  private pluginsInstances: ILooseObject;

  // Delta Language object
  private delta: Delta;

  /**
   * Component class constructor
   *
   * @param {IProperties} props
   */
  constructor(props: IProperties) {
    super(props);

    // Create new empty delta
    this.delta = new Delta();
    this.delta.commit('init', { data: {} });
    this.delta.push();

    this.state = {
      ...this.RESET_STATE,
      content: builder(this.delta),
    };

    this.pluginsInstances = {};

    this.handleCancel = this.handleCancel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.setContent = this.setContent.bind(this);
    // Private events
    this._eventUpdateComponent = this._eventUpdateComponent.bind(this);
    this._eventRemoveComponent = this._eventRemoveComponent.bind(this);

    // Actions for component editation
    this.handleCancelComponent = this.handleCancelComponent.bind(this);
    this.handleSaveComponent = this.handleSaveComponent.bind(this);
    this.handleStartEditComponent = this.handleStartEditComponent.bind(this);
    this.handleStopEditComponent = this.handleStopEditComponent.bind(this);
    this.handleUpdateComponent = this.handleUpdateComponent.bind(this);
    this.handleAddComponent = this.handleAddComponent.bind(this);
    this.handleMoveComponent = this.handleMoveComponent.bind(this);
    this.handleRemoveComponent = this.handleRemoveComponent.bind(this);
    this.handleAddContainer = this.handleAddContainer.bind(this);
    this.handleRemoveContainer = this.handleRemoveContainer.bind(this);
    this.handleLockContainer = this.handleLockContainer.bind(this);
  }
  /**
   * Standard React render method
   *
   * @return {JSX.Element}
   */
  public render(): JSX.Element {

    if (!this.state.content) {
      return <span>Waiting for content</span>;
    }

    let editors = [] as IEditorInfo[];
    if (this.props.editors) {
      editors = this.props.editors;
    }

    const ExtraContent = (
      <>
        <hr
          style={{
            border: '0',
            borderTop: '1px solid #e6e6e6',
            marginLeft: '6px',
            marginRight: '6px',
            marginTop: '24px',
          }}
        />
        <Button type="primary" style={{marginTop: '0px'}} onClick={this.handleSave}>
          <Icon type="save" />
          Save
        </Button>

        <hr
          style={{
            border: '0',
            borderTop: '1px solid #e6e6e6',
            marginBottom: '24px',
            marginLeft: '6px',
            marginRight: '6px',
            marginTop: '24px',
          }}
        />

        <Button type="primary" style={{marginTop: '0px'}} onClick={this.props.toggleChatAndTask}>
          <Icon type="save" />
          Chat and Tasks
        </Button>

        <div
          style={{
            marginTop: '18px',
            padding: '0px 8px',
            textAlign: 'left',
          }}
        >
          <Users editors={editors} />
        </div>
      </>
    );
    return (
      <div>
        <Tabs
          activeKey={this.state.step}
          onChange={this.handleTabChange}
          tabPosition="right"
          tabBarExtraContent={ExtraContent}
        >
          <Tabs.TabPane
            tab={<span><Icon type="form" />Page Content</span>}
            key="editor"
          >
            <div style={{ position: 'relative' }}>
              <Spinner ref={(node: Spinner) => this.spinner = node}>
                <Editor
                  pageId={this.props.pageId}
                  content={this.state.content}
                  pageName={this.state.name}
                  selectedComponent={this.state.componentEditor.id}
                  updateComponent={this._eventUpdateComponent}
                  cancelComponent={this.handleCancelComponent}
                  saveComponent={this.handleSaveComponent}
                  selectComponent={this.handleStartEditComponent}
                  componentsService={this.props.componentService}
                  moveComponent={this.handleMoveComponent}
                  addComponent={this.handleAddComponent}
                  removeComponent={this._eventRemoveComponent}
                  editors={this.props.editors}
                  locks={this.props.locks}
                  me={this.props.me}
                  addContainer={this.handleAddContainer}
                  removeContainer={this.handleRemoveContainer}
                  lockContainer={this.handleLockContainer}
                  layouts={this.props.layouts}
                  language={this.props.language}
                  context={this.props.context}
                  resetPageContent={this.props.resetPageContent}
                />
              </Spinner>
            </div>
          </Tabs.TabPane>

          {this.state.plugins.map((name: string) => {
            const Plugin = this.props.pluginService.getPluginComponent(name);
            const tabName = this.props.pluginService.getPluginTabName(name);

            const Title = <h2 style={{ paddingBottom: 0, marginBottom: 0 }}>{tabName}</h2>;

            return (
              <Tabs.TabPane
                tab={<span><Icon type="database" />{tabName}</span>}
                key={name}
              >
                <Card title={Title}>
                  <Plugin
                    onChange={(data: ILooseObject) => this.handlePluginDataChange(name, data)}
                    initData={this.state.data[name] || null}
                    config={this.state.data[name] || null}
                  />
                </Card>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * Get data in defined format
   *
   * @return {IData}
   */
  public getData(): IData {
    const data = {
      content: this.state.content,
      plugins: this.state.data
    } as IData;

    return data;
  }

  /**
   * Set content to Composer for editing
   *
   * @param {IContent} content
   * @return {Promise<void>}
   */
  public setContent(content: IContent): Promise<void> {
    // Reset delta
    this.delta = new Delta();

    return new Promise((resolve) => {
      this.setState({
        content: { ...content },
      }, () => resolve());
    });
  }

  /**
   * Set data for specific plugin
   *
   * @param {string} name
   * @param {ILooseObject} data
   * @return {void}
   */
  public setPluginData(name: string, data: ILooseObject): void {
    this.setState({
      data: {
        ...this.state.data,
        [name]: data
      }
    });
  }

  /**
   * Reset content in Composer
   *
   * @return {void}
   */
  public resetContent(): void {
    // Reset delta
    this.delta = new Delta();
    this.delta.commit('init', { data: {} });
    this.delta.push();

    this.setState({
      content: builder(this.delta),
    });
  }

  /**
   * Reset data for specific plugin
   *
   * @param {string} name
   * @return {void}
   */
  public resetPluginData(name: string): void {
    this.setState({
      data: {
        ...this.state.data,
        [name]: {}
      }
    });
  }

  /**
   * Reset data for all plugins
   *
   * @return {void}
   */
  public resetPlugins(): void {
    this.setState({
      data: {}
    });
  }

  /**
   * Enable plugins in composer
   *
   * @param {string | string[]} names one name or array of names
   * @return {Promise<void>}
   */
  public enablePlugins(names: string | string[], client?: any): Promise<void> { // tslint:disable-line:no-any
    if (!Array.isArray(names)) {
      names = [ names ];
    }

    names = names.filter((name: string) => {
      const index = this.state.plugins.indexOf(name);

      if (index > -1) {
        if (this.pluginsInstances[name]) {
          this.pluginsInstances[name].resetPlugin(this.props.context, null);
        }
        return false;
      }

      return true;
    });

    // Filter already existing plugins
    names.forEach((name: string) => {
      const Plugin = this.props.pluginService.getPlugin(name);
      if (Plugin) {
        this.pluginsInstances[name] = new Plugin(this.props.context, null, client);
        this.props.context.addListener(name, () => {
          this.forceUpdate();
        });
      } else {
        // tslint:disable-next-line:no-console
        console.log(`Plugin ${name} failed to load...`);
      }
    });

    return new Promise((resolve) => {
      this.setState({
        plugins: [ ...this.state.plugins, ...names as string[] ]
      }, () => resolve());
    });
  }

  /**
   * Set name
   *
   * @param {string} name
   * @return {Promise<void>}
   */
  public setName(name: string): Promise<void> {
    // If name is null
    if (name === undefined || name === null) {
      return Promise.resolve();
    }
    // If name is empty string
    if (name.length < 1) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.setState({
        name
      }, () => resolve());
    });
  }

  //
  //
  // PUBLIC CONTROL
  //
  //

  /**
   * Add component into content from outside of composer
   *
   * @param {IAddComponentObject} data of new component
   * @param {boolean} activated? true if you want to skip activator in addComponent flow
   * @return {Promise<void>}
   */
  public addComponent(data: IAddComponentObject, activated?: boolean): Promise<boolean> {
    const position = data.position;
    const parent = data.parent;

    return this.handleAddComponent(data, position as number, parent as string, activated);
  }

  public removeComponent(id: number, activated?: boolean): Promise<boolean> {
    return this.handleRemoveComponent(id, activated);
  }

  public updateComponent(id: number, data: IComponentObject, activated?: boolean): Promise<boolean> {
    return this.handleUpdateComponent(id, data, activated);
  }

  public moveComponent(id: number, position: number): Promise<boolean> {
    return Promise.resolve(true);
  }

  public updatePositions(positionMap: ILooseObject, activated?: boolean): Promise<boolean> {
    return this.handleUpdatePositions(positionMap, activated);
  }

  public update(updates: IOperation[]): Promise<boolean> {
    this.delta.update(updates);

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, this.state.content),
      }, () => resolve());
    });
  }

  public importDelta(data: IOperation[]): Promise<boolean> {
    this.delta.import(data);

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, this.state.content),
      }, () => resolve());
    });
  }

  // tslint:disable-next-line:no-any
  public updateCommits(commits: any): Promise<boolean> {
    // tslint:disable-next-line:no-console
    console.log('Update commits', commits);
    this.delta.forceCommit(commits);
    this.delta.push();

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, this.state.content),
      }, () => resolve());
    });
  }

  //
  //
  // PUBLIC EVENT HANDLERS
  //
  //

  // /**
  //  * Fired when composer try to add new component
  //  *
  //  * @param {IAddComponentObject} data of new component
  //  * @return {void}
  //  */
  // private eventCommponentTryAdd(data: IAddComponentObject): void {
  //   // Just call event if exists
  //   if (this.props.onComponentTryAdd) {
  //     this.props.onComponentTryAdd(data);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentTryAdd event', data);
  // }

  // /**
  //  * Fired when composer successfully add new component
  //  *
  //  * @param {IAddComponentObject} data of new component
  //  * @return {void}
  //  */
  // private eventComponentAdded(data: IAddComponentObject): void {
  //   // Just call event if exists
  //   if (this.props.onComponentAdded) {
  //     this.props.onComponentAdded(data);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentAdded event', data);
  // }

  // /**
  //  * Fired when composer try to remove some component
  //  *
  //  * @param {number} id of component which tries to remove
  //  * @return {void}
  //  */
  // private eventComponentTryRemove(id: number): void {
  //   // Just call event if exists
  //   if (this.props.onComponentTryRemove) {
  //     this.props.onComponentTryRemove(id);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentTryRemove event', id);
  // }

  // /**
  //  * Fired when composer successfully remove some component
  //  *
  //  * @param {number} id of component which was successfully removed
  //  * @return {void}
  //  */
  // private eventComponentRemoved(id: number): void {
  //   // Just call event if exists
  //   if (this.props.onComponentRemoved) {
  //     this.props.onComponentRemoved(id);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentRemoved event', id);
  // }

  // *
  //  * Fired when composer try to move some component to new position
  //  *
  //  * @param {number} id of component which tries to move
  //  * @param {number} position new position of component
  //  * @return {void}

  // private eventComponentTryMove(id: number, position: number): void {
  //   // Just call event if exists
  //   if (this.props.onComponentTryMove) {
  //     this.props.onComponentTryMove(id, position);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentTryMove event', id, position);
  // }

  // /**
  //  * Fired when composer successfulley move some component to new position
  //  *
  //  * @param {number} id of component which was successfully moved
  //  * @param {number} position new position of component
  //  * @return {void}
  //  */
  // private eventComponentMoved(id: number, position: number): void {
  //   // Just call event if exists
  //   if (this.props.onComponentMoved) {
  //     this.props.onComponentMoved(id, position);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentMoved event', id, position);
  // }

  // /**
  //  * Fired when composer try to update some component
  //  *
  //  * @param {number} id of component which tries to update
  //  * @param {IComponentObject} data updated data of component
  //  * @return {void}
  //  */
  // private eventComponentTryUpdate(id: number, data: ILooseObject): void {
  //   // Just call event if exists
  //   if (this.props.onComponentTryUpdate) {
  //     this.props.onComponentTryUpdate(id, data);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentTryUpdate event', data);
  // }

  // /**
  //  * Fired when composer successfully update data of some component
  //  *
  //  * @param {number} id of component which was successfully updated
  //  * @param {IComponentObject} data updated data of component
  //  * @return {void}
  //  */
  // private eventComponentUpdated(id: number, data: IComponentObject): void {
  //   // Just call event if exists
  //   if (this.props.onComponentUpdated) {
  //     this.props.onComponentUpdated(id, data);
  //   }

  //   // Debug message
  //   this.debug('Fired onComponentUpdated event', data);
  // }

  /**
   * Fired when composer try to start edit some component. By edit some component
   * it's meant that user click on edit button on component and composer will
   * open form for this component
   *
   * @param {number} id of edited component
   * @return {void}
   */
  private eventComponentTryStartEdit(id: number): void {
    // Just call event if exists
    if (this.props.onComponentTryStartEdit) {
      this.props.onComponentTryStartEdit(id);
    }

    // Debug message
    this.debug('Fired onComponentTryStartEdit event', id);
  }

  /**
   * Fired when composer successfully start edit some component. By edit some component
   * it's meant that user click on edit button on component and composer will open
   * form for this component
   *
   * @param {number} id of edited component
   * @return {void}s
   */
  private eventComponentStartEdit(id: number): void {
    // Just call event if exists
    if (this.props.onComponentStartEdit) {
      this.props.onComponentStartEdit(id);
    }

    // Debug message
    this.debug('Fired onComponentStartEdit event', id);
  }

  /**
   * Fired when composer try to stop edit some component. By stop edit component it's meant
   * that user had opened form of this component and click on save/cancel button and composer
   * will close form for this component
   *
   * @param {number} id of edited component
   * @return {void}
   */
  private eventComponentTryStopEdit(id: number): void {
    // Just call event if exists
    if (this.props.onComponentTryStopEdit) {
      this.props.onComponentTryStopEdit(id);
    }

    // Debug message
    this.debug('Fired onComponentTryStopEdit event', id);
  }

  /**
   * Fired when composer successfully stop edit some component. By stop edit component it's meant
   * that user had opened form of this component and click on save/cancel button and composer
   * will close form for this component
   *
   * @param {number} id of edited component
   * @return {void}
   */
  private eventComponentStopEdit(id: number): void {
    // Just call event if exists
    if (this.props.onComponentStopEdit) {
      this.props.onComponentStopEdit(id);
    }

    // Debug message
    this.debug('Fired onComponentStopEdit event', id);
  }

  //
  //
  // ACTIVATORS SECTION
  //
  //

  // /**
  //  * Simple activator for adding new component. If activator returns false,
  //  * than new component will not be added.
  //  *
  //  * @param {IAddComponentObject} data of new component
  //  * @return {Promise<boolean>}
  //  */
  // private activateComponentAdd(data: ILooseObject): Promise<boolean> {
  //   if (this.props.activateComponentAdd) {
  //     return this.props.activateComponentAdd(data);
  //   }

  //   return Promise.resolve(true);
  // }

  // /**
  //  * Simple activator for removing component. If activator returns false,
  //  * than selected component will not be removed.
  //  *
  //  * @param {number} id of component which composer try to remove
  //  * @return {Promise<boolean>}
  //  */
  // private activateComponentRemove(id: number): Promise<boolean> {
  //   if (this.props.activateComponentRemove) {
  //     return this.props.activateComponentRemove(id);
  //   }

  //   return Promise.resolve(true);
  // }

  // *
  //  * Simple activator for moving component. If activator returns false,
  //  * than selected component will not be moved.
  //  *
  //  * @param {number} id of component which composer try to move
  //  * @param {number} position new position of component
  //  * @return {Promise<boolean>}

  // private activateComponentMove(id: number, position: number): Promise<boolean> {
  //   if (this.props.activateComponentMove) {
  //     return this.props.activateComponentMove(id, position);
  //   }

  //   return Promise.resolve(true);
  // }

  // /**
  //  * Simple activator for updating component. If activator returns false,
  //  * than selected component will not be updated
  //  *
  //  * @param {number} id of component which composer try to update
  //  * @param {IComponentObject} data of component
  //  * @return {Promise<boolean>}
  //  */
  // private activateComponentUpdate(id: number, data: ILooseObject): Promise<boolean> {
  //   if (this.props.activateComponentUpdate) {
  //     return this.props.activateComponentUpdate(id, data);
  //   }

  //   return Promise.resolve(true);
  // }

  /**
   * Simple activator for start editing component. If activator returns false,
   * than selected component cannot be edited.
   *
   * @param {number} id of component which composer wants to start edit
   * @return {Promise<boolean>}
   */
  private activateComponentStartEdit(id: number): Promise<boolean> {
    if (this.props.activateComponentStartEdit) {
      return this.props.activateComponentStartEdit(id);
    }

    return Promise.resolve(true);
  }

  /**
   * Simple activator for stop editing component. If activator teturns false,
   * than selected component cannot be save/cancel of editing.
   *
   * @param {number} id of component which composer wants to stop edit
   * @return {Promise<boolean>}
   */
  private activateComponentStopEdit(id: number): Promise<boolean> {
    if (this.props.activateComponentStopEdit) {
      return this.props.activateComponentStopEdit(id);
    }

    return Promise.resolve(true);
  }

  /**
   * Simple activator, that always returns true
   *
   * @return {Promise<boolean>}
   */
  private activateAlways(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Simple activator for general commit in delta
   */
  private activateCommit(data: ILooseObject): Promise<boolean> {
    if (this.props.activateCommit) {
      return this.props.activateCommit(data);
    }

    return Promise.resolve(true);
  }

  //
  //
  // PRIVATE EVENT HANDLERS SECTION
  //
  //

  /**
   * Inner event for handling update component
   *
   * @param {ILooseObject} data in component
   * @return {void}
   */
  private _eventUpdateComponent(data: ILooseObject): void {
    // Get ID of edited component
    const id = this.state.componentEditor.id;

    // Find component in content
    const component = getObjectFromContent(this.state.content, id + '') as IComponent;
    // const component = this.state.content.find((c: IComponentObject) => {
    //   if (c.id === id) {
    //     return true;
    //   }

    //   return false;
    // });

    // Check if we have component
    if (!component) {
      this.debug(`Cannot find component with ID ${id} in content to update it`);
      return;
    }

    // Update data in component object and call handleUpdateComponent control action
    component.data = data;
    this.handleUpdateComponent(id as number, component);
  }

  /**
   * Inner event for handling remove component and show
   * confirm dialog
   *
   * @param {number} id of component
   * @return {void}
   */
  private _eventRemoveComponent(id: number): void {
    confirm({
      content: 'Be sure you want to do this. If you remove component you cannot revert this action.',
      onOk: () => this.handleRemoveComponent(id),
      title: 'Do you want to remove this page ?',
    });
  }

  //
  //
  // PRIVATE CONTROL SECTION
  //
  //

  /**
   * Handle Add Component control action to add new component.
   *
   * @param {IAddComponentObject} data of new component
   * @param {number} position? of newly added component
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleAddComponent(data: ILooseObject, position: number,
    container: string, activated?: boolean): Promise<boolean> {
    // Fire onComponentTryAdd event
    this.delta.commit('add', {
      data: {
        data: {
          ...data.data
        },
        name: data.name,
        parent: container,
        position,
      },
      type: 'component',
    });
    const comm = this.delta.pull();

    // Activator
    if (this.spinner) {
      this.spinner.enable();
    }
    let activator = this.activateAlways();
    if (!activated) {
      activator = this.activateCommit(comm);
    }

    return activator.then((can: boolean) => {
      if (!can) {
        if (this.spinner) {
          this.spinner.disable();
        }
        this.delta.revert();
        return Promise.resolve(false);
      }

      this.delta.push();

      return new Promise((resolve) => {
        this.setState({
          content: builder(this.delta, this.state.content),
        }, () => {
          // Fire onComponentAdd event
          // this.eventComponentAdded(preparedData);

          // And just resolve this promise
          if (this.spinner) {
            this.spinner.disable();
          }
          resolve(true);
        });
      }) as Promise<boolean>;
    });

    // this.delta.push();

    // return new Promise((resolve) => {
    //   this.setState({
    //     content: builder(this.delta, this.state.content),
    //   }, () => resolve());
    // });

    // // Check position
    // if (position === undefined || position === null) {
    //   position = this.state.content.length;
    // }
    // // If position is negative, start counting from end
    // if (position < 0) {
    //   position = this.state.content.length + position + 1;
    // }

    // // Get new ID
    // let id = 0;
    // this.state.content.forEach((o: IComponentObject) => {
    //   if (o.id >= id) {
    //     id = o.id + 1;
    //   }
    // });

    // const preparedData = {
    //   name: 'Fuck YOu',
    //   data: {},
    //   ...data,
    //   position,
    //   id,
    //   plugins: [] as string[],
    // } as IComponentObject;

    // // Fire onComponentTryAdd event
    // this.eventCommponentTryAdd(preparedData);

    // // Use activator activateComponentAdd
    // this.spinner.enable();
    // let activator = this.activateAlways();
    // if (!activated) {
    //   activator = this.activateComponentAdd(preparedData);
    // }
    // return activator.then((can: boolean) => {
    //   // If can not add, just finish process
    //   if (!can) {
    //     this.spinner.disable();
    //     return Promise.resolve(false);
    //   }

    //   // Can be added, so add it into content at position
    //   const content = this.state.content.map((o: IComponentObject) => {
    //     if (o.position >= position) {
    //       o.position++;
    //     }

    //     return o;
    //   });
    //   content.push(preparedData);

    //   // Sort this content
    //   content.sort(this.compareComponents);

    //   // Save into state
    //   return new Promise((resolve) => {
    //     this.setState({
    //       content
    //     }, () => {
    //       // Fire onComponentAdd event
    //       this.eventComponentAdded(preparedData);

    //       // And just resolve this promise
    //       this.spinner.disable();
    //       resolve(true);
    //     });
    //   }) as Promise<boolean>;
    // });
  }

  /**
   * Handle Remove Component control action to remove some component
   * from content
   *
   * @param {number} id of component which will be removed
   * @param {boolean} activated? trur if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleRemoveComponent(id: number, activated?: boolean): Promise<boolean> {
    // Using delta

    return this.handleCancelComponent().then(() => {
      this.delta.commit('remove', {
        data: {},
        id: '' + id,
      });
      const comm = this.delta.pull();
  
      // Activator
      if (this.spinner) {
        this.spinner.enable();
      }
      let activator = this.activateAlways();
      if (!activated) {
        activator = this.activateCommit(comm);
      }
  
      return activator.then((can: boolean) => {
        if (!can) {
          if (this.spinner) {
            this.spinner.disable();
          }
          this.delta.revert();
          return Promise.resolve(false);
        }
  
        this.delta.push();
  
        return new Promise((resolve) => {
          this.setState({
            content: builder(this.delta, this.state.content),
          }, () => {
            // Fire onComponentAdd event
            // this.eventComponentAdded(preparedData);
  
            // And just resolve this promise
            if (this.spinner) {
              this.spinner.disable();
            }
            resolve(true);
          });
        }) as Promise<boolean>;
      });
    });

    // this.delta.push();

    // return new Promise((resolve) => {
    //   this.setState({
    //     content: builder(this.delta, this.state.content),
    //   }, () => resolve());
    // });

    // this.setState({});

    // let position = -1;
    // let index = -1;
    // this.state.content.forEach((o: IComponentObject, i: number) => {
    //   if (o.id === id) {
    //     position = o.position;
    //     index = i;
    //   }
    // }, this);

    // // Fire onComponentTryRemove event
    // this.eventComponentTryRemove(id);

    // // Something goes wrong or component doesn't exists
    // if (position < 0 || index < 0) {
    //   return Promise.resolve(false);
    // }

    // // If component is under editing, try to deselect this component
    // this.spinner.enable();
    // let preparation = this.activateAlways();
    // if (this.state.componentEditor.id === id) {
    //   preparation = this.handleStopEditComponent();
    // }

    // return preparation.then((res: boolean) => {
    //   if (!res) {
    //     this.spinner.disable();
    //     return Promise.resolve(false);
    //   }

    //   let activator = this.activateAlways();
    //   if (!activated) {
    //     activator = this.activateComponentRemove(id);
    //   }

    //   return activator.then((can: boolean) => {
    //     if (!can) {
    //       this.spinner.disable();
    //       return Promise.resolve(false);
    //     }

    //     let content = this.state.content.map((o: IComponentObject) => {
    //       if (o.position > position) {
    //         o.position--;
    //       }

    //       return o;
    //     });
    //     content.splice(index, 1);
    //     content.sort(this.compareComponents);

    //     return new Promise((resolve) => {
    //       this.setState({
    //         content
    //       }, () => {
    //         // Fire onComponentRemoved event
    //         this.eventComponentRemoved(id);
    //         this.spinner.disable();
    //         resolve(true);
    //       });
    //     }) as Promise<boolean>;
    //   });
    // });
  }

  /**
   * Handle Update Component control action to update some component
   * in content
   *
   * @param {number} id of component which will be edited
   * @param {ILooseObject} data of component (inner data without name, id, position etc)
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleUpdateComponent(id: number, data: ILooseObject, activated?: boolean): Promise<boolean> {
    // Using delta
    // tslint:disable-next-line:no-console
    console.log('UPDATE', data);
    this.delta.commit('edit', {
      data: {
        ...data.data
      },
      id: '' + id,
    });
    const comm = this.delta.pull();

    // Activator
    if (this.spinner) {
      this.spinner.enable();
    }
    let activator = this.activateAlways();
    if (!activated) {
      activator = this.activateCommit(comm);
    }

    return activator.then((can: boolean) => {
      if (!can) {
        if (this.spinner) {
          this.spinner.disable();
        }
        this.delta.revert();
        return Promise.resolve(false);
      }

      this.delta.push();

      return new Promise((resolve) => {
        this.setState({
          content: builder(this.delta, this.state.content),
        }, () => {
          // Fire onComponentAdd event
          // this.eventComponentAdded(preparedData);

          // And just resolve this promise
          if (this.spinner) {
            this.spinner.disable();
          }
          resolve(true);
        });
      }) as Promise<boolean>;
    });
    // this.delta.push();

    // return new Promise((resolve) => {
    //   this.setState({
    //     content: builder(this.delta, this.state.content),
    //   }, () => resolve());
    // });

    // // Fire onComponentTryUpdate event
    // this.eventComponentTryUpdate(id, data);

    // this.spinner.enable();
    // let activator = this.activateAlways();
    // if (!activated) {
    //   activator = this.activateComponentUpdate(id, data);
    // }

    // return activator.then((can: boolean) => {
    //   if (!can) {
    //     this.spinner.disable();
    //     return Promise.resolve(false);
    //   }

    //   let content = this.state.content.map((o: IComponentObject) => {
    //     if (o.id === id) {
    //       return data;
    //     }

    //     return o;
    //   });

    //   return new Promise((resolve) => {
    //     this.setState({
    //       content
    //     }, () => {
    //       // Fire onComponentUpdated event
    //       this.eventComponentUpdated(id, data);
    //       this.spinner.disable();
    //       resolve(true);
    //     });
    //   }) as Promise<boolean>;
    // });
  }

  /**
   * Handle Move Component control action to move some component
   * in content to new position
   *
   * @param {number} id of component which will be moved
   * @param {number} position new position of component
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleMoveComponent(id: number, position: number, activated?: boolean): Promise<boolean> {
    // Using delta
    this.delta.commit('move', {
      data: {
        position,
      },
      id: '' + id,
    });
    const comm = this.delta.pull();

    // Activator
    if (this.spinner) {
      this.spinner.enable();
    }
    let activator = this.activateAlways();
    if (!activated) {
      activator = this.activateCommit(comm);
    }

    return activator.then((can: boolean) => {
      if (!can) {
        if (this.spinner) {
          this.spinner.disable();
        }
        this.delta.revert();
        return Promise.resolve(false);
      }

      this.delta.push();

      return new Promise((resolve) => {
        this.setState({
          content: builder(this.delta, this.state.content),
        }, () => {
          // Fire onComponentAdd event
          // this.eventComponentAdded(preparedData);

          // And just resolve this promise
          if (this.spinner) {
            this.spinner.disable();
          }
          resolve(true);
        });
      }) as Promise<boolean>;
    });
    // this.delta.push();

    // return new Promise((resolve) => {
    //   this.setState({
    //     content: builder(this.delta, this.state.content),
    //   }, () => resolve());
    // });

    // // Fire onComponentTryMove event
    // this.eventComponentTryMove(id, position);

    // let oldPosition = -1;
    // let index = -1;
    // this.state.content.forEach((o: IComponentObject, i: number) => {
    //   if (o.id === id) {
    //     index = i;
    //     oldPosition = o.position;
    //   }
    // }, this);

    // // Something goes wrong or component doesn't exists
    // if (oldPosition < 0 || index < 0) {
    //   return Promise.resolve(false);
    // }

    // // Use activator
    // this.spinner.enable();
    // let activator = this.activateAlways();
    // if (!activated) {
    //   activator = this.activateComponentMove(id, position);
    // }

    // return activator.then((can: boolean) => {
    //   if (!can) {
    //     this.spinner.disable();
    //     return Promise.resolve(false);
    //   }

    //   // Calculate new content positions
    //   let content = this.state.content.map((o: IComponentObject) => {
    //     if (o.id === id) {
    //       o.position = position;
    //       return o;
    //     }
    //     let pos = o.position;
    //     if (oldPosition < o.position && o.position <= position) {
    //       pos--;
    //     }
    //     if (position <= o.position && o.position < oldPosition) {
    //       pos++;
    //     }

    //     o.position = pos;

    //     return o;
    //   });

    //   // Sort content
    //   content.sort(this.compareComponents);

    //   return new Promise((resolve) => {
    //     this.setState({
    //       content
    //     }, () => {
    //       // Fire onComponentMoved event
    //       this.eventComponentMoved(id, position);
    //       this.spinner.disable();
    //       resolve(true);
    //     });
    //   }) as Promise<boolean>;
    // });
  }

  private handleAddContainer(): Promise<boolean> {
    this.delta.commit('add', {
      data: {
        parent: 'root',
        position: -1,
      },
      type: 'container',
    });
    this.delta.push();

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, this.state.content),
      }, () => resolve());
    });
  }

  private handleRemoveContainer(id: string): Promise<boolean> {
    this.delta.commit('remove', {
      data: {},
      id,
      type: 'container',
    });
    this.delta.push();

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, this.state.content),
      }, () => resolve());
    });
  }

  private handleLockContainer(id: string, lock: boolean): Promise<boolean> {
    const name = lock ? 'lock' : 'unlock';
    this.delta.commit(name, {
      data: {},
      id,
      type: 'container',
    });
    this.delta.push();

    return new Promise(resolve => {
      this.setState({
        content: builder(this.delta, { ...this.state.content }),
      }, () => resolve());
    });
  }

  /**
   * Handle Start Edit Component control action to select this
   * component and start editing (show form for this component)
   *
   * @param {number} id of component you want to start edit
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleStartEditComponent(id: number, activated?: boolean): Promise<boolean> {
    // tslint:disable-next-line:no-any
    const elm = getObjectFromContent(this.state.content, id + '') as ILooseObject;

    // Fire onComponentTryStartEdit event
    this.eventComponentTryStartEdit(id);

    if (!elm) {
      return Promise.resolve(false);
    }

    const data = elm.data;

    // Check if component exists and get data from this component
    // let data = null as ILooseObject;
    // let found = false;
    // this.state.content.forEach((c: IComponentObject) => {
    //   if (c.id === id) {
    //     data = deepCopy(c.data);
    //     found = true;
    //   }
    // }, this);

    // // Fire onComponentTryStartEdit event
    // this.eventComponentTryStartEdit(id);

    // if (!found) {
    //   return Promise.resolve(false);
    // }

    // If there is some already editing component, try
    // to stop edit it
    if (this.spinner) {
      this.spinner.enable();
    }
    let preparation = Promise.resolve(true);
    const prevId = this.state.componentEditor.id;
    if (prevId !== null) {
      preparation = this.handleStopEditComponent(prevId, activated);
    }

    return preparation.then((res: boolean) => {
      if (!res) {
        if (this.spinner) {
          this.spinner.disable();
        }
        return Promise.resolve(false);
      }

      // Prepare data and try to start edit
      const componentEditor = {
        id,
        revData: data,
      };

      let activator = this.activateAlways();
      if (!activated) {
        activator = this.activateComponentStartEdit(id);
      }

      return activator.then((can: boolean) => {
        if (!can) {
          if (this.spinner) {
            this.spinner.disable();
          }
          return Promise.resolve(false);
        }

        return new Promise((resolve) => {
          this.setState({
            componentEditor
          }, () => {
            // Fire onComponentStartEdit event
            this.eventComponentStartEdit(id);
            if (this.spinner) {
              this.spinner.disable();
            }
            resolve(true);
          });
        });
      });
    }) as Promise<boolean>;
  }

  /**
   * Handle Stop Edit Component control action to deselect this
   * component and stop editing (hide form for this component).
   *
   * @param {number} id? of component you want to stop edit
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleStopEditComponent(id?: number | null, activated?: boolean): Promise<boolean> {
    // Get ID if it's undefined
    id = this.state.componentEditor.id;

    // If ID is undefined, than do nothing
    if (id === undefined || id === null) {
      return Promise.resolve(true);
    }

    // Fire onComponentTryStopEdit event
    this.eventComponentTryStopEdit(id);

    if (this.spinner) {
      this.spinner.enable();
    }
    let activator = this.activateAlways();
    if (!activated) {
      activator = this.activateComponentStopEdit(id);
    }

    return activator.then((can: boolean) => {
      // If we can not stop edit
      if (!can) {
        if (this.spinner) {
          this.spinner.disable();
        }
        return Promise.resolve(false);
      }

      // Prepare reset values
      const componentEditor = {
        id: null,
        revData: {}
      };

      return new Promise((resolve) => {
        this.setState({
          componentEditor
        }, () => {
          // Fire onComponentStopEdit event
          this.eventComponentStopEdit(id as number);
          if (this.spinner) {
            this.spinner.disable();
          }
          resolve(true);
        });
      }) as Promise<boolean>;
    });
  }

  /**
   * Handle Update Positions control action. This is useful when you recieve
   * new positions from server to update positions at once
   *
   * @param {ILooseObject} positionMap where key id id of component and value is position
   * @param {boolean} activated? true if you want to skip activator
   * @return {Promise<boolean>}
   */
  private handleUpdatePositions(positionMap: ILooseObject, activated?: boolean): Promise<boolean> {
    return Promise.resolve(true);
    // Fire onTryUpdatePositions event
    // Activator
    // this.spinner.enable();
    // const activator = this.activateAlways();

    // return activator.then((can: boolean) => {
    //   if (!can) {
    //     this.spinner.disable();
    //     return Promise.resolve(false);
    //   }

    //   const content = this.state.content.map((c: IComponentObject) => {
    //     c.position = positionMap[c.id];
    //     return c;
    //   });
    //   content.sort(this.compareComponents);

    //   return new Promise((resolve) => {
    //     this.setState({
    //       content
    //     }, () => {
    //       // Fire onUpdatedPositions event
    //       this.spinner.disable();
    //       resolve(true);
    //     });
    //   });
    // }) as Promise<boolean>;
  }

  //
  //
  // OTHERS
  //
  //

  /**
   * Handle on cancel event and call cancel callback
   *
   * @return {void}
   */
  private handleCancel(): void {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  /**
   * Handle on save event and call save callback with
   * all gathered data
   *
   * @return {void}
   */
  private handleSave(): void {
    if (this.props.onSave) {
      this.props.onSave(this.getData());
    }
  }

  /**
   * Handle on tab change event and change state
   * of composer to selected tab and call callback
   *
   * @param {string} activeKey
   * @return {void}
   */
  private handleTabChange(activeKey: string): void {
    // Fire event onTabChange or something like this
    if (this.props.onTabChange) {
      this.props.onTabChange();
    }

    // Change step in state
    this.setState({
      step: activeKey
    });
  }

  /**
   * Handle on plugin data change event and save these changes into
   * state of Composer
   *
   * @param {string} name
   * @param {ILooseObject} data
   * @return {void}
   */
  private handlePluginDataChange(name: string, data: ILooseObject): void {
    this.setState({
      data: {
        ...this.state.data,
        [name]: data
      }
    });

    // Write new config into plugin
    if (this.pluginsInstances[name]) {
      this.pluginsInstances[name].writeConfig(data);
    }
  }

  /** Actions for working with content */
  private handleRevertComponent(): Promise<boolean> {
    // Get info from state
    const id = this.state.componentEditor.id;
    if (id === null) {
      return Promise.resolve(true);
    }

    const component = getObjectFromContent(this.state.content, id + '') as ILooseObject;

    // const component = this.state.content.find((c: IComponentObject) => {
    //   if (c.id === id) {
    //     return true;
    //   }

    //   return false;
    // });

    if (!component) {
      return Promise.resolve(true);
    }

    const data = this.state.componentEditor.revData;
    component.data = data;

    return this.handleUpdateComponent(id, component);
  }

  private handleCancelComponent() {
    // There can be fired some event to top for information that
    // content in component was reverted to defaults
    return this.handleRevertComponent()
      .then(() => {
        // return this.handleDeselectComponent();
        return this.handleStopEditComponent();
      });
  }

  private handleSaveComponent() {
    // There can be fired some event to top for information that
    // content in component was updated
    // return this.handleDeselectComponent();
    return this.handleStopEditComponent();
  }

  /**
   * Very simple method for debuging Composer. It's just call
   * console.log method, but only if debug flag is true
   *
   * @param {string} name
   * @param {any[]} args
   * @return {void}
   */
  // tslint:disable-next-line:no-any
  private debug(name: string, ...args: any[]): void {
    if (this.DEBUG) {
      // tslint:disable-next-line:no-console
      console.log(name, ...args);
    }
  }

}

export default Composer;
