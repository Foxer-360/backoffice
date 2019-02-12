import { Input, Mention } from 'antd';
import * as React from 'react';

const { toString } = Mention;

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IMyInputProps {
  type?: string | 'text';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string;
  placeholder?: string;
  onChange: (e: LooseObject) => void;
  schemaPaths?: Array<string>;
}

export default class MyInput extends React.Component<IMyInputProps> {

  public onMentionChange = (contentState: LooseObject) => {
    this.props.onChange({ target: { name: this.props.name, value: toString(contentState) } });
  }
  public render() {

    const { schemaPaths } = this.props;

    if (schemaPaths && schemaPaths.length > 0) {
      return (
        <div style={{ paddingBottom: '5px' }}>
          {this.props.notitle && this.props.notitle === true ? null
            : <label>{this.props.label}</label>}
          <Mention
            // type={this.props.type}
            // name={this.props.name}
            {...((this.props.type === 'number' && {pattern: '[0-9]*'}) || {})}
            defaultValue={this.props.value}
            defaultSuggestions={schemaPaths}
            placeholder={this.props.placeholder}
            onChange={this.onMentionChange}
            prefix={'%'}
          />
        </div>
      );
    }
    return (
      <div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null
          : <label>{this.props.label}</label>}
        <Input
          type={this.props.type}
          name={this.props.name}
          {...((this.props.type === 'number' && {pattern: '[0-9]*'}) || {})}
          defaultValue={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}
