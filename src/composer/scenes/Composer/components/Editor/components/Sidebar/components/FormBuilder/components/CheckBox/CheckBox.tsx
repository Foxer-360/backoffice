import { Checkbox } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IMyCheckBoxProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: boolean;
  placeholder?: string;
  // tslint:disable-next-line:no-any
  onChange: (e: any) => void;
}

export default class MyCheckBox extends React.Component<IMyCheckBoxProps> {

  // tslint:disable-next-line:no-any
  public handleChange = (e: any) => {
    this.props.onChange({ target: { name: this.props.name, value: e.target.checked } });
  }

  public render() {
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
