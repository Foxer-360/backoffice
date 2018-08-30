import * as React from 'react';
import { Input } from 'antd';

const { Component } = React;

interface Properties {
  onChange: (data: LooseObject) => void;
  initData: LooseObject;
}

interface State {
  name: string;
}

class Test extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    let name = '';
    if (props.initData && props.initData.name) {
      name = props.initData.name;
    }

    this.state = {
      name
    };
  }

  public render() {
    return (
      <div>
        <h4>Test Plugin</h4>
        <span>This is just a dummy plugin for test purposes. There is nothing to change yet.</span>
      </div>
    );
  }

  private handleChange(value: string) {
    if (this.props.onChange) {
      this.props.onChange({ name: value });
    }

    this.setState({
      ...this.state,
      name: value
    });
  }

}

export default Test;
