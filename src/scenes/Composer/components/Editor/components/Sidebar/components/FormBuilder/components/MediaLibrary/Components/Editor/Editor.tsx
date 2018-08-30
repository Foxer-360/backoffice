import * as React from 'react';
import { Button, Icon, Row, Col, Input, Upload } from 'antd';

export interface EditorProps {}

export interface EditorState {
  loading: boolean;
}

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = { loading: false };
  }

  // tslint:disable:no-any
  handleChange = (info: any) => {
    // tslint:disable:no-console
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
  }

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{this.state.loading ? 'Uploading...' : 'Upload'} </div>
      </div>
    );

    return (
      <div className="mediaLibrary__editor">
        <Row>
          <Col span={24}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="//jsonplaceholder.typicode.com/posts/"
              onChange={this.handleChange}
            >
              {uploadButton}
            </Upload>

            <p className="imageInfo">400 x 400, 5mb</p>
            <p className="imageInfo">Image name</p>
          </Col>
        </Row>

        <hr className={'hSep'} />

        <Row>
          <Col span={24}>
            <label>Name</label>
            <Input />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <label>Alt</label>
            <Input />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Button type="primary">Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Editor;
