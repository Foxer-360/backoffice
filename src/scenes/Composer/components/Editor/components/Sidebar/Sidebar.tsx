import * as React from 'react';
import ComponentSelector from './components/ComponentSelector';
import FormEditor from './components/FormEditor';
import { ComponentsServiceLikeClass } from '../../../../Composer';

const { Component } = React;

export interface Properties {
  selectedComponent: number | null;
  data: LooseObject;
  type: string | null;

  layouts?: boolean;

  onAdd: (name: string) => void;
  onChange: (data: LooseObject) => void;
  onSave: () => Promise<boolean>;
  onCancel: () => Promise<boolean>;

  componentsService: ComponentsServiceLikeClass;

  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;

  addContainer: () => void;
}

class Sidebar extends Component<Properties, {}> {

  render() {
    // const isSelected = Number.isInteger(this.props.selectedComponent);
    const isSelected = (this.props.selectedComponent) ? true : false;
    // tslint:disable-next-line:no-console
    console.log('SIDEBAR', isSelected);

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
