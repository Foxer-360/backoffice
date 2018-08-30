import * as React from 'react';
import { Tabs } from 'antd';
import Section from '../Section';
import { FormSchema } from '../../FormBuilder';
import InputRenderer from '../InputRenderer';

interface ArrayInputsProps {
  title: string;
  name: string;
  data: Array<LooseObject>;
  items: FormSchema;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent | any) => void;
}

interface ArrayInputsState {
  activeTab: number;
}

class ArrayInputs extends React.Component<ArrayInputsProps, ArrayInputsState> {

  constructor(props: ArrayInputsProps) {
    super(props);

    this.state = {
      activeTab: 0,
    };

    this.onChange = this.onChange.bind(this);
  }

  onChangeTab(key: string) {
    this.setState({
      activeTab: parseInt(key, 10),
    });
  }

  onEditTab(targetKey: string, action: string) {
    const iKey = parseInt(targetKey, 10);
    let newData = [...this.props.data];
    let newTab = this.state.activeTab;

    // add new tab
    if (action === 'add') {
      newData.push({});
      newTab = newData.length - 1;
    }

    // remove tab
    if (action === 'remove') {
      newData.splice(iKey, 1);

      if (newTab > iKey || iKey === newTab) {
        newTab = newTab - 1;
      }
      if (newTab < 0) {
        newTab = 0;
      }
    }

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      }
    });

    this.setState({ activeTab: newTab });
  }

  // tslint:disable-next-line:no-any
  onChange(key: any) {
    let newData = [...this.props.data];
    newData[this.state.activeTab][key.target.name] = key.target.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      }
    });
  }

  render() {
    return (
      <Section title={this.props.title}>
        <Tabs
          type="editable-card"
          activeKey={this.state.activeTab.toString()}
          onChange={(key: string) => this.onChangeTab(key)}
          onEdit={(targetKey: string, action: string) => this.onEditTab(targetKey, action)}
        >
          {this.props.data &&
            this.props.data.map((dataRow: LooseObject, index: number) => (
              <Tabs.TabPane
                key={index}
                tab={index + 1}
                closable={true}
              >
                {this.props.items && this.props.items.properties &&
                  Object.keys(this.props.items.properties).map((elementName: string, j: number) => {
                    const element = this.props.items.properties[elementName];
                    return (
                      <InputRenderer
                        key={j}
                        name={elementName}
                        {...element}
                        value={this.props.data && this.props.data[index] && this.props.data[index][elementName]
                          ? this.props.data[index][elementName]
                          : null}
                        onChange={this.onChange}
                      />);
                  })}
              </Tabs.TabPane>
            ))}
        </Tabs>
      </Section>
    );
  }
}

export default ArrayInputs;