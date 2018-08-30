import * as React from 'react';
import TextArea from 'antd/es/input/TextArea';

interface MyTextAreaProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange: (e: React.ChangeEvent<Element>) => void;
}

export default class MyTextArea extends React.Component<MyTextAreaProps> {
  render() {
    return (
      <div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null
          : <label>{this.props.label}</label>}

        <TextArea
          name={this.props.name}
          defaultValue={this.props.value}
          placeholder={this.props.placeholder}
          rows={this.props.rows ? this.props.rows : 5}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}