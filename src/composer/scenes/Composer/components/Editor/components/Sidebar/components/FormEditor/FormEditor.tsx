import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import { Button, Icon } from 'antd';
import * as React from 'react';
import { IComponentsServiceLikeClass } from '../../../../../../Composer';
import FormBuilder from '../FormBuilder';

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

class FormEditor extends React.Component<IProperties, {}> {

  public render() {
    const type = this.props.type || '';
    const resource = this.props.componentsService.getComponentResource(type) || null;
    const formResource = resource && resource.form ? resource.form : null;

    const Form = this.props.componentsService.getForm(type);

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
      </div>
    );
  }

}

export default FormEditor;
