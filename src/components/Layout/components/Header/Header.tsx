import * as React from 'react';
import { Breadcrumb, Button, Icon, Layout, Select } from 'antd';
import { logout } from '../../../../services/auth';
import { RouterAction } from 'react-router-redux';
import LanguageSelector from './components/LanguageSelector';

const { Component } = React;
const AntdHeader = Layout.Header;
const { Item } = Breadcrumb;

export interface Properties {
  path?: LooseObject;
  project: LooseObject;
  website: LooseObject;

  logoutCallback: () => RouterAction;
  goToSelector: () => RouterAction;
}

export interface State {
  projectName: string | null;
  websiteName: string | null;
  navigationName: string | null;
}

class Header extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    let pName = null;
    let wName = null;
    let navName = this.getNavigationNameFromPath(props.path);

    if (props.project && props.project.name) {
      pName = props.project.name;
    }

    if (props.website && props.website.title) {
      wName = props.website.title;
    }

    this.state = {
      projectName: pName,
      websiteName: wName,
      navigationName: navName
    };
  }

  componentWillReceiveProps(nextProps: Properties) {
    let change = false;
    let pName = this.state.projectName;
    let wName = this.state.websiteName;
    let navName = this.getNavigationNameFromPath(nextProps.path);

    if (nextProps.project && nextProps.project.name) {
      if (nextProps.project.name !== pName) {
        pName = nextProps.project.name;
        change = true;
      }
    }

    if (nextProps.website && nextProps.website.title) {
      if (nextProps.website.title !== wName) {
        wName = nextProps.website.title;
        change = true;
      }
    }

    if (navName !== this.state.navigationName) {
      change = true;
    }

    if (change) {
      this.setState({
        ...this.state,
        projectName: pName,
        websiteName: wName,
        navigationName: navName
      });
    }
  }

  getNavigationNameFromPath(path: LooseObject) {
    let name = null;

    switch (path.select) {
      case 'page':
        name = 'Page Editing';
        break;
      case 'pages':
        name = 'Pages';
        break;
      case 'settings':
        name = 'Settings';
        break;
      default:
        name = 'Dashboard';
        break;
    }

    return name;
  }

  render() {
    return (
      <AntdHeader style={{ paddingLeft: '29px' }}>
        <div style={{ float: 'left' }}>
        <Breadcrumb style={{ marginTop: '20px' }}>
          { this.state.projectName ?
            <Item>
              <Icon type="book" />
              <span>{this.state.projectName}</span>
            </Item>
            : null
          }
          { this.state.websiteName ?
            <Item>
              <Icon type="profile" />
              <span>{this.state.websiteName}</span>
            </Item>
            : null
          }
          { this.state.navigationName ?
            <Item>
              <span>{this.state.navigationName}</span>
            </Item>
            : null
          }
        </Breadcrumb>
        </div>
        <div style={{ float: 'right' }}>
          <LanguageSelector />
          <Button
            onClick={() => this.props.goToSelector()}
            type="primary"
            style={{ marginRight: '12px' }}
          >
            Selector
          </Button>
          <Button onClick={() => logout(this.props.logoutCallback)} type="danger">Logout</Button>
        </div>
      </AntdHeader>
    );
  }

}

export default Header;
