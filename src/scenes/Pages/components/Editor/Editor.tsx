import * as React from 'react';
import Composer from '@source/scenes/Composer';
import { RouterAction } from 'react-router-redux';
import { Button } from 'antd';
import ComponentsService from '@source/services/components';
import PluginService from '@source/services/plugins';
import { ComponentObject, AddComponentObject, EditorInfo, LockInfo } from '@source/scenes/Composer/Composer';
import { connect, StandardResponse } from '@source/services/socket';
import { client, queries } from '@source/services/graphql';
import ChatTasks from '@source/scenes/ChatTasks';
import { adopt } from 'react-adopt';
import { Query } from 'react-apollo';
import { IContent } from 'delta';

const { Component } = React;
const socket = connect();

interface Properties {
  cancel: () => RouterAction;
  save: (content: LooseObject) => ReduxAction;
  prepareForComposer: () => ReduxAction;
  startEditing: (id: number) => ReduxAction;
  stopEditing: (id: number) => ReduxAction;
  resetPageId: () => ReduxAction;

  languageId: number;
  name: string;
  content: LooseObject;
  locked: number[];

  // New properties
  pageId: number;
}

interface State {
  editors: string[];
  locks: LockInfo[];
  pageId: string;
  taskAndChatHidden: boolean;
}

const PageIdsQuery = adopt({
  website: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_WEBSITE}>
      {({ data: { website } }) => {
        return render(website);
      }}
    </Query>
  ),
  language: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_LANGUAGE}>
      {({ data: { language } }) => {
        return render(language);
      }}
    </Query>
  ),
  page: ({ render }) => (
    <Query query={queries.LOCAL_SELECTED_PAGE}>
      {({ data: { page } }) => {
        return render(page);
      }}
    </Query>
  ),
  pageTranslation: ({ website, language, page, render }) => (
    <Query query={queries.PAGE_LIST} variables={{ website }}>
      {({ loading, data: { pages }, error }) => {
        if (loading || error) {
          return render(null);
        }

        // Get actual page
        const p = pages.find((pg: LooseObject) => {
          if (pg.id === page) {
            return true;
          }

          return false;
        });

        if (!p) {
          return render(null);
        }

        // Get language mutation
        const t = p.translations.find((tn: LooseObject) => {
          if (tn.language.id === language) {
            return true;
          }

          return false;
        });

        if (!t) {
          return render(null);
        }

        // Return id of this translation
        return render(t.id);
      }}
    </Query>
  )
});

interface PageIdsQueryVars {
  website: string;
  language: string;
  page: string;
  pageTranslation: string;
}

class Editor extends Component<Properties, State> {
  private composer: Composer;

  private UpdateTypes = {
    newEditors: 'newEditors',
    newLocks: 'newLocks',
    addComponent: 'addComponent',
    updateComponent: 'updateComponent',
    removeComponent: 'removeComponent',
    moveComponent: 'moveComponent'
  };

  private DEBUG = true;

  constructor(props: Properties) {
    super(props);

    // Init state
    this.state = {
      editors: [] as string[],
      locks: [] as LockInfo[],
      pageId: null,
      taskAndChatHidden: true
    };

    // Bind socket to handle updates from server
    socket.on('composer/update', (payload: LooseObject) => {
      const { type, data } = payload;
      this.debugHandler(type, data);

      switch (type) {
        case this.UpdateTypes.newEditors:
          this.handleNewEditors(data);
          return;
        case this.UpdateTypes.newLocks:
          // tslint:disable-next-line:no-console
          console.log('NEW LOCKS', data);
          this.handleNewLocks(data);
          return;
        case this.UpdateTypes.addComponent:
          // this.handleAddComponent(data);
          return;
        case this.UpdateTypes.moveComponent:
          // this.handleMoveComponent(data);
          return;
        case this.UpdateTypes.updateComponent:
          // this.handleUpdateComponent(data);
          return;
        case this.UpdateTypes.removeComponent:
          // this.handleRemoveComponent(data);
          return;
        default:
          return;
      }
    });

    socket.on('composer/updateCommits', (payload: LooseObject) => {
      const { commits } = payload;

      (async () => {
        if (this.composer) {
          await this.composer.updateCommits(commits);
        }
      })();
    });

    this.handleSave = this.handleSave.bind(this);
    this.activator = this.activator.bind(this);
    this.nevim = this.nevim.bind(this);

    this.handleStartEditPage = this.handleStartEditPage.bind(this);
    this.handleGetPage = this.handleGetPage.bind(this);

    this.activatorStartEditComponent = this.activatorStartEditComponent.bind(this);
    this.activatorStopEditComponent = this.activatorStopEditComponent.bind(this);
    this.activatorAddComponent = this.activatorAddComponent.bind(this);
    this.activatorUpdateComponent = this.activatorUpdateComponent.bind(this);
    this.activatorMoveComponent = this.activatorMoveComponent.bind(this);
    this.activatorRemoveComponent = this.activatorRemoveComponent.bind(this);
    this.activatorCommit = this.activatorCommit.bind(this);
    this.handleToggleDisplayTaskAndChat = this.handleToggleDisplayTaskAndChat.bind(this);
  }

