import * as React from 'react';
import { Icon, Menu } from 'antd';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { client } from '@source/services/graphql';
import { Query } from 'react-apollo';

import './sidebar.scss';
import TagsFilter from '@source/components/TagsFilter';

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
  openedKey: Array<string>;
}

const SELECT_TAG_ID = gql`{
  tag @client
}`;

const DATASOURCES = gql`{
  datasources {
    id
    type
    displayInNavigation
  }
}`;

class Sidebar extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      selectedKey: ['home'],
      openedKey: []
    };
  }

  getSelectedKeysFromPath(path: string, search: string) {
    let key = '';

    if (search.includes('tag')) { return ['tagged-pages']; }

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
      case '/inquiries':
        key = 'inquiries';
        break;
      default:
        key = 'home';
        break;
    }

    return [key];
  }

  getOpenedKeys(search: string) {
    return search.includes('tag') ? ['tagged-pages'] : [];
  }

  componentDidMount() {
    this.setState({
      selectedKey: this.getSelectedKeysFromPath(this.props.location.pathname, this.props.location.search),
      openedKey: this.getOpenedKeys(this.props.location.search)
    });
  }

  componentWillReceiveProps(nextProps: Properties) {
    if (this.props.location.pathname === nextProps.location.pathname) {
      return;
    }
    this.setState({
      selectedKey: this.getSelectedKeysFromPath(nextProps.location.pathname, this.props.location.search),
      openedKey: this.getOpenedKeys(this.props.location.search)
    });
  }

  render() {
    return (
      <Query query={DATASOURCES}>{({ data, loading, error }) => {
        if (loading) { return 'loading...'; }
        if (error) { return 'error...'; }

        const { datasources } = data; 

        return (<>
          <div className={'sidebar-head'}>
            <h2>{this.props.collapsed && 'BO' || 'BackOffice'}</h2>
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={this.state.selectedKey} openKeys={this.state.openedKey}>
            <Item key="home">
              <Icon type="home" />
              <Link to="/">Home</Link>
            </Item>
            <Item key="pages/pages?tag=null`">
              <Icon type="database" />
              <Link 
                onClick={() => {
                  client.cache.writeQuery({
                    query: SELECT_TAG_ID,
                    data: {
                      tag: null
                    }
                  });
                }} 
                to="/pages"
              >
                Pages
              </Link>
            </Item>
            <Item key="subscribers">
              <Icon type="usergroup-add" />
              <Link to="/subscribers">Subscribers</Link>
            </Item>
            <Item key="inquiries">
              <Icon type="usergroup-add" />
              <Link to="/inquiries">Inquiries</Link>
            </Item>
            <Item key="settings">
              <Icon type="tool" />
              <Link to="/settings">Settings</Link>
            </Item>
            {datasources.filter(({ displayInNavigation }) => displayInNavigation).map((datasource) => (<Item key={datasource.type}>
                <Icon type="tool" />
                <Link to={`/datasource-items/${datasource.id}`}>{datasource.type}</Link>
              </Item>))}
          </Menu>
          <TagsFilter filteredTags={true} />
        </>);
      }}</Query>
    );
  }

}

export default Sidebar;