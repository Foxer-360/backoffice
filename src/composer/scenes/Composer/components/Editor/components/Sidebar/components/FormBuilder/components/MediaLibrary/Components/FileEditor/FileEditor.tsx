import * as React from 'react';
import { ILooseObject } from '@source/composer/types';
import { Button, Col, Icon, Row, Upload, Popconfirm } from 'antd';
// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface FileEditorProps {
  uploadFile?: (fileList: ILooseObject, mediaData?: ILooseObject) => void;
  deleteFile?: (id: LooseObject) => void;
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
            {!this.props.file && (
              <Upload {...props}>
                <Button>
                  <Icon type={this.props.loading ? 'loading' : 'plus'} />
                  Select File
                </Button>
              </Upload>
            )}

            {this.props.file && (
              <span>
                <Icon type={'file'} />
                {' ' + this.props.file.filename}
              </span>
            )}
          </Col>
        </Row>

        <hr className={'hSep'} />
        <Row justify={'space-between'} type={'flex'}>
          <Col span={12}>
            <Button
              type={'primary'}
              style={{ marginRight: '16px' }}
              onClick={() => {
                if (!this.props.file) {
                  this.props.uploadFile(this.state.fileList, {
                    type: 'file',
                  });
                } else {
                  this.props.onChange({
                    name: this.props.name,
                    value: { ...this.props.file, type: 'file' },
                  });
                }
              }}
            >
              Place
            </Button>

            <Button type="danger" onClick={() => this.props.closeEditor()}>
              Close
            </Button>
          </Col>

          <Col span={5} offset={7} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Popconfirm
              title="Are you sure delete this file?"
              onConfirm={() => this.props.deleteFile(this.props.file.id)}
              okText="Yes"
              cancelText="No"
              icon={<Icon type="exclamation-circle" />}
            >
              <Button type="danger" icon="trash">
                Delete
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    );
  }
}
