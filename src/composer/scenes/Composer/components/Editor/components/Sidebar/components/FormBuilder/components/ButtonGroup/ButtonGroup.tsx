import { Radio } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IMyButtonGroupOption {
  [key: string]: string;
}

interface IMyButtonGroupProps {
  label: string;
  notitle?: boolean;
  name: string;
  value?: string | number | null;
  placeholder?: string;
  options: IMyButtonGroupOption[];
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent<Element> | any) => void;
}

export default class ButtonGroup extends React.Component<IMyButtonGroupProps, {}> {

  constructor(props: IMyButtonGroupProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  // tslint:disable-next-line:no-any
  public handleChange(e: any) {
    this.props.onChange({ target: { name: this.props.name, value: e.target.value } });
  }

  public render() {
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
