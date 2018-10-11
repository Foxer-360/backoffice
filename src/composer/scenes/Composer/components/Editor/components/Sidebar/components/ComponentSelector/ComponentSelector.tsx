import { ILooseObject } from '@source/composer/types';
import { Alert, Button, List } from 'antd';
import * as React from 'react';
import { IComponentsServiceLikeClass } from '../../../../../../Composer';
import Card from '../Card';

// import './style.css';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IProperties {
  componentsService: IComponentsServiceLikeClass;

  layouts?: boolean;

  onAdd: (type: string) => void;
  dragStart: (data: ILooseObject) => void;
  dragEnd: () => void;
  addContainer: () => void;
}

class ComponentSelector extends React.Component<IProperties, {}> {

  public render() {
    const data = this.props.componentsService.getAllowedTypes().sort();
    let desc = 'To add new component into content you can drag';
    desc += ' component from list below and drop it to position you want';

    return (
      <>
        {this.props.layouts && (
          <div style={{marginBottom: '16px'}}>
              <Button onClick={this.props.addContainer}>Add Container</Button>
          </div>
        )}
        <Alert message="Tip" description={desc} type="info" style={{ marginBottom: '18px' }} />
        <List
          dataSource={data}
          renderItem={(item: string) => (
            <List.Item className="selector-list-item">
              <div onClick={() => this.props.onAdd(item)} style={{ width: '100%' }}>
                <Card dragStart={this.props.dragStart} dragEnd={this.props.dragEnd} type={item} />
              </div>
            </List.Item>
          )}
        />
      </>
    );
  }

}

export default ComponentSelector;
