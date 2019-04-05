import * as React from 'react';
import { Form, Select, Input, Tooltip, Icon } from 'antd';

export interface IProperties {
  templates: LooseObject[];
  template: LooseObject;
  component: LooseObject;
  website: LooseObject;
  language: LooseObject;
  page: LooseObject;
  onChange: (field: string, value: string) => void;
}

export interface IState {
  id: String;
  name: String;
  loading: boolean;
}

class ComponentTemplateModal extends React.Component<IProperties, IState> {
  state = {
    id: null,
    name: null,
    loading: false,
  };

  constructor(props: IProperties) {
    super(props);
  }

  render() {
    const { component, page } = this.props; 

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
              onChange={(val: string) => this.props.onChange('templateId', val)}
            >
              {this.props.templates.map((i: LooseObject) => (
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
              defaultValue={this.props.template.name || `${component.name}, ${page.name}`}
              onChange={(e) => this.props.onChange('name', e.target.value)}
            />
          </Form.Item>
        </Form>
    );
  }
}

export default ComponentTemplateModal;