  componentDidMount() {
    this.props.prepareForComposer();
    this.debug('DidMount');

    (async () => {
      await this.composer.resetContent();
      if (this.props.name && this.props.name.length > 0) {
        await this.composer.setName(this.props.name);
      }
      await this.composer.enablePlugins('test');
      await this.composer.setPluginData('test', { name: 'sulin' });
    })();

    // Inform server about new editor of this page
    (async () => {
      const { language } = (await client.cache.readQuery({
        query: queries.LOCAL_SELECTED_LANGUAGE
      })) as LooseObject;
      const { website } = (await client.cache.readQuery({
        query: queries.LOCAL_SELECTED_WEBSITE
      })) as LooseObject;
      // tslint:disable-next-line:no-console
      console.log(website);
      const { page } = (await client.cache.readQuery({
        query: queries.LOCAL_SELECTED_PAGE
      })) as LooseObject;
      const {
        data: { pages }
      } = (await client.query({
        query: queries.PAGE_LIST,
        variables: { website }
      })) as LooseObject;

      // tslint:disable-next-line:no-console
      console.log('EDITOR START', language, website, page, pages);

      const pa = pages.find((p: LooseObject) => {
        if (p.id === page) {
          return true;
        }

        return false;
      });

      const trans = pa.translations.find((t: LooseObject) => {
        if (t.language.id === language) {
          return true;
        }

        return false;
      });

      if (!trans) {
        return;
      }
      // Page Translation ID
      const ptid = trans.id;
      this.setState({
        pageId: ptid
      });
      this.startEditPage(ptid);
    })();
  }

  public componentWillUnmount() {
    // Remove listener from socket
    socket.removeListener('composer/update');
    this.debug('WillUnmount');
    this.props.resetPageId();

    // Inform server about stop editing
    socket
      .emit('composer/stop-edit-page', {
        pageId: this.state.pageId
      })
      .once('composer/stop-edit-page', (response: StandardResponse) => {
        if (response.status !== 'success') {
          this.debug('Event StopEditPage failed with message', response.message);
        }

        this.debug('Event StopEditPage was successfull');
      });
  }

  handleSave(data: LooseObject) {
    this.props.cancel();
    // this.props.save(data.content);
  }

  handleToggleDisplayTaskAndChat() {
    this.setState({ taskAndChatHidden: !this.state.taskAndChatHidden });
  }

  componentWillReceiveProps(nextProps: Properties) {
    (async () => {
      if (nextProps.languageId !== this.props.languageId) {
        this.props.prepareForComposer();
      }

      if (this.props.content !== nextProps.content) {
        // await this.composer.setContent(nextProps.content as ComponentObject[]);
        // await this.composer.setContent(nextProps.content as IContent);
      }
      if (this.props.name !== nextProps.name) {
        await this.composer.setName(nextProps.name);
      }
    })();
  }

  handleEvent(name: string, data: LooseObject): void {
    // tslint:disable-next-line:no-console
    console.log('Handled event ' + name, data);
  }

