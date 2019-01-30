import * as React from 'react';
import { Col, Input, Checkbox, Button, Row, Alert, Form, Card, Tag, Tooltip, Icon } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import * as Ajv from 'ajv';
import metaSchema from './meta-schema.json';
import gql from 'graphql-tag';
import { client } from '@source/services/graphql';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';
import JsonForm from 'react-jsonschema-form';

const ajv = new Ajv();
const validate = ajv.compile(metaSchema);

const { Component } = React;

interface Properties extends RouteComponentProps<LooseObject> {
  data?: LooseObject;
  visible: boolean;
  edit: boolean;
  onCancel: () => void;
  onSave: (type: string, displayInNavigation: boolean, schema: string) => void;
}

interface State {
  type: string;
  schema: LooseObject;
  displayInNavigation: boolean;
  slug: Array<string>;
  errors: LooseObject;
  originalDatasource?: LooseObject; 
  uiSchema?: LooseObject;
  inputVisible: boolean;
  slugInputValue: string;
}

const CREATE_DATASOURCE = gql`
mutation createDatasource(
  $type: String!,
  $schema: Json!,
  $uiSchema: Json,
  $displayInNavigation: Boolean!,
  $slug: [String!]!
) {
  createDatasource(data: { 
    type: $type
    schema: $schema
    uiSchema: $uiSchema
    displayInNavigation: $displayInNavigation
    slug: { set: $slug }
  }) {
    id
    type
    schema
    uiSchema
    displayInNavigation
    slug
  }
}
`;

const UPDATE_DATASOURCE = gql`
mutation updateDatasource(
  $type: String!,
  $schema: Json!,
  $uiSchema: Json,
  $displayInNavigation: Boolean!,
  $slug: [String!]!,
  $id: ID!
) {
  updateDatasource(
    data: { 
      type: $type
      schema: $schema
      uiSchema: $uiSchema
      displayInNavigation: $displayInNavigation
      slug: { set: $slug }
    },
    where: {
      id: $id
    }
  ) {
    id
    type
    schema
    uiSchema
    displayInNavigation
    slug
  }
}
`;

const DATASOURCE_LIST = gql`
  query {
    datasources {
      id
      type
      schema
      uiSchema
      displayInNavigation
      slug
    }
  }
`;

const DATASOURCE = gql`
  query datasource($id: ID!) {
    datasource(where: { id: $id }) {
      id
      type
      schema
      uiSchema
      displayInNavigation
      slug
    }
  }
`;

class DatasourceModal extends Component<Properties, State> {

  private DEFAULT: State = {
    type: '',
    schema: {},
    uiSchema: {},
    displayInNavigation: false,
    slug: [],
    errors:  null,
    inputVisible: false,
    slugInputValue: ''
  };

  private input: LooseObject = null;

