import * as React from 'react';
import { Route, Switch } from 'react-router';
import { RouterAction } from 'react-router-redux';

import { isLoggedIn, login, logout } from '../../services/auth';
import Selector from '../../scenes/Selector';
import Layout from '../Layout';
import Test from '@source/scenes/Test';

const { Component } = React;

interface Properties {
  logoutCallback: () => RouterAction;
}

class Application extends Component<Properties, {}> {

  constructor(props: Properties) {
    super(props);
  }

  render() {
    if (!isLoggedIn()) {
      login();
      return <div />;
    }

    return (
      <Switch>
        <Route path="/selector" component={Selector} />
        <Route path="/test" component={Test} />
        <Route path="" component={Layout} />
      </Switch>
    );
  }

}

export default Application;
