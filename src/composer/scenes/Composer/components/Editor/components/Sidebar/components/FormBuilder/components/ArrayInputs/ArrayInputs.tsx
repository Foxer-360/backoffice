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
    this.onEditTab = this.onEditTab.bind(this);
    this.mediaLibraryChange = this.mediaLibraryChange.bind(this);
    this.onChangeTab = debounce(this.onChangeTab.bind(this), 25);
  }

  public onChangeTab(key: string) {
    this.props.onChange({ target: { name: 'activeTab', value: key } });
  }

  public onNewTab() {
    const id = `#${Date.now()}`;
    const newData = [...this.props.data];
    newData.push({ id });

    const newTab = id;

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

    if (action === 'remove') {
      newData.splice(iKey, 1);

      if (newTab > iKey || iKey === newTab) {
        newTab = newTab - 1;
      }
      if (newTab < 0) {
        newTab = 0;
      }
    }

    if (action === 'up') {
      if (iKey > 0 && newData.length > 1) {
        [newData[iKey], newData[iKey - 1]] = [newData[iKey - 1], newData[iKey]];
      }
    }

    if (action === 'down') {
      if (iKey < newData.length - 1 && newData.length > 1) {
        [newData[iKey], newData[iKey + 1]] = [newData[iKey + 1], newData[iKey]];
      }
    }

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  // tslint:disable-next-line:no-any
  public onChange(key: any) {
    let rowIndex = this.props.data.findIndex((row: ILooseObject) => row.id === this.props.activeTab);
    
    if (rowIndex < 0) {
      rowIndex = 0;
    }

    const newData = [...this.props.data];
    newData[rowIndex][key.target.name] = key.target.value;
   
    if (!newData[rowIndex].id) {
      newData[rowIndex].id = `#${Date.now()}`;
    }

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public mediaLibraryChange(media: { value: object; name: string }) {
    let rowIndex = this.props.data.findIndex((row: ILooseObject) => row.id === this.props.activeTab);

    if (rowIndex < 0) {
      rowIndex = 0;
    }

    const newData = [...this.props.data];
    newData[rowIndex][media.name] = media.value;

    if (!newData[rowIndex].id) {
      newData[rowIndex].id = `#${Date.now()}`;
    }

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
          If there accordion=false the bugs is commig beacause activeTab just a single number
        */}

        <Collapse accordion={true} onChange={(key: string) => this.onChangeTab(key)}>
          {this.props.data &&
            this.props.data.map((dataRow: ILooseObject, index: number) => {
              let title = null;
              if (this.props.items.properties) {
                const properties: LooseObject = this.props.items.properties;
                title = 
                  (
                    properties.title &&
                    properties.title.type === 'string' &&
                    dataRow.title
                  ) || `(Collapse without title)`;
              }

              const panelTitle = (
                <>
                  <div onClick={e => { e.stopPropagation(); }}>
                    {title || 'new item'}

                    <div style={{position: 'absolute', top: '30%', right: '35px' }}>
                      <Icon onClick={() => this.onEditTab(index.toString(), 'up')} type="arrow-up" style={{ marginRight: '5px' }} />
                      <Icon onClick={() => this.onEditTab(index.toString(), 'down')} type="arrow-down" />
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
                  </div>
                </>
              );

              return (
                <Collapse.Panel key={dataRow.id} header={panelTitle}>
                  {this.props.items &&
                    this.props.items.properties &&
                    Object.keys(this.props.items.properties).map((elementName: string, j: number) => {
                      const element = this.props.items.properties[elementName];
                      return (
                        <>
                          <InputRenderer
                            key={`${dataRow.id}_${j}`}
                            id={`${dataRow.id}_${j}`}
                            name={elementName}
                            {...element}
                            value={dataRow[elementName]}
                            onChange={this.onChange}
                            mediaLibraryChange={this.mediaLibraryChange}
                          />
                        </>
                      );
                    })}
                </Collapse.Panel>
              );
            })}
            <div className={'ant-collapse-item'} style={{ backgroundColor: 'white' }}>
              <a 
                className={'ant-collapse-header'} 
                onClick={() => this.onNewTab()} 
                style={{ display: 'block', padding: '10px 0', textAlign: 'center', color: '#1890ff' }}
              >
                Add new item
              </a>
            </div>
        </Collapse>
      </Section>
    );
  }
}

export default ArrayInputs;