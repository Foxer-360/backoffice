import { Select } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IMySelectOption {
  [key: string]: string;
}

interface IMySelectProps {
  type?: 'select' | 'multiselect' | 'enum';
  label: string;
  notitle?: boolean;
  name: string;
  value?: string | string[];
  placeholder?: string;
  options: IMySelectOption[];
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class MySelect extends React.Component<IMySelectProps> {
  constructor(props: IMySelectProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  public handleChange(value: string | any, option: React.ReactElement<any> | Array<React.ReactElement<any>>) {
    this.props.onChange({ target: { name: this.props.name, value } });
  }

  public render() {
    const { options } = this.props;

    return (
      <div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null : <label>{this.props.label}</label>}

        <Select defaultValue={this.props.value} placeholder={this.props.placeholder} onSelect={this.handleChange}>
          {Object.keys(options).map((key: string, index: number) => {
            return (
              <Select.Option key={index.toString()} value={key}>
                {options[key]}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    );
  }
}
