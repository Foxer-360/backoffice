import { ILooseObject } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import { IComponentsServiceLikeClass } from '../../../../Composer';
import ComponentSelector from './components/ComponentSelector';
import FormEditor from './components/FormEditor';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  selectedComponent: number | null;
  data: ILooseObject;
  type: string | null;

  layouts?: boolean;

  onAdd: (name: string) => void;
  onChange: (data: ILooseObject) => void;
  onSave: () => Promise<boolean>;
  onCancel: () => Promise<boolean>;

  componentsService: IComponentsServiceLikeClass;

  context: Context;

  dragStart: (data: ILooseObject) => void;
  dragEnd: () => void;

  addContainer: () => void;
}

class Sidebar extends React.Component<IProperties, {}> {

  public render() {
    // const isSelected = Number.isInteger(this.props.selectedComponent);
    const isSelected = (this.props.selectedComponent) ? true : false;

    return (
      <div style={{ padding: '6px' }}>
        { isSelected ?
            <FormEditor
              type={this.props.type}
              data={this.props.data}

              onCancel={this.props.onCancel}
              onChange={this.props.onChange}
              onSave={this.props.onSave}

              componentsService={this.props.componentsService}
              context={this.props.context}
            />
          :
            <ComponentSelector
              onAdd={(name: string) => this.props.onAdd(name)}
              componentsService={this.props.componentsService}
              dragStart={this.props.dragStart}
              dragEnd={this.props.dragEnd}
              addContainer={this.props.addContainer}
              layouts={this.props.layouts}
            />
        }
      </div>
    );
  }

}

export default Sidebar;
