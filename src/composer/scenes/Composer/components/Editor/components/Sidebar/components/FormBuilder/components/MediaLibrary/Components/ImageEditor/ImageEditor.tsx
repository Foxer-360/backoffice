import { ILooseObject } from '@source/composer/types';
import { getImgUrl } from '@source/composer/utils';
import { Button, Col, Icon, Row, Spin, Upload, Popconfirm } from 'antd';
import * as React from 'react';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IImageEditorProps {
  // tslint:disable:no-any
  image?: any;
  uploadImage?: (fileList: ILooseObject, mediaData?: ILooseObject) => void;
  loading?: boolean;
  onChange?: (media: object) => void;
  closeEditor?: () => void;
  deleteImage?: (id: string) => void;
  name: string;
}

export interface IImageEditorState {
  // tslint:disable:no-any
  fileList: any;
  image64: any;
}

function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class ImageEditor extends React.Component<IImageEditorProps, IImageEditorState> {
  constructor(props: IImageEditorProps) {
    super(props);
    this.state = {
      fileList: [],
      image64: null,
    };
  }

  public componentWillUnmount() {
    this.setState({
      fileList: null,
      image64: null,
    });
  }

  // tslint:disable:no-any
  public getImageInfo = (image: any) => {
    const mb = parseInt(image.size, 0) / 1048576;
    return `${400} x ${400}` + ' - ' + mb.toFixed(4) + 'Mb ';
  }

  public render() {
    const uploadButton = (
      <div>
        <Icon type={this.props.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{this.props.loading ? 'Uploading...' : 'Upload'} </div>
      </div>
    );

    const props = {
      beforeUpload: (file: any) => {
        getBase64(file, (image64: any) => {
          file.base64 = image64;
          this.setState({
            fileList: [file],
          });
        });
        return false;
      },
      className: 'avatar-uploader',
      fileList: this.state.fileList,
      multiple: false,
      name: 'file',
      showUploadList: false,
    };

    const { image } = this.props;

    const uploadedFile = this.state.fileList[0];
    const imageBase64 = uploadedFile && uploadedFile.base64;

    return (
      <div className="mediaLibrary__editor">
        {this.props.loading && (
          <div className={'mediaLibrary__editor__spin'}>
            <Spin />
          </div>
        )}

        {!this.props.loading && (
          <>
            <Row>
              <Col span={24}>
                <Upload {...props} listType={'picture-card'}>
                  {imageBase64 && <img src={imageBase64} alt="file" />}
                  {image && image.filename && !imageBase64 && <img src={getImgUrl(image)} alt="file" />}
                  {!imageBase64 && !image && uploadButton}
                </Upload>

                <p className="imageInfo">
                  {!uploadedFile && image && this.getImageInfo(image)}
                  {uploadedFile && this.getImageInfo(uploadedFile)}
                </p>

                <p className="imageInfo">
                  {uploadedFile && uploadedFile.name}
                  {!uploadedFile && image && image.filename}
                </p>
              </Col>
            </Row>

            <hr className={'hSep'} />

            <Row justify={'space-between'} type={'flex'}>
              <Col span={12}>
                <Button
                  type={'primary'} // tslint:disable:no-console
                  onClick={() => {
                    if (imageBase64) {
                      if (this.props.uploadImage) {
                        this.props.uploadImage(this.state.fileList, {
                          type: 'image',
                        });
                      }
                    } else {
                      if (this.props.onChange) {
                        this.props.onChange({
                          name: this.props.name,
                          value: { ...image, type: 'image' },
                        });
                      }
                    }
                  }}
                  style={{ marginRight: '16px' }}
                >
                  Place
                </Button>

                <Button
                  type="danger"
                  onClick={() => {
                    if (this.props.closeEditor) {
                      this.props.closeEditor();
                    }
                  }}
                >
                  Close
                </Button>
              </Col>

              <Col span={5} offset={7} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Popconfirm
                  title="Are you sure delete this image?"
                  onConfirm={() => this.props.deleteImage(this.props.image.id)}
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
          </>
        )}
      </div>
    );
  }
}

export default ImageEditor;