  activator() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(false);
      }, 1000);
    }) as Promise<boolean>;
  }

  nevim() {
    this.composer.addComponent(
      {
        data: {},
        name: 'Dummy',
        position: -1
      },
      true
    );
  }

  public render() {
    let editors = [] as EditorInfo[];
    this.state.editors.forEach((id: string) => {
      let name = undefined as string;
      if (id === socket.id) {
        name = 'Me';
      }

      editors.push({
        id,
        name
      });
    }, this);

    return (
      <>
        <Composer
          onSave={this.handleSave}
          onCancel={this.props.cancel}
          ref={node => (this.composer = node)}
          onComponentStartEditing={this.props.startEditing}
          onComponentStopEditing={this.props.stopEditing}
          componentService={ComponentsService}
          pluginService={PluginService}
          onComponentAdded={data => this.handleEvent('onComponentAdded', data)}
          onComponentTryAdd={data => this.handleEvent('onComponentTryAdd', data)}
          editors={editors}
          me={socket.id}
          locks={this.state.locks}
          activateComponentStartEdit={this.activatorStartEditComponent}
          activateComponentStopEdit={this.activatorStopEditComponent}
          activateComponentAdd={this.activatorAddComponent}
          activateComponentUpdate={this.activatorUpdateComponent}
          activateComponentMove={this.activatorMoveComponent}
          activateComponentRemove={this.activatorRemoveComponent}
          activateCommit={this.activatorCommit}
          toggleChatAndTask={this.handleToggleDisplayTaskAndChat}
        />
        <PageIdsQuery>
          {({ page, pageTranslation }: PageIdsQueryVars) => (
            <ChatTasks
              page={page}
              pageTranslation={pageTranslation}
              taskAndChatHidden={this.state.taskAndChatHidden}
              handleToggleDisplayTaskAndChat={this.handleToggleDisplayTaskAndChat}
            />
          )}
        </PageIdsQuery>
      </>
    );
  }

  /**
   * Handle newEditors update from socket server
   *
   * @param {LooseObject} data from server
   * @return {void}
   */
  private handleNewEditors(data: LooseObject): void {
    const { pageId, editors } = data;

    this.setState({
      editors
    });
  }

  /**
   * Handle newLock update from socket server
   *
   * @param {LooseObject} data from server
   * @return {void}
   */
  private handleNewLocks(data: LooseObject): void {
    const { pageId, locks } = data;

    if (locks === undefined || locks === null) {
      this.setState({
        locks: []
      });
      return;
    }
    let locksNew = locks
      .map((o: LooseObject) => {
        return {
          id: o.component,
          editorId: o.client
        };
      })
      .filter((o: LooseObject) => {
        if (o.editorId === null) {
          return false;
        }
        return true;
      });
    this.setState({
      locks: locksNew
    });
  }

  /**
   * Handle addComponent update from socket server
   *
   * @param {LooseObject} data from server
   * @return {void}
   */
  private handleAddComponent(data: LooseObject): void {
    const { pageId, component, who, positionMap } = data;

    // If this update has different pageId
    if (this.state.pageId !== pageId) {
      return;
    }
    this.composer.addComponent(component as AddComponentObject, true);
  }

  /**
   * Handle moveComponent update from socket server
   *
   * @param {LooseObject} data from server
   * @return {void}
   */
  private handleMoveComponent(data: LooseObject): void {
    const { pageId, componentId, position, positionMap } = data;

    // If this update has different pageId
    if (this.state.pageId !== pageId) {
      return;
    }
    this.composer.updatePositions(positionMap, true);
  }

  /**
   * Handle updateComponent update from socket server
   *
   * @param {LooseObject} payload data from server
   * @return {void}
   */
  private handleUpdateComponent(payload: LooseObject): void {
    const { pageId, componentId, who, data } = payload;

    // If this update has different pageId
    if (this.state.pageId !== pageId) {
      return;
    }
    this.composer.updateComponent(componentId, data, true);
  }

  /**
   * Handle removeComponent update from socket server
   *
   * @param {LooseObject} data from server
   * @return {void}
   */
  private handleRemoveComponent(data: LooseObject): void {
    const { pageId, componentId, who, positionMap } = data;

    // If this update has different pageId
    if (this.state.pageId !== pageId) {
      return;
    }
    this.composer.removeComponent(componentId, true);
  }

  // activatorStartEditComponent
  private activatorStartEditComponent(id: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/start-edit-component', {
          pageId: this.state.pageId,
          componentId: id
        })
        .once('composer/start-edit-component', (response: StandardResponse) => {
          // tslint:disable-next-line:no-console
          console.log('StartEditComponent Succe');
          if (response.status !== 'success') {
            this.debug('Event StartEditComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }
  // activatorStopEditComponent
  private activatorStopEditComponent(id: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/stop-edit-component', {
          pageId: this.state.pageId,
          componentId: id
        })
        .once('composer/stop-edit-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event StopEditComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }
  // activatorAddComponent
  private activatorAddComponent(data: AddComponentObject): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/add-component', {
          pageId: this.state.pageId,
          component: data
        })
        .once('composer/add-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event AddComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }
  // activatorMoveComponent
  private activatorMoveComponent(id: number, position: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/move-component', {
          pageId: this.state.pageId,
          componentId: id,
          position
        })
        .once('composer/move-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event MoveComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }
  // activatorUpdateComponent
  private activatorUpdateComponent(id: number, data: ComponentObject): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/update-component', {
          pageId: this.state.pageId,
          componentId: id,
          data
        })
        .once('composer/update-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event UpdateComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }
  // activatorRemoveComponent
  private activatorRemoveComponent(id: number): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/remove-component', {
          pageId: this.state.pageId,
          componentId: id
        })
        .once('composer/remove-component', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event RemoveComponent failed with message', response.message);
            resolve(false);
            return;
          }

          resolve(true);
        });
    });
  }

  private activatorCommit(data: LooseObject): Promise<boolean> {
    return new Promise(resolve => {
      socket
        .emit('composer/commit', {
          pageId: this.state.pageId,
          data,
        })
        .once('composer/commit', (response: StandardResponse) => {
          if (response.status !== 'success') {
            this.debug('Event Commit failed with message', response.message);
            resolve(false);
            return;
          }

          // Check for updates
          if (response.payload.updates && response.payload.updates.length > 0) {
            // Perform update
            this.composer.update(response.payload.updates);
          }

          resolve(true);
        });
    });
  }

  /**
   * Simple method to start edit page on sockets. This method will
   * inform server about start page editing and also get data from
   * server to push it into composer and init it.
   *
   * @return {void}
   */
  private startEditPage(pageId: string): void {
    this.debug('Called StartEditPage', pageId);
    if (pageId === undefined || pageId === null) {
      return;
    }
    // Stop edit page (just for sure)
    socket
      .emit('composer/stop-edit-page', {
        pageId
      })
      .once('composer/stop-edit-page', (response: StandardResponse) => {
        if (response.status !== 'success') {
          this.debug('Event StopEditPage failed with message', response.message);
          return;
        }

        // Just call start-edit-page event to sockets
        socket
          .emit('composer/start-edit-page', {
            pageId
          })
          .once('composer/start-edit-page', this.handleStartEditPage);
      });
  }

  /**
   * Handler for server response to start edit page
   *
   * @param {StandardResponse} response from server
   * @return {void}
   */
  private handleStartEditPage(response: StandardResponse): void {
    if (response.status !== 'success') {
      this.debug('Event StartEditPage failed with message', response.message);
      return;
    }

    this.debug('Event StartEditPage', response);

    // Call server for informations and load them
    socket
      .emit('composer/get-page', {
        pageId: this.state.pageId
      })
      .once('composer/get-page', this.handleGetPage);
  }

  /**
   * Handler for server response to get page data
   *
   * @param {StandardResponse} response from server
   * @return {void}
   */
  private handleGetPage(response: StandardResponse): void {
    if (response.status !== 'success') {
      this.debug('Event GetPage failed with message', response.message);
      return;
    }

    this.debug('Event GetPage', response);
    const page = response.payload;

    // Prepare locks from page
    let locks = [] as LockInfo[];
    const keys = Object.keys(page.locks);
    keys.forEach((key: string) => {
      if (page.locks[key]) {
        locks.push({ id: Number(key), editorId: page.locks[key] });
      }
    }, this);

    this.setState(
      {
        editors: page.editors,
        locks
      },
      () => {
        // tslint:disable-next-line:no-console
        console.log('From server,', page.content, page.delta);
        (async () => {
          await this.composer.setContent(page.content);
          await this.composer.importDelta(page.delta);
        })();
        // if (page.content && page.content.id === 'root') {
        // }
        // if (page.delta && page.delta.length > 0) {
        // }
      }
    );
  }

  /**
   * Simple debug message
   *
   * @param {any[]} args arguments for message
   * @return {void}
   */
  // tslint:disable-next-line:no-any
  private debug(...args: any[]): void {
    if (this.DEBUG) {
      // tslint:disable-next-line:no-console
      console.log('[EDITOR]', ...args);
    }
  }

  /**
   * Simple helper to debug handled event
   *
   * @param {string} name of event
   * @param {LooseObject} data of event
   * @return {void}
   */
  private debugHandler(name: string, data: LooseObject): void {
    this.debug(`Handled ${name} event with payload`, data);
  }
}

export default Editor;
