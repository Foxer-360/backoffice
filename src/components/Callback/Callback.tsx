import * as React from 'react';
import { RouterAction } from 'react-router-redux';

import { setSession, getError } from '../../services/auth';

const { Component } = React;

interface Properties {
  goHome: () => RouterAction;
}

interface State {
  error: string | null;
}

class Callback extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      error: null,
    };
  }

  async componentDidMount() {
    const err = getError();
    if (err) {
      // tslint:disable-next-line:no-console
      console.log('Login Error', err);

      this.setState({
        error: err,
      });
      return;
    }
    await setSession();

    this.props.goHome();
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <span>There is error with Auth0 service</span><br />
          <span>Type: <strong>{this.state.error}</strong></span><br />
          <span>Try to check Auth0 Audience in config, maybe you have / at the end of url...</span>
        </div>
      );
    }
    return <div />;
  }

}

export default Callback;
