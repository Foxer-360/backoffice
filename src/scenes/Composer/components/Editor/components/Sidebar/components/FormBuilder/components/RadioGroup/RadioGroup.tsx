import * as React from 'react';
import { Radio } from 'antd';

export interface MyRadioGroupOption {
  [key: string]: string;
}

interface MyRadioGroupProps {
  label: string;
  notitle?: boolean;
  name: string;
  value?: string | number | null;
  placeholder?: string;
  options: MyRadioGroupOption[];
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class RadioGroup extends React.Component<MyRadioGroupProps> {

  constructor(props: MyRadioGroupProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  handleChange(e: any) {
    this.props.onChange({ target: { name: this.props.name, value: e.target.value } });
  }

  render() {
    const { options } = this.props;

    if (!options) {
      return null;
    }

    return (
      <div style={{ paddingBottom: '5px' }}>
        {this.props.notitle && this.props.notitle === true ? null
          : <div><label>{this.props.label}</label></div>}

        <Radio.Group onChange={this.handleChange} defaultValue={this.props.value}>
          {Object.keys(options).map((key: string, index: number) => (
            <Radio key={index} value={key}>
              {options[key]}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    );
  }
}