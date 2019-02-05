import { ILooseObject } from '@source/composer/types';
import { Icon, Popconfirm, Collapse, Card, Select, Popover, Button, Alert, Row, Input } from 'antd';
import * as React from 'react';
import { IFormSchema } from '../../FormBuilder';
import InputRenderer from '../InputRenderer';
import Section from '../Section';
import debounce from 'lodash/debounce';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import deref from 'json-schema-deref-sync';
import { client } from '@source/services/graphql';

const Option = Select.Option;

const DATASOURCES = gql`
  query { 
    datasources {
      id
      type
      schema
      slug
      datasourceItems {
        id
        slug
        content
      }
    }
  }
`;

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IArrayInputsProps {
  title: string;
  name: string;
  // tslint:disable-next-line:no-any
  data: any;
  items: IFormSchema;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent | any) => void;
  activeTab: number;
  schemaPaths: Array<string>;
}

interface IArrayInputsState {
  loading: boolean;
  schemaPaths: Array<string>;
}

class ArrayInputs extends React.Component<IArrayInputsProps, IArrayInputsState> {
  constructor(props: IArrayInputsProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onDynamicSourceDataChange = this.onDynamicSourceDataChange.bind(this);
    this.onEditTab = this.onEditTab.bind(this);
    this.mediaLibraryChange = this.mediaLibraryChange.bind(this);
    this.getNextIdValue = this.getNextIdValue.bind(this);
    this.onChangeTab = this.onChangeTab.bind(this);
    this.state = {
      loading: true,
      schemaPaths: []
    };
  }

  getNextIdValue() {
    let highestIdValue = '0';

    this.props.data.forEach(item => {
      if (item.id && parseInt(item.id, 10) > parseInt(highestIdValue, 10)) {
        highestIdValue = item.id;
      }
    });

    return (parseInt(highestIdValue, 10) + 1).toString();
  }

  async componentDidMount() {
    // check if ids in all rows
    // if so, then state.loading = false;

    // if no, then recalculate and send onChange
    if (this.props.data && this.props.data.length > 0) {
      const newData = this.props.data.map((item, key) => {
        if (item && !item.id) {
          item.id = this.getNextIdValue();
        }
        return item;
      });
      await this.props.onChange({
        target: {
          name: this.props.name,
          value: newData,
        },
      });
      this.setState({ loading: false });
    } else {
      this.setState({ loading: false });
    }

    if (this.props.data.datasourceId) {
      client.query({
        query: DATASOURCES
      }).then((res: LooseObject) => {
        if (res && res.data && res.data.datasources) {
          this.setSchemaPaths(res.data.datasources, this.props.data.datasourceId);
        }
      });
    }
  }

  public onChangeTab(key: string) {
    this.props.onChange({ target: { name: 'activeTab', value: key } });
  }

