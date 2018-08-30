import * as React from 'react';
import './style.css';

const { Component } = React;

export interface Properties {
  delay?: number; // Delay in ms
}

export interface State {
  hidden: boolean;
}

class DelayComponent extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      hidden: true,
    };
  }

  public componentWillMount() {
    if (!this.props.delay) {
      this.setState({
        hidden: false,
      });
      return;
    }

    setTimeout(() => {
      this.setState({
        hidden: false,
      });
    }, this.props.delay);
  }

  public render() {
    let className = 'delay-component';
    if (this.state.hidden) {
      className += ' hide';
    }

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }

}

export default DelayComponent;
