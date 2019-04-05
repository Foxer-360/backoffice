import * as React from 'react';
import { IComponentObject, Composer } from '@source/composer';
import { Form, Select, Input, Tooltip, Icon, Modal, List, Divider } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { client } from '@source/services/graphql';
import { websiteId, languageId } from '@source/models/environment/selectors';

const COMPONENT_TEMPLATE_CREATE = gql`
mutation createComponentTemplate(
  $websiteId: ID!, $languageId: ID!, $name: String!, $type: String!, $content: Json!
){
  createComponentTemplate(
    data: {
      name: $name,
      type: $type,
      content: $content,
      language: { connect: { id: $languageId } },
      website: { connect: { id: $websiteId } }
    }
  ) {
    id,
    name,
    type,
    content
  }
}
`;

const COMPONENT_TEMPLATE_UDPATE = gql`
  mutation updateComponentTemplate(
    $id: ID!,
    $name: String!,
    $content: Json!,
  ) {
    updateComponentTemplate(
      data: {
        name: $name,
        content: $content,
      },
      where: {
        id: $id,
      }
    ) {
      id,
      name,
      type,
      content
    }
  }
`;

export interface IProperties {
  website: LooseObject;
  language: LooseObject;
  page: LooseObject;
  templates: LooseObject[];
  composer: Composer;
  componentId: number;
  action: 'edit' | 'use' | null;
  close: () => void;
}

export interface IState {
  id: String;
  name: String;
  loading: boolean;
  template?: LooseObject;
  componentTemplateData: {
    templateId?: string;
    name: string,
    content: LooseObject,
  };
}

class ComponentTemplate extends React.Component<IProperties, IState> {
  state = {
    id: null,
    name: null,
    loading: false,
    template: null,
    componentTemplateData: {
      templateId: null,
      name: null,
      content: null,
    }
  };

  constructor(props: IProperties) {
    super(props);

    this.handleTemplateSave = this.handleTemplateSave.bind(this);
  }

  render() {
    const { componentId, action } = this.props;
    const component = this.props.composer.getComponentById(componentId);

    const onOk =  () => {
      switch (action) {
        case 'edit':
          this.handleTemplateSave(component);
          break;

        case 'use':
        default:
          this.props.close();
          break;
      }
    };

    return (
      <Modal
        onOk={onOk}
        onCancel={() => {
          this.setState({ template: { id: null, name: null } });
          this.props.close();
        }}
        visible={!!this.props.action}
      >
        {action === 'edit' && this.renderTemplateEdit(component)}
        {action === 'use' && this.renderTemplateSelection(component)}
      </Modal>
    );
  }

  private renderTemplateEdit(component: IComponentObject) {
    const { templates } = this.props;
    return (
      <Form
        layout="vertical"
      >
        <Form.Item
          label={
            <>
              Select template
              <Tooltip title="Selected filter will be overwritten.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </>
          }
        >
          <Select
            showSearch={true}
            style={{ width: '100%' }}
            placeholder="Select filter to update"
            optionFilterProp="children"
            onChange={(templateId: string) => {
              const template =  templates.find((t: LooseObject) => t.id === templateId);
              this.setState({ template });
            }}
          >
            {templates
              .filter((t: LooseObject) => t.type === component.name)
              .map((i: LooseObject) => (
              <Select.Option key={i.id} value={i.id}>
                {i.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <>
              Template name
              <Tooltip title="You can change name anytime.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </>
          }
        >
          <Input
            value={this.state.template && this.state.template.name}
            onChange={(e) => this.setState({ template: { name: e.target.value }})}
          />
        </Form.Item>
      </Form>
    );
  }

  private renderTemplateSelection(component: IComponentObject) {
    const { templates, componentId } = this.props;
    return (
      <List
        dataSource={templates.filter((t: LooseObject) => t.type === component.name)}
        renderItem={(item: LooseObject) => (
          <List.Item
            key={item.id}
          >
            <List.Item.Meta
              title={item.name}
              description={
                <>
                  <a
                    onClick={() => {
                      this.props.composer.updateComponent(componentId, { ...component, data: item.content });
                      Modal.destroyAll();
                    }}
                  >
                    copy content
                  </a>  
                  <Divider type="vertical" />
                  <a 
                    onClick={() => {
                      this.props.composer.updateComponent(componentId, { ...component, data: { componentTemplateId: item.id } });
                      Modal.destroyAll();
                    }}
                  >
                    use as template
                  </a>
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  }

  private handleTemplateSave(component: LooseObject) {
    console.log(this.state.template);
    if (!this.state.componentTemplateData.templateId) {
      return client.mutate({
        mutation: COMPONENT_TEMPLATE_CREATE,
        variables: {
          websiteId: this.props.website.id,
          languageId: this.props.language.id,
          name: this.state.template.name,
          type: component.name,
          content: component.data
        }
      }).then(() => {
        this.props.close();
      });
    }

    return client.mutate({
      mutation: COMPONENT_TEMPLATE_UDPATE,
      variables: {
        id: this.state.template.templateId,
        name: this.state.template.name,
        content: component.data
      }
    }).then(() => {
      this.props.close();
    });
  }
}

export default ComponentTemplate;