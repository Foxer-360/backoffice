import * as React from 'react';
import { Select } from 'antd';

export interface MySelectOption {
  [key: string]: string;
}

interface MySelectProps {
  type?: 'select' | 'multiselect' | 'enum';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string | string[];
  placeholder?: string;
  options: MySelectOption[];
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class MySelect extends React.Component<MySelectProps> {

  constructor(props: MySelectProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  handleChange(value: string, option: React.ReactElement<any> | React.ReactElement<any>[]) {
    this.props.onChange({ target: { name: this.props.name, value: value } });
  }

  render() {
    const { options } = this.props;

    return (
      <div style={{ paddingBottom: '5px' }}>
      {this.props.notitle && this.props.notitle === true ? null
        : <label>{this.props.label}</label>}

        <Select
          defaultValue={this.props.value}
          placeholder={this.props.placeholder}
          onSelect={this.handleChange}
        >
          {Object.keys(options).map((key: string, index: number) => {
            return (
              <Select.Option
                key={index}
                value={key}
              >
                {options[key]}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    );
  }
}