import * as React from 'react';
import { Spin } from 'antd';

const { Component } = React;

export interface Properties {}

export interface State {
  isSpinning: boolean;
}

class Spinner extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      isSpinning: false
    };
  }

  public enable(): void {
    this.setState({
      isSpinning: true
    });
  }

  public disable(): void {
    this.setState({
      isSpinning: false
    });
  }

  public render() {
    return (
      <Spin
        spinning={this.state.isSpinning}
        tip="Processing..."
        size="large"
        delay={100}
      >
        {this.props.children}
      </Spin>
    );
  }

}

export default Spinner;
