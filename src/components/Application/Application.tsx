import { Button } from 'antd';
import * as React from 'react';
import { Route, Switch } from 'react-router';
import { RouterAction } from 'react-router-redux';

import { getAccessToken, isLoggedIn, login, logout } from '../../services/auth';
import Selector from '../../scenes/Selector';
import Layout from '../Layout';
import Test from '@source/scenes/Test';
import { updateUserProfileInState } from './auth';
import { UserProfile } from '@source/contexts';
import { IUserProfileProperties } from '@source/contexts/UserProfile';

const { Component } = React;

interface Properties {
  logoutCallback: () => RouterAction;
}

interface State {
  loading: boolean;
  loaded: boolean;
  profile: IUserProfileProperties | null;
}

class Application extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      loaded: false,
      loading: false,
      profile: null,
    };

    this.handleUpdateProfile = this.handleUpdateProfile.bind(this);
  }

  componentDidMount() {
    if (!isLoggedIn()) {
      return;
    }
    if (!this.state.loading && !this.state.loaded) {
      const loading = updateUserProfileInState(this.state, this.handleUpdateProfile);
      if (loading) {
        this.setState({
          loading
        });
      }
    }
  }

  componentDidUpdate() {
    if (!isLoggedIn()) {
      return;
    }
    if (!this.state.loading && !this.state.loaded) {
      const loading = updateUserProfileInState(this.state, this.handleUpdateProfile);
      if (loading) {
        this.setState({
          loading
        });
      }
    }
  }

  handleUpdateProfile(profile: IUserProfileProperties | null) {
    this.setState({
      loading: false,
      loaded: true,
      profile
    });
  }

  render() {
    if (!isLoggedIn()) {
      login();
      return <div />;
    }

    const style = {
      background: '#222',
      textAlign: 'center',
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0, left: 0,
      paddingTop: '10%',
    } as React.CSSProperties;

    if (this.state.loading) {
      return (
        <div style={style}>
          <h1 style={{ color: 'white' }}>Loading...</h1>
        </div>
      );
    }

    if (!this.state.profile) {
      return (
        <div style={style}>
          <h1 style={{ color: 'white', marginBottom: '64px' }}>You are not assigned to this Client</h1>
          <Button type="primary" onClick={() => logout(this.props.logoutCallback)}>ReLogin</Button>
        </div>
      );
    }

    return (
      <UserProfile.Provider value={this.state.profile}>
        <Switch>
          <Route path="/selector" component={Selector} />
          <Route path="/test" component={Test} />
          <Route path="" component={Layout} />
        </Switch>
      </UserProfile.Provider>
    );
  }

}

export default Application;
