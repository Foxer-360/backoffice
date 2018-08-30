import * as React from 'react';
import { Layout as AntdLayout } from 'antd';
import { Route, Switch } from 'react-router';

import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Pages from '@source/scenes/Pages';
import Settings from '@source/scenes/Settings';
import Home from '@source/scenes/Home';

const { Component } = React;
const { Sider } = AntdLayout;

export interface Properties {
  path?: LooseObject;
}

// tslint:disable-next-line:no-any
const Wrapped = (Comp: any, withoutBackground?: boolean): any => {
  if (!withoutBackground) {
    return () => <Content color="white"><Comp /></Content>;
  }

  return () => <Content color="none"><Comp /></Content>;
};

class Layout extends Component<Properties, {}> {

  render() {
    return (
      <AntdLayout style={{ minHeight: '100vh' }}>
        <Sider>
          <Sidebar />
        </Sider>
        <AntdLayout>
          <Header path={this.props.path} />
          <Switch>
            <Route path="/pages" render={Wrapped(Pages)} />
            <Route path="/page" render={Wrapped(Pages, true)} />
            <Route path="/settings" render={Wrapped(Settings)} />
            <Route path="/" exact={true} render={Wrapped(Home)} />
          </Switch>
          <Footer />
        </AntdLayout>
      </AntdLayout>
    );
  }

}

export default Layout;
