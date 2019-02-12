import * as React from 'react';
import { Layout as AntdLayout } from 'antd';
import { Route, Switch } from 'react-router';

import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Subscribers from '@source/scenes/Subscribers';
import Inquiries from '@source/scenes/Inquiries';
import Pages from '@source/scenes/Pages';
import Settings from '@source/scenes/Settings';
import Home from '@source/scenes/Home';
import DatasourceDetail from '@source/scenes/Settings/components/Datasources/components/DatasourceDetail';
import DatasourceItem from '@source/scenes/Settings/components/Datasources/components/DatasourceItem';
import DatasourceItems from '@source/scenes/Settings/components/Datasources/components/DatasorceItems';

const { Component } = React;
const { Sider } = AntdLayout;

export interface Properties {
  path?: LooseObject;
}

// tslint:disable-next-line:no-any
const Wrapped = (Comp: any, withoutBackground?: boolean, ...rest): any => {
  if (!withoutBackground) {
    return () => (
      <Content color="white">
        <Comp />
      </Content>
    );
  }

  return () => (
    <Content color="none">
      <Comp />
    </Content>
  );
};

export interface State {
  collapsed: boolean;
}

class Layout extends Component<Properties, State> {
  
  constructor(props: Properties) {
    super(props);

    this.state = {
      collapsed: false,
    };
  }

  onCollapse = (collapsed) => this.setState({ collapsed });

  render() {
    return (
      <AntdLayout style={{ minHeight: '100vh' }}>
    
        <Sider collapsible={true} collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <Sidebar collapsed={this.state.collapsed} />
        </Sider>
        <AntdLayout>  
          <Header path={this.props.path} />
          <Switch>
            <Route path="/pages" render={Wrapped(Pages)} />
            <Route path="/page" render={Wrapped(Pages, true)} />
            <Route path="/settings/:section" render={Wrapped(Settings)} />
            <Route path="/settings" render={Wrapped(Settings)} />
            <Route path="/subscribers" render={Wrapped(Subscribers)} />
            <Route path="/inquiries" render={Wrapped(Inquiries)} />
            <Route path="/datasource/:id" render={Wrapped(DatasourceDetail)} />
            <Route path="/datasource-items/:id" render={Wrapped(DatasourceItems)} />
            <Route path="/datasource-item/:datasourceId/:datasourceItemId" render={Wrapped(DatasourceItem)} />
            <Route path="/" exact={true} render={Wrapped(Home, true)} />
          </Switch>
          <Footer />
        </AntdLayout>
      </AntdLayout>
    );
  }
}

export default Layout;
