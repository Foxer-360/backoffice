import * as React from 'react';
import { Col, Input, Modal, Row, message } from 'antd';

const { Component } = React;

interface Properties {
  visible: boolean;
  edit: boolean;
  name: string;
  onCancel: () => void;
  onSave: (name: string) => void;
}

interface State {
  name: string;
}

class ModalWindow extends Component<Properties, State> {

  private DEFAULT: State = {
    name: '',
  };

  constructor(props: Properties) {
    super(props);
    if (props.edit && props.name) {
      this.state = { name: props.name };
    } else {
      this.state = { ...this.DEFAULT };
    }
  }

  componentWillReceiveProps(props: Properties) {
    if (props.edit && props.name) {
      this.setState({
        name: props.name
      });
    }
  }

  handleCancel(): void {
    this.props.onCancel();
    this.setState({ ...this.DEFAULT });
  }

  handleSave(): void {
    if (this.state.name && this.state.name.length) {
      this.props.onSave(this.state.name);
      this.setState({ ...this.DEFAULT });
    } else {
      message.error('Name can not be empty!');
    }
  }

  render() {
    return (
      <Modal
        title={'Create new navigation'}
        okText={this.props.edit ? 'Save' : 'Create'}
        visible={this.props.visible}
        onCancel={() => this.handleCancel()}
        onOk={() => this.handleSave()}
      >
        <Row>
          <Col span={4} style={{ padding: '6px 12px' }}>
            <span>Name:</span>
          </Col>
          <Col span={20} style={{ paddingRight: '20px' }}>
            <Input
              value={this.state.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ name: e.target.value })}
            />
          </Col>
        </Row>
      </Modal>
    );
  }

}

export default ModalWindow;
