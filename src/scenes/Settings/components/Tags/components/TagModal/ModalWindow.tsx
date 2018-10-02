import * as React from 'react';
import { Col, Input, Checkbox, Select, Modal, Row, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Component } = React;

interface Properties {
  data?: LooseObject;
  visible: boolean;
  edit: boolean;
  onCancel: () => void;
  onSave: (name: string, displayInNavigation: boolean, color: string, plugins: string[]) => void;
}

interface State {
  name: string;
  displayInNavigation: boolean;
  color: string;
  plugins: string[];
}

class ModalWindow extends Component<Properties, State> {

  private DEFAULT: State = {
    name: '',
    displayInNavigation: false,
    color: '#FFF',
    plugins: [],
  };

  constructor(props: Properties) {
    super(props);

    if (props.edit && props.data) {
      this.state = {
        name: props.data.name,
        displayInNavigation: props.data.displayInNavigation,
        color: props.data.color,
        plugins: props.data.plugins
      };
    } else {
      this.state = { ...this.DEFAULT };
    }

    this.handleChangePlugins = this.handleChangePlugins.bind(this);
  }

  public componentWillReceiveProps(props: Properties) {
    if (props.edit && props.data) {
      this.setState({
        name: props.data.name,
        displayInNavigation: props.data.displayInNavigation,
        color: props.data.color,
        plugins: props.data.plugins,
      });
    }
  }

  public render() {

    const labelSize = 4;
    const labelStyle = { padding: '6px 12px' };
    const colorInputStyle = this.state.color
      ? { borderBottom: `4px solid ${this.state.color}`, paddingBottom: '1px' }
      : {};

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
            <span>Name:</span>
          </Col>
          <Col span={20} style={{ paddingRight: '20px' }}>
            <Input
              value={this.state.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ name: e.target.value })}
            />
          </Col>
        </Row>

        <Row style={{ marginBottom: '20px' }}>
          <Col span={labelSize} style={labelStyle}>
            <span>Color:</span>
          </Col>
          <Col span={20} style={{ paddingRight: '20px' }}>
            <Input
              value={this.state.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ color: e.target.value })}
              style={colorInputStyle}
            />
          </Col>
        </Row>

        <Row style={{ marginBottom: '20px' }}>
          <Col span={labelSize} style={labelStyle}>
            <span>Plugins:</span>
          </Col>
          <Col span={24 - labelSize} style={{ paddingRight: '20px' }}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              onChange={this.handleChangePlugins}
              placeholder="Select plugins for this page type"
              value={this.state.plugins}
            >
              <Select.Option key="seo" value="seo">SEO</Select.Option>
            </Select>
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

  private handleChangePlugins(value: string[]) {
    this.setState({
      plugins: value
    });
  }

  private handleCancel(): void {
    this.props.onCancel();
    this.setState({ ...this.DEFAULT });
  }

  private handleSave(): void {
    if (this.state.name && this.state.name.length) {
      this.props.onSave(
        this.state.name,
        this.state.displayInNavigation,
        this.state.color,
        this.state.plugins
      );
      this.setState({ ...this.DEFAULT });
    } else {
      message.error('Name can not be empty!');
    }
  }
}

export default ModalWindow;
