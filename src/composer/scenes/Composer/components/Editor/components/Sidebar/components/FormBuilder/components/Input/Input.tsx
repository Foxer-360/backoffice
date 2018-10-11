import { Input } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IMyInputProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<Element>) => void;
}

export default class MyInput extends React.Component<IMyInputProps> {
  public render() {
    return (
      <div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null
          : <label>{this.props.label}</label>}

        <Input
          type={this.props.type}
          name={this.props.name}
          defaultValue={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}
