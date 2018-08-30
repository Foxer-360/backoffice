import * as React from 'react';
import { Button, Col, Input, Modal, Row, Select } from 'antd';
import Composer from '@source/scenes/Composer';
import componentService from '@source/services/components';
import pluginsService from '@source/services/plugins';
import { ComponentObject } from '@source/scenes/Composer/Composer';
import { IContent } from 'delta';

const { Component } = React;

export interface Properties {
  data?: LooseObject;
  visible: boolean;

  onCancel?: () => void;
  onSave?: (data: LooseObject) => void;
}

export interface State {
  name: string;
  plugins: string[];
  content: IContent;

  editorVisible: boolean;
}

class ModalWindow extends Component<Properties, State> {

  private RESET_STATE = {
    name: '',
    plugins: [],
    content: null,

    editorVisible: false,
  } as State;

  private composer: Composer;

  constructor(props: Properties) {
    super(props);

    this.state = {
      ...this.RESET_STATE,
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleChangePlugins = this.handleChangePlugins.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleOpenEditor = this.handleOpenEditor.bind(this);
    this.handleCloseEditor = this.handleCloseEditor.bind(this);
  }

  public componentDidMount() {
    if (this.props.data) {
      this.setState({
        name: this.props.data.name,
        plugins: this.props.data.plugins,
        content: this.props.data.content,
      });
    }
  }

  public componentWillReceiveProps(nextProps: Properties) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.setState({
        name: nextProps.data.name,
        plugins: nextProps.data.plugins,
        content: nextProps.data.content,
      });
    }
  }

  public render() {
    const isEditing = this.props.data ? true : false;
    const labelSize = 4;
    const labelStyle = { padding: '6px 12px' };

    return (
      <>
        <Modal
          title={isEditing ? 'Edit Page Type' : 'Create New Page Type'}
          visible={this.props.visible}
          onCancel={this.handleCancel}
          onOk={this.handleSave}
          okText={isEditing ? 'Save' : 'Create'}
        >
          <Row style={{ marginBottom: '14px' }}>
            <Col span={labelSize} style={labelStyle}>
              <span>Name:</span>
            </Col>
            <Col span={24 - labelSize} style={{ paddingRight: '20px' }}>
              <Input value={this.state.name} onChange={this.handleNameChange} />
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
            <Col span={24} style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={this.handleOpenEditor}>Open Content Editor</Button>
            </Col>
          </Row>
        </Modal>

        <Modal
          visible={this.state.editorVisible}
          onCancel={this.handleCloseEditor}
          onOk={this.handleCloseEditor}
          width={1280}
          closable={false}
          footer={null}
          style={{ top: '20px' }}
          maskClosable={false}
        >
          <Composer
            componentService={componentService}
            pluginService={pluginsService}
            onSave={this.handleCloseEditor}
            layouts={true}
            ref={node => {
              this.composer = node;
              if (this.composer) {
                if (this.state.content) {
                  this.composer.setContent(this.state.content);
                }
              }
            }}
          />
        </Modal>
      </>
    );
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    this.setState({
      name: value,
    });
  }

  private handleChangePlugins(value: string[]) {
    this.setState({
      plugins: value
    });
  }

  private handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }

    // Reset values
    this.setState({
      ...this.RESET_STATE,
    });
  }

  private handleSave() {
    const data = {
      name: this.state.name,
      content: this.state.content,
      plugins: this.state.plugins
    };

    if (this.props.onSave) {
      this.props.onSave(data);
    }

    // Reset values
    this.setState({
      ...this.RESET_STATE,
    });
  }

  private handleOpenEditor() {
    this.setState({
      editorVisible: true,
    });
  }

  private handleCloseEditor() {
    // Set default content and hide modal
    const data = this.composer.getData();

    this.setState({
      editorVisible: false,
      content: data.content,
    });
  }

}

export default ModalWindow;
