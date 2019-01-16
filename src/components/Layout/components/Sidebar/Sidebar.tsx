import * as React from 'react';
import { Icon, Menu } from 'antd';
import { Link } from 'react-router-dom';

import './sidebar.scss';

const { Component } = React;
const { Item } = Menu;

export interface Properties {
  // tslint:disable-next-line:no-any
  match: any;
  // tslint:disable-next-line:no-any
  history: any;
  // tslint:disable-next-line:no-any
  location: any;
  collapsed: boolean;
}

export interface State {
  selectedKey: Array<string>;
}

class Sidebar extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      selectedKey: ['home']
    };
  }

  getSelectedKeysFromPath(path: string) {
    let key = '';

    switch (path) {
      case '/page':
      case '/pages':
        key = 'pages';
        break;
      case '/settings':
        key = 'settings';
        break;
      case '/subscribers':
        key = 'subscribers';
        break;
      default:
        key = 'home';
        break;
    }

    return [key];
  }

  componentDidMount() {
    this.setState({
      selectedKey: this.getSelectedKeysFromPath(this.props.location.pathname)
    });
  }

  componentWillReceiveProps(nextProps: Properties) {
    if (this.props.location.pathname === nextProps.location.pathname) {
      return;
    }
    this.setState({
      selectedKey: this.getSelectedKeysFromPath(nextProps.location.pathname)
    });
  }

  render() {
    return (
      <>
        <div className={'sidebar-head'}>
          <h2>{this.props.collapsed && 'BO' || 'BackOffice'}</h2>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={this.state.selectedKey}>
          <Item key="home">
            <Icon type="home" />
            <Link to="/">Home</Link>
          </Item>
          <Item key="pages">
            <Icon type="database" />
            <Link to="/pages">Pages</Link>
          </Item>
          <Item key="subscribers">
            <Icon type="usergroup-add" />
            <Link to="/subscribers">Subscribers</Link>
          </Item>
          <Item key="settings">
            <Icon type="tool" />
            <Link to="/settings">Settings</Link>
          </Item>
        </Menu>
      </>
    );
  }

}

export default Sidebar;