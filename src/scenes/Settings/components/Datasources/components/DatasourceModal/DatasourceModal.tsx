import * as React from 'react';
import { Col, Input, Checkbox, Select, Modal, Row, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

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
  schema: string;
  displayInNavigation: boolean;
}

class DatasourceModal extends Component<Properties, State> {

  private DEFAULT: State = {
    type: '',
    schema: '',
    displayInNavigation: false,
  };

  constructor(props: Properties) {
    super(props);

    if (props.edit && props.data) {
      this.state = {
        type: props.data.type,
        schema: props.data.schema,
        displayInNavigation: props.data.displayInNavigation,
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

    const labelSize = 4;
    const labelStyle = { padding: '6px 12px' };

    return (
      <Modal
        title={'Create new tag'}
        okText={this.props.edit ? 'Save' : 'Create'}
        visible={this.props.visible}
        onCancel={() => this.handleCancel()}
        onOk={() => this.handleSave()}
      >
        <Row style={{ marginBottom: '20px' }}>
          <Col span={labelSize} style={labelStyle}>
            <span>Type:</span>
          </Col>
          <Col span={20} style={{ paddingRight: '20px' }}>
            <Input
              value={this.state.type}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ type: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col span={labelSize} style={{ padding: '0 12px' }}>
            &nbsp;
          </Col>
          <Col span={20}>
            <Checkbox
              checked={this.state.displayInNavigation}
              onChange={(e: CheckboxChangeEvent) =>
                this.setState({ displayInNavigation: e.target.checked })}
            >
              Display in navigation
            </Checkbox>
          </Col>
        </Row>
      </Modal>
    );
  }

  private handleCancel(): void {
    this.props.onCancel();
    this.setState({ ...this.DEFAULT });
  }

  private handleSave(): void {
    if (this.state.type && this.state.type.length) {
      this.props.onSave(
        this.state.type,
        this.state.displayInNavigation,
        this.state.schema,
      );
      this.setState({ ...this.DEFAULT });
    } else {
      message.error('Name can not be empty!');
    }
  }
}

export default DatasourceModal;
