import * as React from 'react';
import { Alert, Button, List } from 'antd';
import Card from '../Card';
import { ComponentsServiceLikeClass } from '../../../../../../Composer';

import './style.css';

const { Component } = React;

export interface Properties {
  componentsService: ComponentsServiceLikeClass;

  layouts?: boolean;

  onAdd: (type: string) => void;
  dragStart: (data: LooseObject) => void;
  dragEnd: () => void;
  addContainer: () => void;
}

class ComponentSelector extends Component<Properties, {}> {

  private COLUMN_SIZE = 8;
  private GUTTER_SIZE = 12;

  render() {
    const data = this.props.componentsService.getAllowedTypes().sort();
    let desc = 'To add new component into content you can drag';
    desc += ' component from list below and drop it to position you want';

    return (
      <>
        {this.props.layouts && (
          <Button onClick={this.props.addContainer}>Add Container</Button>
        )}
        <Alert
          message="Tip"
          description={desc}
          type="info"
          style={{ marginBottom: '18px' }}
        />
        <List
          dataSource={data}
          renderItem={(item: string) => (
            <List.Item className="selector-list-item">
              <div onClick={() => this.props.onAdd(item)} style={{ width: '100%' }}>
                <Card
                  dragStart={this.props.dragStart}
                  dragEnd={this.props.dragEnd}
                  type={item}
                />
              </div>
            </List.Item>
          )}
        />
      </>
    );
  }

}

export default ComponentSelector;
