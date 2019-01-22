import { Composer, Context, IEditorInfo, ILockInfo } from '@source/composer';
import { connect, StandardResponse } from '@source/services/socket';
import ChatTasks from '@source/scenes/ChatTasks';
import { ComponentsModule, PluginsModule } from '@source/services/modules';
import history from '@source/services/history';
import { Query } from 'react-apollo';
import { Alert, Card, Spin } from 'antd';
import * as React from 'react';
import gql from 'graphql-tag';
import { client } from '@source/services/graphql';
const socket = connect();

export interface ILooseObject {
  // tslint:disable-line:interface-name
  [key: string]: any; // tslint:disable-line:no-any
}

export interface IProperties {
  // tslint:disable-line:interface-name
  projectId: string;
  project: ILooseObject;
  websiteId: string;
  website: ILooseObject;
  languageId: string;
  language: ILooseObject;
  pageId: string;
  pageTypeId: string;
  pageType: ILooseObject;
  pageTranslationId: string;
  pageTranslation: ILooseObject;
}

export interface IState {
  // tslint:disable-line:interface-name
  editors: IEditorInfo[];
  locks: ILockInfo[];
  loading: boolean; // Flag if all necessary async data are loaded
  failed: boolean; // Flag if loading of page failed (for example server doesn't allow to edit this page)

  content: ILooseObject | null;
  delta: ILooseObject[] | null;
  context: Context;

  taskAndChatHidden: boolean;
}

class Editor extends React.Component<IProperties, IState> {
  private composer: Composer;

  constructor(props: IProperties) {
    super(props);

    this.state = {
      editors: [] as IEditorInfo[],
      locks: [] as ILockInfo[],
      loading: true,
      failed: false,

      content: null,
      delta: null,
      context: new Context(),

      taskAndChatHidden: true,
    };

    this.handleSocketUpdate = this.handleSocketUpdate.bind(this);
    this.handleStopEditPageBeforeStart = this.handleStopEditPageBeforeStart.bind(this);
    this.handleStartEditPage = this.handleStartEditPage.bind(this);
    this.handleGetPage = this.handleGetPage.bind(this);
    this.handleComposerCommitUpdates = this.handleComposerCommitUpdates.bind(this);
    this.handleToggleDisplayTaskAndChat = this.handleToggleDisplayTaskAndChat.bind(this);
    this.handlePageContentReseted = this.handlePageContentReseted.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.activatorStartEditComponent = this.activatorStartEditComponent.bind(this);
    this.activatorStopEditComponent = this.activatorStopEditComponent.bind(this);
    this.activatorCommit = this.activatorCommit.bind(this);
    this.initComposerReference = this.initComposerReference.bind(this);
    this.initComposer = this.initComposer.bind(this);
    this.writeInfoIntoContext = this.writeInfoIntoContext.bind(this);
  }

  public componentDidUpdate(prevProps: IProperties) {
    // Reload content in composer, if necessary
    let necessaryToReload = false;
    if (prevProps.languageId !== this.props.languageId) {
      necessaryToReload = true;
    }
    if (prevProps.pageId !== this.props.pageId) {
      necessaryToReload = true;
    }
    if (prevProps.pageTranslationId !== this.props.pageTranslationId) {
      necessaryToReload = true;
    }
    if (prevProps.websiteId !== this.props.websiteId) {
      necessaryToReload = true;
    }
    if (prevProps.projectId !== this.props.projectId) {
      necessaryToReload = true;
    }

    if (necessaryToReload) {
      this.writeInfoIntoContext();
      this.stopEditPage(prevProps.pageTranslationId);
      this.startEditPage();
    }
  }

  public componentDidMount() {
    // Bind socket to handle editors and locks updates
    socket.on('composer/update', this.handleSocketUpdate);
    socket.on('composer/updateCommits', this.handleComposerCommitUpdates);
    socket.on('composer/reset-page-content', this.handlePageContentReseted);

    this.writeInfoIntoContext();
    this.startEditPage();
  }

  public handlePageContentReseted(payload: ILooseObject): void {
    const { delta, content } = payload;
    this.setState({ delta, content }, async () => {
      await this.composer.setContent(this.state.content as any); // tslint:disable-line:no-any
      await this.composer.importDelta(this.state.delta as any); // tslint:disable-line:no-any
    });
  }

  public resetPageContent(id: String, content: LooseObject): void {
    socket.emit('composer/reset-page-content', {
      pageId: id,
      content,
    });
  }

