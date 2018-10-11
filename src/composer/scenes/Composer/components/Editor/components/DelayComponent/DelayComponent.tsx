import * as React from 'react';
// import './style.css';

export interface IProperties {
  delay?: number; // Delay in ms
}

export interface IState {
  hidden: boolean;
}

class DelayComponent extends React.Component<IProperties, IState> {

  constructor(props: IProperties) {
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