  constructor(props: Properties) {
    super(props);

    this.state = { ...this.DEFAULT };

    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  public componentWillReceiveProps(props: Properties) {
    if (props.edit && props.data) {
      this.setState({
        type: props.data.type,
        displayInNavigation: props.data.displayInNavigation,
      });
    }
  }

  public componentDidMount() {
    const {
      match: {
        params: {
          id
        }
      }
    } = this.props;

    if (id) {
      client.query({
        query: DATASOURCE,
        variables: { id }
      }).then(({ data: { datasource } }: LooseObject) => {
        this.setState({ ...datasource, originalDatasource: datasource });
      });
    }
  }

  public render() {

    const { errors, inputVisible, slugInputValue } = this.state;
    const {
      match: {
        params: {
          id
        }
      }
    } = this.props;
    const { 
      history: {
        push
      }
    } = this.props;

    return (
      <>
      <Row gutter={16}>
          <Row             
            style={{ padding: '30px 30px 10px 30px' }}
            gutter={15}
          >
            <Card title={(id && this.state.originalDatasource) ? `${this.state.originalDatasource.type} editation:` : 'New datasource:'} id="bootstrap">
              <Row>
                <Col 
                  span={10}
                  style={{ padding: '10px' }}
                >
                <Form.Item
                  label="Type name"
                  {...((errors && errors.type) ? { 
                    validateStatus: 'error', 
                    help: errors.type
                  } : {})}
                >
                  <Input
                    value={this.state.type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ type: e.target.value })}
                  />
                </Form.Item>
                </Col>
                <Col 
                  span={10}
                  style={{ padding: '10px' }}
                >
                <Form.Item
                  label="Slug"
                  {...((errors && errors.slug) ? { 
                    validateStatus: 'error', 
                    help: errors.slug
                  } : {})}
                >
                <div>
                  {this.state.slug && this.state.slug.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                      <Tag key={tag} closable={true} afterClose={() => this.handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                      </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                  })}
                  {inputVisible && (
                    <Input
                      ref={this.saveInputRef}
                      type="text"
                      size="small"
                      style={{ width: 78 }}
                      value={slugInputValue}
                      onChange={(e: LooseObject) => 
                        this.setState({ slugInputValue: e.target.value })
                      }
                      onBlur={this.handleInputConfirm}
                      onPressEnter={this.handleInputConfirm}
                    />
                  )}
                  {!inputVisible && (
                    <Tag
                      onClick={this.showInput}
                      style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                      <Icon type="plus" /> New slug fragment
                    </Tag>
                  )}
                </div>
                {this.state.slug && this.state.slug.length > 0 && 
                `Url slug: ${this.state.slug.map(key => `[${key}]`).join('-')}` + 
                ` (Where [key] will be content of key in data.)`}
                </Form.Item>
                </Col>
                <Col
                  span={4}
                >
                  <Form.Item
                    label="Display in navigation"
                  >
                    <Checkbox
                      checked={this.state.displayInNavigation}
                      onChange={(e: CheckboxChangeEvent) =>
                        this.setState({ displayInNavigation: e.target.checked })}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Row>
          <Row 
            style={{ padding: 20 }}
            gutter={15}
          >
            <Col
              span={12}
              style={{ padding: '10px' }}
            >
              <Card title="Form Schema">
                <JSONInput
                    id={'schema'}
                    modifyErrorText={(e) => {
                      return e;
                    }}
                    {...this.state.originalDatasource ? 
                      { placeholder: this.state.originalDatasource.schema } : {}
                    }
                    colors={['dark_vscode_tribute']}
                    locale={locale}
                    width={'100%'}
                    onChange={this.onJsonSchemaInputChanged}
                />
                {errors && errors.schema &&
                <Alert
                  style={{ marginTop: 10 }}
                  message="Error Text"
                  description={<>
                    {errors.schema}
                  </>}
                  type="error"
                />}
              </Card>
            </Col>
            <Col
              span={12}
              style={{ padding: '10px' }}
            >
              <Card title="UI schema">
                <JSONInput
                  id={'uiSchema'}
                  modifyErrorText={(e) => {
                    return e;
                  }}
                  {...this.state.originalDatasource ? 
                    { placeholder: this.state.originalDatasource.uiSchema } : {}
                  }
                  colors={['dark_vscode_tribute']}
                  locale={locale}
                  width={'100%'}
                  onChange={({ jsObject: uiSchema }) => this.setState({ uiSchema })}
                />
              </Card>
            </Col>
          </Row>
          <Row style={{ padding: 20 }}>
            <Col
              span={24}
            >
              <Card title="Form preview" id="bootstrap">
                <JsonForm 
                  schema={this.state.schema || {}}
                  uiSchema={this.state.uiSchema || {}}
                />
              </Card>
            </Col>
          </Row>
      </Row>
      <Row type="flex" justify="end">
        <Button
          onClick={() => push('/settings/datasources')}
        >
          Go back
        </Button>
        <Button 
          type="primary" 
          style={{ 
            marginLeft: 10,
            marginRight: 20
          }}
          onClick={() => id !== 'new' ? this.handleUpdate(id) : this.handleSave()}
        >
          {id !== 'new' ? 'Update' : 'Save'}
        </Button>
      </Row>
      </>);
  }

  handleClose = (removedTag) => {
    const slug = this.state.slug.filter(tag => tag !== removedTag);
    this.setState({ slug });
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  saveInputRef = input => this.input = input;

  private onJsonSchemaInputChanged = async ({ jsObject: schema }) => {

    await this.setState({ schema });
  }

  private handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.slugInputValue;
    let slug = state.slug;
    if (inputValue && slug.indexOf(inputValue) === -1) {
      slug = [...slug, inputValue];
    }

    this.setState({
      slug,
      inputVisible: false,
      slugInputValue: '',
    });
  }

  private async handleSave(): Promise<void> {
    const { 
      history: {
        push
      }
    } = this.props;
    
    const isValid = await this.validate();

    if (!isValid) { return; }

    await client.mutate({
      mutation: CREATE_DATASOURCE,
      variables: {
        type: this.state.type,
        schema: this.state.schema,
        uiSchema: this.state.uiSchema,
        displayInNavigation: this.state.displayInNavigation,
        slug: this.state.slug
      },
      update: async (cache, { data: { createDatasource } }: LooseObject) => {
        await client.query({ query: DATASOURCE_LIST }); 
        push('/settings/datasources');

      }
    })
    .catch((e) => {
      this.setState({ errors: [e] });
    });

  }

  private async handleUpdate(id: string): Promise<void> {
    const { 
      history: {
        push
      }
    } = this.props;
    
    const isValid = await this.validate();

    if (!isValid) { return; }

    await client.mutate({
      mutation: UPDATE_DATASOURCE,
      variables: {
        type: this.state.type,
        schema: this.state.schema,
        uiSchema: this.state.uiSchema,
        displayInNavigation: this.state.displayInNavigation,
        slug: this.state.slug,
        id
      },
      update: async (cache, { data: { updateDatasource } }: LooseObject) => {
        const { data: { datasources } } = await client.query({ query: DATASOURCE_LIST }); 
        cache.writeQuery({
          query: DATASOURCE_LIST,
          data: {
            datasources: [
              ...datasources.map((datasource) => {
                if (datasource.id === updateDatasource.id) { return updateDatasource; }
                return datasource;
              }),
            ]
          }
        });
        push('/settings/datasources');

      }
    })
    .catch((e) => {
      this.setState({ errors: [e] });
    });

  }

  private async validate(): Promise<boolean>  {
    try {
      var valid = validate(this.state.schema);

      if (!valid) {
        await this.setState({ 
          errors: { 
            schema: validate.errors.map(err => (<p>{err.keyword} {err.message}</p>)) 
          } 
        }); 
      }
    } catch (e) {
      await this.setState({ 
        errors: { 
          schema: 'Json schema is not valid.' 
        } 
      }); 
    } 

    if (!this.state.type) {
      await this.setState({ errors: { ...this.state.errors, type: 'Type name is required.'} });
    }

    if (!this.state.slug) {
      await this.setState({ errors: { ...this.state.errors, slug: 'Slug is required.'} });
    } else {
      if (!this.state.slug || !(this.state.slug.length > 0)) {
        await this.setState({ errors: { ...this.state.errors, slug: 'Slug must have at least one key defined.'} });
      }
    }

    if (this.state.errors && Object.keys(this.state.errors).length > 0) {
      return false;
    }
    return true;
  }
}

export default withRouter(DatasourceModal);