  public componentWillUnmount() {
    // Remove listener from socket
    socket.removeListener('composer/update');
    socket.removeListener('composer/updateCommits');

    this.stopEditPage(this.props.pageTranslationId);
  }

  public render() {
    if (this.state.failed) {
      return (
        <Card>
          <Alert
            message="Failed to load"
            description="Loading of page failed. The server could deny your access to this page. Try it again."
            type="warning"
          />
        </Card>
      );
    }

    if (this.state.loading) {
      return (
        <Spin tip="Loading...">
          <Card loading={true} />
        </Spin>
      );
    }

    const meOnSocket = socket.id;

    return (
      <>
        <Composer
          pageId={this.props.pageId}
          onSave={this.handleSave}
          ref={this.initComposerReference}
          editors={this.state.editors}
          componentService={ComponentsModule}
          pluginService={PluginsModule}
          me={meOnSocket}
          locks={this.state.locks}
          activateComponentStartEdit={this.activatorStartEditComponent}
          activateComponentStopEdit={this.activatorStopEditComponent}
          activateCommit={this.activatorCommit}
          toggleChatAndTask={this.handleToggleDisplayTaskAndChat}
          context={this.state.context}
          language={this.props.language}
          resetPageContent={this.resetPageContent}
        />

        <ChatTasks
          page={this.props.pageId}
          pageTranslation={this.props.pageTranslationId}
          handleToggleDisplayTaskAndChat={this.handleToggleDisplayTaskAndChat}
          taskAndChatHidden={this.state.taskAndChatHidden}
        />
      </>
    );
  }

  /**
   * Write context information into context
   *
   * @return {void}
   */
  private writeInfoIntoContext() {
    this.state.context.writeProperty('website', this.props.websiteId);
    this.state.context.writeProperty('language', this.props.languageId);
  }

  /**
   * Save reference of composer into this class
   *
   * @param {Composer} node reference of composer
   * @return {void}
   */
  private initComposerReference(node: Composer): void {
    this.composer = node;
  }

  /**
   * Init all data for composer
   *
   * @return {Promise<void>}
   */
  private async initComposer(): Promise<void> {
    if (!this.composer) {
      return Promise.resolve();
    }

    await this.composer.resetContent();
    await this.composer.resetPlugins();
    await this.composer.setContent(this.state.content as any); // tslint:disable-line:no-any
    await this.composer.importDelta(this.state.delta as any); // tslint:disable-line:no-any
    await this.composer.setName(this.props.pageTranslation.name);
  }

  /**
   * This method just resovle update from server via socket.
   * This update can change locks or editors.
   *
   * @param {ILooseObject} payload on socket
   * @return {void}
   */
  private handleSocketUpdate(payload: ILooseObject): void {
    const { type, data } = payload;

    if (type === 'newEditors') {
      this.handleNewEditors(data);
    } else if (type === 'newLocks') {
      this.handleNewLocks(data);
    }
  }

  /**
   * Handle newEditors update from socket server
   *
   * @param {ILooseObject} data from server
   * @return {void}
   */
  private handleNewEditors(data: ILooseObject): void {
    const { pageId, editors } = data;

    this.setState({
      editors,
    });
  }

  /**
   * Handle newLock update from socket server
   *
   * @param {ILooseObject} data from server
   * @return {void}
   */
  private handleNewLocks(data: ILooseObject): void {
    const { pageId, locks } = data;

    if (locks === undefined || locks === null) {
      this.setState({
        locks: [] as ILockInfo[],
      });
      return;
    }
    let locksNew = locks
      .map((o: ILooseObject) => {
        return {
          id: o.component,
          editorId: o.client,
        };
      })
      .filter((o: ILooseObject) => {
        if (o.editorId === null) {
          return false;
        }
        return true;
      });

    this.setState({
      locks: locksNew,
    });
  }

  /**
   * Just inform server about end of editing of this page
   *
   * @param {string} id of page translation
   * @return {void}
   */
  private stopEditPage(id: string): void {
    socket.emit('composer/stop-edit-page', {
      pageId: id,
    });
  }

  /**
   * Ask server for permission to start edit page
   *
   * @return {void}
   */
  private startEditPage(): void {
    // Stop edit page (just for sure) and then start edit
    socket
      .emit('composer/stop-edit-page', {
        pageId: this.props.pageTranslationId,
      })
      .once('composer/stop-edit-page', this.handleStopEditPageBeforeStart);
  }

