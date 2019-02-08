import { ILooseObject } from '@source/composer/types';
import { 
  Icon, Popconfirm, Collapse, Card, Select, Popover, Button, Alert, Row, Input, InputNumber, Tag } from 'antd';
import * as React from 'react';
import { IFormSchema } from '../../FormBuilder';
import InputRenderer from '../InputRenderer';
import Section from '../Section';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import deref from 'json-schema-deref-sync';
import { client } from '@source/services/graphql';
import { getSchemaPaths } from '@source/composer/utils';
import { GET_TAGS } from '@source/services/graphql/queries/system';
import { adopt } from 'react-adopt';
import { LOCAL_SELECTED_WEBSITE } from '@source/services/graphql/queries/local';

const { Panel } = Collapse;

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

const pageContextSchema = {
  type: 'object',
  properties: {
    page: {
      type: 'object',
      properties: {
        url: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    }
  }
};

const ComposedQuery = adopt({
  website: ({ render }) => (
    <Query query={LOCAL_SELECTED_WEBSITE}>
      {({ data }) => render(data.website)}
    </Query>
  ),
  datasources: ({ render }) => (
    <Query query={DATASOURCES}>
      {(data) => render(data)}
    </Query>
  ),
  tags: ({ render }) => (
    <Query query={GET_TAGS}>
      {(data) => render(data)}
    </Query>
  ),
});

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
          const datasource = res.data.datasources.find(source => source.id === this.props.data.datasourceId);

          if (!datasource) { return; }
          this.setSchemaPaths(datasource.schema);
        }
      });
    }

    if (this.props.data.sourceType === 'pages') {
      this.setSchemaPaths(pageContextSchema);
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

    const datasource = datasources.find(source => source.id === id);

    if (!datasource) { return; }

    await this.setSchemaPaths(datasource.schema);

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          datasourceId: id,
          data: {},
          filters: []
        }
      }
    });
  }

  public async setSchemaPaths(schema: LooseObject) {
    const schemaWithoutRefs = deref(schema);
    const paths = [];
    getSchemaPaths(schemaWithoutRefs, '', paths);

    await this.setState({ schemaPaths: paths });
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
    <ComposedQuery>{({ 
      datasources: { 
        error: datasourcesError,
        loading: datasourcesLoading,
        data: datasourcesData,
      },
      tags: {
        error: tagsError,
        loading: tagsLoading,
        data: tagsData,
      }
    }) => {

      if (datasourcesError || tagsError) { return 'Error...'; }
      if (datasourcesLoading || tagsLoading) { return 'Loading...'; }

      const { datasources } = datasourcesData;
      const { tags } = tagsData;

      return (
        <Section title={this.props.title}>
          {/* 
            If there accordion=false the bugs is commig beacause activeTab just a single number
          */}
          
          {this.props.data.datasourceId &&
            this.dynamicSourceOptions(datasources)
          }
          {this.props.data.sourceType === 'pages' &&
            this.pagesSourceOptions(tags)
          }
          {!(this.props.data.datasourceId || this.props.data.sourceType === 'pages') && <>
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
            <Popconfirm 
              placement="bottom" 
              title={'By page datasource you will delete actual data. Do you want to continue?'} 
              onConfirm={this.selectPageSource} 
              okText="Yes" 
              cancelText="No"
            >
              <Button
                style={{ marginBottom: 10 }}
              >
                Select pages source
              </Button>
            </Popconfirm>
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
                              schemaPaths={this.props.schemaPaths}
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
    }}</ComposedQuery>
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

  selectPageSource = () => {

    this.setSchemaPaths(pageContextSchema);
    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          sourceType: 'pages',
          data: {},
          filters: [],
          tagIds: []
        }
      }
    });
  }

  dynamicSourceOptions = (datasources) => {

    return (
    <div>
      <Section title={'Datasource options'}>
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
                    style={{ width: 160 }}
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
                <Collapse accordion={true} onChange={(key: string) => this.onChangeTab(key)}>
                  {this.props.data.filters && this.props.data.filters.map((filter, i) => 
                  <Panel 
                    header={<div
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      Filter {i + 1}
                      <Popconfirm

                        title="Are you sure delete this filter?"
                        onConfirm={() => this.onFilterDelete(i)}
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
                    </div>} 
                    key={`${i}`}
                  >
                    <Row style={{ paddingBottom: 10 }}>
                      Key: <Input
                        style={{ width: 160 }}
                        defaultValue={filter.filterBy || ''}
                        onChange={(e) => this.onfilterByChange(e.target.value, i)}
                      />
                    </Row>
                    <Row>
                      Includes:
                      <Input
                        style={{ marginLeft: 5, width: 250 }}
                        defaultValue={filter.includes || ''}
                        onChange={(e) => this.onIncludesChange(e.target.value, i)}
                      />
                    </Row>
                  </Panel>)}
                  <div key={'new-collapse'} className={'ant-collapse-item'} style={{ backgroundColor: 'white' }}>
                    <a
                      className={'ant-collapse-header'}
                      onClick={() => this.onNewFilterBy()}
                      style={{ display: 'block', padding: '10px 0', textAlign: 'center', color: '#1890ff' }}
                    >
                      Add new item
                    </a>
                  </div>
                </Collapse>
              </Section>
            </Row>
            <Row>
              <Section title={'Limit'}>
                <Row style={{ paddingBottom: 10 }}>
                  <InputNumber
                    style={{ width: 160 }}
                    defaultValue={this.props.data.limit || ''}
                    onChange={(limit) => this.onDynamicSourceChange('limit')(limit)}
                  /><br/>
                  Let it empty or with zero for no limit.
                </Row>
              </Section>
            </Row>
      </Section>
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
    </div>);

  }

  pagesSourceOptions = (tags) => {

    return (
    <div>
      <Section title={'Datasource options'}>
            <Row style={{ paddingBottom: 10 }}>
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
                    style={{ width: 160 }}
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
                <Collapse accordion={true} onChange={(key: string) => this.onChangeTab(key)}>
                  {this.props.data.filters && this.props.data.filters.map((filter, i) => 
                  <Panel 
                    header={<div
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      Filter {i + 1}
                      <Popconfirm
                        title="Are you sure delete this filter?"
                        onConfirm={() => this.onFilterDelete(i)}
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
                    </div>} 
                    key={`${i}`}
                  >
                    <Row style={{ paddingBottom: 10 }}>
                      Key: <Input
                        style={{ width: 160 }}
                        defaultValue={filter.filterBy || ''}
                        onChange={(e) => this.onfilterByChange(e.target.value, i)}
                      />
                    </Row>
                    <Row>
                      Includes:
                      <Input
                        style={{ marginLeft: 5, width: 250 }}
                        defaultValue={filter.includes || ''}
                        onChange={(e) => this.onIncludesChange(e.target.value, i)}
                      />
                    </Row>
                  </Panel>)}
                  <div key={'new-collapse'} className={'ant-collapse-item'} style={{ backgroundColor: 'white' }}>
                    <a
                      className={'ant-collapse-header'}
                      onClick={() => this.onNewFilterBy()}
                      style={{ display: 'block', padding: '10px 0', textAlign: 'center', color: '#1890ff' }}
                    >
                      Add new item
                    </a>
                  </div>
                </Collapse>
              </Section>
            </Row>
            <Row>
              <Section title={'Tags'}>
                <Row style={{ paddingBottom: 10 }}>
                  <Popover content={<div>{this.getUninsertedTags(tags)}</div>} trigger="click" placement="top">
                    <Popover content={<div>{this.getUninsertedTags(tags)}</div>} trigger="hover" placement="top">
                        <Button>
                          Select tag <Icon type="down" />
                        </Button>
                    </Popover>
                  </Popover>
                </Row>
                <Row>
                  {tags
                    .filter(({ id }) => 
                      this.props.data.tagIds
                        .some((tagId => tagId === id)))
                    .map(({ color, name, id }: LooseObject, key) => {
                      return (
                        <Tag
                          key={key}
                          color={color}
                          onClick={() => this.deleteTag(id)}
                        >
                          {name}
                        </Tag>
                      );
                    })
                  }
                </Row>
              </Section>
            </Row>
            <Row>
              <Section title={'Limit'}>
                <Row style={{ paddingBottom: 10 }}>
                  <InputNumber
                    style={{ width: 160 }}
                    defaultValue={this.props.data.limit || ''}
                    onChange={(limit) => this.onDynamicSourceChange('limit')(limit)}
                  /><br/>
                  Let it empty or with zero for no limit.
                </Row>
              </Section>
            </Row>
      </Section>
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
            pageSourceAvailable={true}
            mediaLibraryChange={this.mediaLibraryChange}
          />
        );
      })}
    </div>);

  }

  getUninsertedTags = (tags: Array<LooseObject>) => {
    const { data: { tagIds } } = this.props;

    return tags
      .filter(({ id }) => !tagIds.some(tagId => tagId === id))
      .map(({ color, name, id }, key) => {
        return (
          <Tag
            key={key}
            color={color}
            onClick={() => this.addNewTag(id)}
          >
            {name}
          </Tag>
        );
      });
  }

  onfilterByChange = (value, i) => {
    console.log(value, i);
    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          filters: this.props.data.filters.map((filter, pos) => {
            console.log('here');
            if (pos === i) {
              filter.filterBy = value;
            }

            return filter;
          }),
        }
      }
    });
  }

  onIncludesChange = (value, i) => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          filters: this.props.data.filters.map((filter, pos) => {
            if (pos === i) {
              filter.includes = value;
            }

            return filter;
          }),
        }
      }
    });
  }

  onNewFilterBy = () => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          filters: [
            ...(this.props.data.filters || []),
            {
              filterBy: '',
              includes: ''
            }
          ],
        }
      }
    });
  }

  onFilterDelete = (i) => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          filters: this.props.data.filters.filter((filter, pos) => {
            if (pos === i) {
              return false;
            }

            return true;
          }),
        }
      }
    });
  }

  addNewTag = (id) => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          tagIds: [
            ...(this.props.data.tagIds || []),
            id
          ]
        }
      }
    });
  }

  deleteTag = (id) => {

    this.props.onChange({
      target: {
        name: this.props.name,
        value: {
          ...this.props.data,
          tagIds: this.props.data.tagIds.filter(oldId => oldId !== id)
        }
      }
    });
  }
}

export default ArrayInputs;
