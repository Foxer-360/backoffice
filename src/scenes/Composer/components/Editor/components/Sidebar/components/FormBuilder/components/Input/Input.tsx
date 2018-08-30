import * as React from 'react';
import { Input } from 'antd';

interface MyInputProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<Element>) => void;
}

export default class MyInput extends React.Component<MyInputProps> {
  render() {
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