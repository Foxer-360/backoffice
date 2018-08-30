import * as React from 'react';
import { Button, Col, Icon, Row } from 'antd';
import { ComponentsServiceLikeClass } from '../../../../../../Composer';
import FormBuilder from '../FormBuilder';

const { Component } = React;

export interface Properties {
  type: string; // Type of Component which you want to edit
  data: LooseObject; // Data for form

  onChange: (data: LooseObject) => void; // When form make some change fires this method with new data
  onSave: () => Promise<boolean>; // Save data
  onCancel: () => Promise<boolean>; // Cancel, revert data

  componentsService: ComponentsServiceLikeClass;
}

class FormEditor extends Component<Properties, {}> {

  render() {
    const resource = this.props.componentsService.getComponentResource(this.props.type) || null;
    const formResource = resource && resource.form ? resource.form : null;

    const Form = this.props.componentsService.getForm(this.props.type);

    return (
      <div className={'formEditor'}>
        {formResource ?
          <FormBuilder
            form={formResource}
            data={this.props.data}
            onChange={this.props.onChange}
          />
          :
          <Form
            data={this.props.data}
            onChange={this.props.onChange}
          />
        }

        <hr
          style={{
            marginTop: '24px',
            border: '0',
            borderTop: '1px solid #e6e6e6',
            marginBottom: '12px'
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
      </div>
    );
  }

}

export default FormEditor;