  /**
   * Handle answer from server of stop editing page event before we start new
   * editing.
   *
   * @param {StandardResponse} response from server
   * @return {void}
   */
  private handleStopEditPageBeforeStart(response: StandardResponse): void {
    if (response.status !== 'success') {
      return this.setState({
        loading: false,
        failed: true,
      });
    }

    // Ask server for permission to edit page
    socket
      .emit('composer/start-edit-page', {
        pageId: this.props.pageTranslationId,
      })
      .once('composer/start-edit-page', this.handleStartEditPage);
  }

  /**
   * Handle answer from server of start editing page event
   *
   * @param {StandardResponse} response from server
   * @return {void}
   */
  private handleStartEditPage(response: StandardResponse): void {
    if (response.status !== 'success') {
      return this.setState({
        loading: false,
        failed: true,
      });
    }

    // Ask server for page informations
    socket
      .emit('composer/get-page', {
        pageId: this.props.pageTranslationId,
      })
      .once('composer/get-page', this.handleGetPage);
  }

  /**
   * Handle answer from server of get page event. And resolve it.
   *
   * @param {StandardResponse} response from server
   * @return {void}
   */
  private handleGetPage(response: StandardResponse): void {
    if (response.status !== 'success') {
      // Failed to load
      return this.setState({
        loading: false,
        failed: true,
      });
    }

    const page = response.payload;

    // Prepare locks from page
    const locks = [] as ILockInfo[];
    const componentIds = Object.keys(page.locks);
    componentIds.forEach((componentId: string) => {
      if (page.locks[componentId]) {
        locks.push({ id: Number(componentId), editorId: page.locks[componentId] });
      }
    }, this);

    this.setState(
      {
        editors: page.editors,
        locks,
        loading: false,
        failed: false,

        content: page.content,
        delta: page.delta,
      },
      () => {
        this.initComposer();
      }
    );
  }

  /**
   * Handle new updated commits from server for composer
   *
   * @param {ILooseObject} payload from server
   * @return {void}
   */
  private handleComposerCommitUpdates(payload: ILooseObject): void {
    const { commits } = payload;

    if (this.composer) {
      this.composer.updateCommits(commits);
    }
  }

  /**
   * Simple handler to toggle chat and task
   *
   * @return {void}
   */
  private handleToggleDisplayTaskAndChat(): void {
    this.setState(
      (state: IState) => {
        return {
          taskAndChatHidden: !state.taskAndChatHidden,
        };
      },
      () => {
        client.cache.writeQuery({
          query: gql`
            query {
              openChatAndTasks
            }
          `,
          data: {
            openChatAndTasks: this.state.taskAndChatHidden,
          },
        });
      }
    );
  }

  /**
   * Handle save action from commposer, save plugins configuration, go back to pages
   *
   * @param {ILooseObject} data from composer
   * @return {void}
   */
  private handleSave(data: ILooseObject): void {
    history.push('/pages');
  }

  /**
   * Activator for composer when trying to start edit component. This
   * activator inform server about this step and if server accept it, then we
   * return true
   *
   * @param {number} id
   * @return {Promise<boolean>} if it's possible to start edit component, then returns true
   */
  private activatorStartEditComponent(id: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/start-edit-component', {
          pageId: this.props.pageTranslationId,
          componentId: id,
        })
        .once('composer/start-edit-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            return resolve(false);
          }

          resolve(true);
        });
    });
  }

  /**
   * Activator for composer when trying to stop edit component. This
   * activator inform server about this step and if server accept it, then we
   * return true
   *
   * @param {number} id
   * @return {Promise<boolean>} if it's possible to stop edit component, then returns true
   */
  private activatorStopEditComponent(id: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/stop-edit-component', {
          pageId: this.props.pageTranslationId,
          componentId: id,
        })
        .once('composer/stop-edit-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            return resolve(false);
          }

          resolve(true);
        });
    });
  }

  /**
   * Activator for composer when trying to commit some action in delta. This
   * activator ask server, if it's possible to perform this action and if it
   * is, then return true
   *
   * @param {ILooseObject} data for server
   * @return {Promise<boolean>} return true if server aprove this action
   */
  private activatorCommit(data: ILooseObject): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/commit', {
          pageId: this.props.pageTranslationId,
          data,
        })
        .once('composer/commit', (response: StandardResponse) => {
          if (response.status !== 'success') {
            return resolve(false);
          }

          // Check for updates from server
          if (response.payload.updates && response.payload.updates.length > 0) {
            this.composer.update(response.payload.updates);
          }

          resolve(true);
        });
    });
  }
}

export default Editor;
