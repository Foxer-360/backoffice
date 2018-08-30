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
        <h2 className="sidebar-head">
          BackOffice
        </h2>
        <Menu theme="dark" mode="inline" selectedKeys={this.state.selectedKey}>
          <Item key="home">
            <Link to="/"><Icon type="home" />Home</Link>
          </Item>
          <Item key="pages">
            <Link to="/pages"><Icon type="database" />Pages</Link>
          </Item>
          <Item key="settings">
              <Link to="/settings"><Icon type="tool" />Settings</Link>
            </Item>
        </Menu>
      </>
    );
  }

}

export default Sidebar;
