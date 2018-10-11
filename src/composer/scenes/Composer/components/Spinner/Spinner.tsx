import { Spin } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IState {
  isSpinning: boolean;
}

class Spinner extends React.Component<{}, IState> {

  constructor(props: {}) {
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
