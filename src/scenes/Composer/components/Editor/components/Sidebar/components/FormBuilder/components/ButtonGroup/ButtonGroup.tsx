import * as React from 'react';
import { Radio } from 'antd';

export interface MyButtonGroupOption {
  [key: string]: string;
}

interface MyButtonGroupProps {
  label: string;
  notitle?: boolean;
  name: string;
  value?: string | number | null;
  placeholder?: string;
  options: MyButtonGroupOption[];
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class ButtonGroup extends React.Component<MyButtonGroupProps> {

  constructor(props: MyButtonGroupProps) {
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

        <Radio.Group onChange={this.handleChange} defaultValue={this.props.value} buttonStyle="solid">
          {Object.keys(options).map((key: string, index: number) => (
            <Radio.Button key={index} value={key}>
              {options[key]}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
    );
  }
}