  public onNewTab() {
    const id = this.getNextIdValue();
    const newData = [...this.props.data];
    newData.push({ id });

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public onEditTab(targetKey: string, action?: string) {
    let iKey = parseInt(targetKey, 10);
    let newData = [...this.props.data];
    let newTab = this.props.activeTab;

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

  removeItem(id: string) {
    const newData = this.props.data.filter(item => item.id !== id);
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

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  // tslint:disable-next-line:no-any
  public onDynamicSourceDataChange(e: any) {

    const newData = {...this.props.data.data};

    newData[e.target.name] = e.target.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          data: newData,
        }
      }
    });
  }

  // tslint:disable-next-line:no-any
  public onDynamicSourceChange = (key) => (val: any) => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          [key]: val,
        }
      }
    });
  }

  public onDynamicSourceSelection = (datasources) => async (id) => {

    await this.setSchemaPaths(datasources, id);

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          datasourceId: id,
          data: {},
        }
      }
    });
  }

  public async setSchemaPaths(datasources: Array<LooseObject>, datasourceId: string) {
    const datasource = datasources.find(source => source.id === datasourceId);

    if (!datasource) { return; }

    const schemaWithoutRefs = deref(datasource.schema);
    const paths = [];
    this.getSchemaPaths(schemaWithoutRefs, '', paths);

    await this.setState({ schemaPaths: paths });
  }

  public getSchemaPaths(schemaWithoutRefs: LooseObject, path: string, paths: Array<string>) {
    if (!schemaWithoutRefs.properties && schemaWithoutRefs.type === 'string') {
      paths.push(`${path}%`);
    } else if (schemaWithoutRefs.properties) {
      Object.keys(schemaWithoutRefs.properties).forEach(key => {
        let newPath = String(path);
        let prefix = path.length > 0 ? ',' : '';
        if (schemaWithoutRefs.properties[key].type === 'array') {
          newPath += `${prefix}${key},[n]`;
          return this.getSchemaPaths(schemaWithoutRefs.properties[key].items, newPath, paths);
        } else {
          newPath += `${prefix}${key}`;
          return this.getSchemaPaths(schemaWithoutRefs.properties[key], newPath, paths);
        }
      
      });
    }
  }

  public mediaLibraryChange(media: { value: object; name: string }) {
    let rowIndex = this.props.data.findIndex((row: ILooseObject) => row.id === this.props.activeTab);

    if (rowIndex < 0) {
      rowIndex = 0;
    }

    const newData = [...this.props.data];
    const value = {
      recommendedSizes: this.props.data[rowIndex][media.name] && this.props.data[rowIndex][media.name].recommendedSizes,
      ...media.value,  
    };

    newData[rowIndex][media.name] = value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public render() {
    if (this.state.loading) {
      return <Card loading={true} />;
    }

    return (
    <Query query={DATASOURCES}>{({ error, loading, data }) => {

      if (error) { return 'Error...'; }
      if (loading) { return 'Loading...'; }

      const { datasources } = data;
    return (
      <Section title={this.props.title}>
        {/* 
          If there accordion=false the bugs is commig beacause activeTab just a single number
        */}
        {this.props.data.datasourceId && 
          <div>
            <Card>
              <Row style={{ paddingBottom: 10 }}>
                Datsource: {this.dynamicSourceSelect(datasources)}
                <Button
                    style={{ marginLeft: 5 }}
                    onClick={() => this.props.onChange({
                      target: {
                        name: this.props.name,
                        value: [],
                      },
                    })}
                >
                  Fill static data
                </Button>
              </Row>
              <Row>
                <Section title={'Order by'}>
                  <Row style={{ paddingBottom: 10 }}>
                    Key: <Input
                      style={{ width: 250 }}
                      defaultValue={this.props.data.orderBy || ''}
                      onChange={(e) => this.onDynamicSourceChange('orderBy')(e.target.value)}
                    />
                  </Row>
                  {this.props.data.orderBy &&
                    <Row style={{ paddingBottom: 10 }}>
                      Order:
                      <Select
                        style={{ marginLeft: 5, width: 120 }}
                        onChange={this.onDynamicSourceChange('order')}
                        value={this.props.data.order || 'ASC'}
                      >
                        <Option value={'ASC'} key={'ASC'}>Ascending</Option>
                        <Option value={'DESC'} key={'DESC'}>Descending</Option>
                      </Select>
                    </Row>}
                  </Section>
                </Row>
              <Row>
                <Section title={'Filter by'}>
                <Row style={{ paddingBottom: 10 }}>
                  Key: <Input
                    style={{ width: 250 }}
                    defaultValue={this.props.data.filterBy || ''}
                    onChange={(e) => this.onDynamicSourceChange('filterBy')(e.target.value)}
                  />
                </Row>
                {this.props.data.filterBy &&
                  <Row>
                    Includes:
                    <Input
                      style={{ marginLeft: 5, width: 250 }}
                      defaultValue={this.props.data.includes || ''}
                      onChange={(e) => this.onDynamicSourceChange('includes')(e.target.value)}
                    />
                  </Row>}
                </Section>
              </Row>
            </Card>
            {this.props.items &&
            this.props.items.properties &&
            Object.keys(this.props.items.properties).map((elementName: string, j: number) => {
              const element = this.props.items.properties[elementName];

              return (
                <InputRenderer
                  key={`${j}`}
                  id={`${j}`}
                  name={elementName}
                  {...element}
                  value={this.props.data.data[elementName]}
                  onChange={this.onDynamicSourceDataChange}
                  schemaPaths={[ ...this.state.schemaPaths, ...this.props.schemaPaths]}
                  mediaLibraryChange={this.mediaLibraryChange}
                />
              );
            })}
          </div>
        }
        {!this.props.data.datasourceId && <>
          <Popover 
            content={<>
              <Row style={{ paddingBottom: 10 }}>
                  <Alert
                    message={'By selection of dynamic datasource actual data will be erased.'}
                    type={'warning'}
                    showIcon={true}
                  />
              </Row>
              <Row>  
                Datsource: {this.dynamicSourceSelect(datasources)}
              </Row>
            </>}
          >
            <Button
              style={{ marginBottom: 10 }}
            >
              Select dynamic source
            </Button>
          </Popover>
          <Collapse accordion={true} onChange={(key: string) => this.onChangeTab(key)}>
            {this.props.data &&
              this.props.data.map((dataRow: ILooseObject, index: number) => {
                let title = null;
                if (this.props.items.properties) {
                  const properties: LooseObject = this.props.items.properties;
                  title = (properties.title && properties.title.type === 'string' && dataRow.title) || `Item ${index}`;
                }

                const panelTitle = (
                  <>
                    <div
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      {title || 'new item'}

                      <div style={{ position: 'absolute', top: '30%', right: '35px' }}>
                        <Icon
                          onClick={() => this.onEditTab(index.toString(), 'up')}
                          type="arrow-up"
                          style={{ marginRight: '5px' }}
                        />
                        <Icon onClick={() => this.onEditTab(index.toString(), 'down')} type="arrow-down" />
                      </div>

                      <Popconfirm
                        title="Are you sure delete this tab?"
                        onConfirm={() => this.removeItem(dataRow.id)}
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
                          <InputRenderer
                            key={`${dataRow.id}_${j}`}
                            id={`${dataRow.id}_${j}`}
                            name={elementName}
                            {...element}
                            value={dataRow[elementName]}
                            onChange={this.onChange}
                            mediaLibraryChange={this.mediaLibraryChange}
                          />
                        );
                      })}
                  </Collapse.Panel>
                );
              })}
            <div key={'new-collapse'} className={'ant-collapse-item'} style={{ backgroundColor: 'white' }}>
              <a
                className={'ant-collapse-header'}
                onClick={() => this.onNewTab()}
                style={{ display: 'block', padding: '10px 0', textAlign: 'center', color: '#1890ff' }}
              >
                Add new item
              </a>
            </div>
          </Collapse>
        </>}
    </Section>); 
    }}</Query>
    );
  }

  dynamicSourceSelect(datasources: Array<LooseObject>) {
    return (
      <Select 
        defaultValue={this.props.data.datasourceId || 'Select'}
        style={{ width: 120 }}
        onChange={this.onDynamicSourceSelection(datasources)}
      >
      {datasources.map(datasource => <Option key={datasource.id} value={datasource.id}>{datasource.type}</Option>)}
      </Select>);
  } 
}

export default ArrayInputs;
