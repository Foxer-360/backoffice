import * as React from 'react';
import { Checkbox } from 'antd';

interface MyCheckBoxProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: boolean;
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: any) => void;
}

export default class MyCheckBox extends React.Component<MyCheckBoxProps> {

  // tslint:disable-next-line:no-any
  handleChange = (e: any) => {
    this.props.onChange({ target: { name: this.props.name, value: e.target.checked } });
  }

  render() {
    return (
      <div style={{ paddingBottom: '5px' }}>
        <Checkbox
          checked={this.props.value}
          // tslint:disable-next-line:no-any
          onChange={(e: any) => this.handleChange(e)}
        >
          {this.props.label}
        </Checkbox>
      </div>
    );
  }
}