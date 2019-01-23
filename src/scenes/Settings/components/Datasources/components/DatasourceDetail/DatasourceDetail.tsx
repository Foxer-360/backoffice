import * as React from 'react';
import { Col, Input, Checkbox, Button, Row, Alert, Form } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import * as Ajv from 'ajv';
import metaSchema from './meta-schema.json';
import gql from 'graphql-tag';
import { client } from '@source/services/graphql';
import { throwServerError } from 'apollo-link-http-common';

const ajv = new Ajv();
const validate = ajv.compile(metaSchema);

const { Component } = React;

interface Properties {
  data?: LooseObject;
  visible: boolean;
  edit: boolean;
  onCancel: () => void;
  onSave: (type: string, displayInNavigation: boolean, schema: string) => void;
}

interface State {
  type: string;
  schema?: string;
  displayInNavigation: boolean;
  slug: string;
  errors: LooseObject;
}

const CREATE_DATASOURCE = gql`
mutation createDatasource($type: String!, $schema: Json!, $displayInNavigation: Boolean!, $slug: String!) {
  createDatasource(data: { 
    type: $type
    schema: $schema
    displayInNavigation: $displayInNavigation
    slug: $slug
  }) {
    id
    type
    schema
    displayInNavigation
    slug
  }
}
`;

class DatasourceModal extends Component<Properties, State> {

  private DEFAULT: State = {
    type: '',
    schema: '',
    displayInNavigation: false,
    slug: '',
    errors:  null
  };

  constructor(props: Properties) {
    super(props);

    if (props.edit && props.data) {
      this.state = {
        type: props.data.type,
        schema: props.data.schema,
        displayInNavigation: props.data.displayInNavigation,
        slug: props.data.slug,
        errors: {}
      };
    } else {
      this.state = { ...this.DEFAULT };
    }

  }

  public componentWillReceiveProps(props: Properties) {
    if (props.edit && props.data) {
      this.setState({
        type: props.data.type,
        displayInNavigation: props.data.displayInNavigation,
      });
    }
  }

  public render() {

    const { errors } = this.state;

    return (
      <>
        <Row style={{ marginBottom: '20px' }}>
          <h2>New datasource:</h2>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Row>
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
            </Row>
            <Row style={{ marginBottom: '20px' }}>
              <Form.Item
                label="Slug"
                {...((errors && errors.slug) ? { 
                  validateStatus: 'error', 
                  help: errors.slug
                } : {})}
              >
                <Input
                  value={this.state.slug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ slug: e.target.value })}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item
                label="Display in navigation"
              >
                <Checkbox
                  checked={this.state.displayInNavigation}
                  onChange={(e: CheckboxChangeEvent) =>
                    this.setState({ displayInNavigation: e.target.checked })}
                />
              </Form.Item>
            </Row>
          </Col>
          <Col span={12}>
            <Row style={{ marginBottom: '20px' }}>
              <span>Schema:</span><br/>
              <JSONInput
                id={'schema'}
                placeholder={{
                  'type': 'object',
                  'properties': {
                    'example_field': { 'type': 'string' }
                  },
                  'required': [ 'example_field' ]
                }}
                modifyErrorText={(e) => {
                  console.log(e);

                  return e;
                }}
                colors={['dark_vscode_tribute']}
                locale={locale}
                width={'100%'}
                onChange={(data) => this.setState({ schema: data.jsObject })}
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
            </Row>
          </Col>
        </Row>
        <Row type="flex" justify="end">
          <Button>Go back</Button>
          <Button 
            type="primary" 
            style={{ 
              marginLeft: 10,
              marginRight: 20
            }}
            onClick={() => this.handleSave()}
          >
            Save
          </Button>
        </Row>
       
      </>
    );
  }

  private handleCancel(): void {
    this.props.onCancel();
    this.setState({ ...this.DEFAULT });
  }

  private async handleSave(): Promise<void> {
    console.log(this.state.schema);
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
      if (!/^[a-z]+$/.test(this.state.slug)) {
        await this.setState({ errors: { ...this.state.errors, slug: 'Slug is consisted only from alphabetic characters in lowercase.'} });
      }
    }

    if (this.state.errors && Object.keys(this.state.errors).length > 0) {
      return;
    }

    await client.mutate({
      mutation: CREATE_DATASOURCE,
      variables: {
        type: this.state.type,
        schema: this.state.schema,
        displayInNavigation: this.state.displayInNavigation,
        slug: this.state.slug
      }
    })
    .then(() => {
      console.log('success');
    })
    .catch((e) => {
      this.setState({ errors: [e] });
    });

  }
}

export default DatasourceModal;
