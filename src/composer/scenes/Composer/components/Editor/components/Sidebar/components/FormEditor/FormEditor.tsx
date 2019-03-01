import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import { Button, Icon, Select, Row, Card } from 'antd';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { IComponentsServiceLikeClass } from '../../../../../../Composer';
import FormBuilder from '../FormBuilder';
import { Query } from 'react-apollo';
import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import deref from 'json-schema-deref-sync';
import { getSchemaPaths } from '@source/utils';
import { client } from '@source/services/graphql';

const { Option } = Select;

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  type: string | null; // Type of Component which you want to edit
  data: ILooseObject; // Data for form

  onChange: (data: ILooseObject) => void; // When form make some change fires this method with new data
  onSave: () => Promise<boolean>; // Save data
  onCancel: () => Promise<boolean>; // Cancel, revert data

  componentsService: IComponentsServiceLikeClass;

  context: Context;
}

export interface IState {
  searchFilters: LooseObject;
}

const GET_CONTEXT = gql`{
  languageData @client
  pageData @client
  websiteData @client
  datasourceItems @client
}`;

const GET_PAGES_URLS = gql`
  query pagesUrls($language: ID!, $websiteId: ID!) {
    pagesUrls(where: { language: $language, websiteId: $websiteId }) {
      id
      page
      url
      name
      description
    }
  }
`;

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

const ComposedQuery = adopt({
  context: ({ render }) => (
    <Query query={GET_CONTEXT} >
      {({ data }) => render(data)}
    </Query>
  ),
  getPagesUrls: ({ render, context: { languageData, websiteData }}) => {
    if (!(languageData && websiteData)) { return render({ loading: true }); }
    return (
    <Query query={GET_PAGES_URLS} variables={{ language: languageData.id, websiteId: websiteData.id }}>
      {(data) => {
        return render(data);
      }}
    </Query>);
  },
  datasources: ({ render, getPagesUrls, context: { pageData }, context }) => {
    console.log(context);
    if (!pageData || getPagesUrls.loading) { return render({ contextSchemaPaths: [], contextSchemaDatasources: [] }); }
    console.log('85');
    const { pagesUrls } = getPagesUrls.data;
    const pageUrl = pagesUrls && pagesUrls.find(p => p.page === pageData.id);
    return (
    <Query query={DATASOURCES}>{({ error, loading, data }) => {

      if (error) { return 'Error...'; }
      if (loading) { return 'Loading...'; }

      const { datasources } = data;

      const regex = /ds\:(\w+)/g;

      const pageContextSchema = {
        type: 'object',
        properties: {
          cx: {
            type: 'object',
            properties: {}
          }
        }
      };
      
      const contextSchemaPaths = [];
      const contextSchemaDatasources = [];
      if (pageUrl) {
        let result;
        let index = 0;

        while (result = regex.exec(pageUrl.url)) {
          if (result[1]) {
            const datasource = datasources.find(source => source.type.toLowerCase() === result[1]);
            if (datasource) {
              pageContextSchema.properties.cx.properties[index] = deref(datasource.schema);
              contextSchemaDatasources.push(datasource);
              index++;
            }
          }
        }

        getSchemaPaths(pageContextSchema, '', contextSchemaPaths);
      }

      return render({ contextSchemaPaths, contextSchemaDatasources });

    }}</Query>);

  }
});

class FormEditor extends React.Component<IProperties, IState> {
    onChange: (data: ILooseObject) => void;
  constructor(props: IProperties) {

    super(props);
    this.onChange = debounce(this.props.onChange, 500);
    this.state = {
      searchFilters: {}
    };
  }

  public render() {
    const type = this.props.type || '';
    const resource = this.props.componentsService.getComponentResource(type) || null;
    const formResource = resource && resource.form ? resource.form : null;

    const Form = this.props.componentsService.getForm(type);

    return (
      <ComposedQuery>
      {({ datasources: { contextSchemaPaths, contextSchemaDatasources }, context: { datasourceItems }}) => {
        return (<div className={'formEditor'}>
          {contextSchemaDatasources && contextSchemaDatasources.length > 0 &&
          <Row>
            <Card
              title={'Context preview'}
            >
              {contextSchemaDatasources.map((datasource, i) => {
                return (
                  <Row key={i}>
                    {i + 1} url slug:
                    <Select
                      showSearch={true}
                      onSearch={(urlSearchFilter) => this.setState({ searchFilters: { [i]: urlSearchFilter }})}
                      onSelect={() => this.setState({ searchFilters: { [i]: null }})}
                      style={{ marginLeft: 5, width: 160 }}
                      key={datasource.id}
                      defaultValue={(datasourceItems && datasourceItems[i] && datasourceItems[i].id) || `Select ${datasource.type} url slug.`}
                      onChange={
                        this.onDatasourceItemSelect(
                          datasource,
                          i,
                          datasourceItems,
                          contextSchemaDatasources.length
                        )}
                      filterOption={false}
                    >
                      {datasource.datasourceItems
                        .filter(item =>
                          !this.state.searchFilters[i] ||
                          item.slug
                            .toLowerCase()
                            .includes(
                              this.state.searchFilters[i]
                              .toLowerCase()
                            )
                        )
                        .map((item, key) => 
                          <Option key={item.id} value={item.id}>
                            {item.slug}
                          </Option>)}
                    </Select>
                  </Row>);
              })}
            </Card>
          </Row>}
          <Row>
            {formResource ?
              <FormBuilder
                form={formResource}
                data={this.props.data}
                onChange={this.onChange}
                contextSchemaPaths={contextSchemaPaths}
              />
              :
              <div>
                <Icon style={{ marginRight: 10 }} type="stop" />
                This form is not editable!
              </div>
            }

            <hr
              style={{
                border: '0',
                borderTop: '1px solid #e6e6e6',
                marginBottom: '12px',
                marginTop: '24px',
              }}
            />

            <Button
              type="primary"
              onClick={this.props.onSave}
            >
              <Icon type="save" />Save Changes
            </Button>

            <Button
              type="danger"
              onClick={this.props.onCancel}
              style={{ marginLeft: '5px' }}
            >
              Cancel
            </Button>
          </Row>
      </div>);        
  
    }}</ComposedQuery>);
  }

  onDatasourceItemSelect = (datasource, index, datasourceItems, contextLength) => (itemId) => {
    let newDatasourceItems = 
      ((datasourceItems && datasourceItems.length > 0 && datasourceItems) ||
      new Array(contextLength).fill({ content: {} }))
        .map((item, i) => {
          if (index === i) {
            const newDatasourceItem = datasource.datasourceItems.find(item2 => item2.id === itemId);
            if (newDatasourceItem) {
              return newDatasourceItem;
            }
              
          }
          return item;
        });
    console.log(newDatasourceItems);
    client.writeQuery({
      query: gql`{
        datasourceItems @client
      }`,
      data: {
        datasourceItems: newDatasourceItems
      }
    });

  }

}

export default FormEditor;
