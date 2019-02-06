import * as React from 'react';
import { ILooseObject } from '@source/composer/types';
import { Button, Col, Icon, Row, Spin, Upload, Input } from 'antd';
// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface FileEditorProps {
  uploadFile?: (fileList: ILooseObject, mediaData?: ILooseObject) => void;
  onChange?: (media: object) => void;
  closeEditor?: () => void;
  loading?: boolean;
  name: string;
  // tslint:disable:no-any
  file?: any;
}

export interface FileEditorState {
  // tslint:disable:no-any
  fileList: any;
}

export default class FileEditor extends React.Component<FileEditorProps, FileEditorState> {
  constructor(props: FileEditorProps) {
    super(props);
    this.state = {
      fileList: [],
    };
  }

  public render() {
    const { fileList } = this.state;

    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div className={'mediaLibrary__editor'}>  
        <Row>
          <Col span={24}>
            <Upload {...props}>
              <Button>
                <Icon type={this.props.loading ? 'loading' : 'plus'} />
                Select File
              </Button>
            </Upload>
          </Col>
        </Row>

        <hr className={'hSep'} />
        <Row>
          <Col span={24}>
            <Button
              type={'primary'}
              style={{ marginRight: '16px' }}
              onClick={() => {
                this.props.uploadFile(this.state.fileList, {
                  type: 'file',
                });
              }}
            >
              Place
            </Button>

            <Button type="danger" onClick={() => this.props.closeEditor()}>
              Close
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}
