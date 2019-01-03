import { ILooseObject } from '@source/composer/types';
import { Icon, Popconfirm, Collapse } from 'antd';
import * as React from 'react';
import { IFormSchema } from '../../FormBuilder';
import InputRenderer from '../InputRenderer';
import Section from '../Section';
import debounce from 'lodash/debounce';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IArrayInputsProps {
  title: string;
  name: string;
  language: string;
  data: ILooseObject[];
  items: IFormSchema;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent | any) => void;
  activeTab: number;
}

class ArrayInputs extends React.Component<IArrayInputsProps> {
  constructor(props: IArrayInputsProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.mediaLibraryChange = this.mediaLibraryChange.bind(this);
    this.onChangeTab = debounce(this.onChangeTab.bind(this), 25);
    console.log(this.props.activeTab);
  }

  public onChangeTab(key: number) {
    this.props.onChange({ target: { name: 'activeTab', value: key } });
  }

  public onNewTab() {
    const newData = [...this.props.data];
    newData.push({});

    const newTab = newData.length - 1;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });

    this.onChangeTab(newTab);
  }

  public onEditTab(targetKey: string, action?: string) {
    let iKey = parseInt(targetKey, 10);
    let newData = [...this.props.data];
    let newTab = this.props.activeTab;

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
      },
    });

    this.onChangeTab(newTab);
  }

  // tslint:disable-next-line:no-any
  public onChange(key: any) {
    const newData = [...this.props.data];
    newData[this.props.activeTab][key.target.name] = key.target.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public mediaLibraryChange(media: { value: object; name: string }) {
    const newData = [...this.props.data];
    newData[this.props.activeTab][media.name] = media.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public render() {
    return (
      <Section title={this.props.title}>
        {/* 
          TODO: If there accordion=false the bugs is commig beacause activeTab just a single number
        */}
        <Collapse accordion={true} onChange={(key: string) => this.onChangeTab(parseInt(key, 10))}>
          {this.props.data &&
            this.props.data.map((dataRow: ILooseObject, index: number) => {
              const dataRowKeys = dataRow && Object.keys(dataRow);
              let title = '—';
              if (Array.isArray(dataRowKeys) && dataRowKeys.length > 0) {
                title = dataRow[dataRowKeys[0]];
              }

              const panelTitle = (
                <>
                  {title}

                  {/* TODO: onClick */}
                  <div style={{position: 'absolute', top: '30%', right: '35px' }}>
                    <Icon onClick={() => alert('UP')} type="arrow-up" style={{ marginRight: '5px' }} />
                    <Icon onClick={() => alert('DOWN')} type="arrow-down" />
                  </div>

                  <Popconfirm
                    title="Are you sure delete this tab?"
                    onConfirm={() => this.onEditTab(index.toString(), 'remove')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Icon
                      type="close"
                      theme="outlined"
                      style={{ color: '#f5222d', position: 'absolute', top: '40%', right: '15px' }}
                      className="anticon anticon-close ant-tabs-close-x"
                    />
                  </Popconfirm>
                </>
              );

              return (
                <Collapse.Panel key={index.toString()} header={panelTitle}>
                  {this.props.items &&
                    this.props.items.properties &&
                    Object.keys(this.props.items.properties).map((elementName: string, j: number) => {
                      const element = this.props.items.properties[elementName];
                      return (
                        <InputRenderer
                          key={j}
                          id={index}
                          name={elementName}
                          language={this.props.language}
                          {...element}
                          value={
                            this.props.data && this.props.data[index] && this.props.data[index][elementName]
                              ? this.props.data[index][elementName]
                              : null
                          }
                          onChange={this.onChange}
                          mediaLibraryChange={this.mediaLibraryChange}
                        />
                      );
                    })}
                </Collapse.Panel>
              );
            })}
            <div className={'ant-collapse-item'}>
              <a 
                className={'ant-collapse-header'} 
                onClick={() => this.onNewTab()} 
                style={{ display: 'block', padding: '10px 0', textAlign: 'center', color: '#1890ff' }}
              >
                Add new element
              </a>
            </div>
        </Collapse>
      </Section>
    );
  }
}

export default ArrayInputs;