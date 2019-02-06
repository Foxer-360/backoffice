import { ILooseObject } from '@source/composer/types';
import { Col, Drawer, Input, Pagination, Row, Spin, Icon, List, Button } from 'antd';
import * as React from 'react';
import FileEditor from '../FileEditor';
import UploadFile from '../MutationComponents/UploadFile';

export interface IFileGalleryProps {
  // tslint:disable-next-line:no-any
  placeFile?: any;
  // tslint:disable-next-line:no-any
  file?: any;
  name?: string;
  // tslint:disable-next-line:no-any
  files?: any[];
  loading?: boolean;
}

export interface IFileGalleryState {
  isDrawerVisible: boolean;
  selectedFile: object | null;
}

class FileGallery extends React.Component<IFileGalleryProps, IFileGalleryState> {
  constructor(props: IFileGalleryProps) {
    super(props);

    this.state = { isDrawerVisible: false, selectedFile: null };
  }

  public getFileTypeIcon = (filename: string) => {
    let ext = filename.substr(filename.lastIndexOf('.') + 1);

    switch (ext) {
      case 'xlsx':
      case 'csv':
        return 'file-excel';

      case 'pdf':
        return 'file-pdf';

      case 'txt':
        return 'file-text';

      case 'docx':
        return 'file-word';

      default:
        return 'file';
    }
  }

  public showDrawer = (image?: object) => {
    if (!image) {
      this.setState({ isDrawerVisible: true, selectedFile: null });
    } else {
      this.setState({ isDrawerVisible: true, selectedFile: image });
    }
  }

  public closeDrawer = () => {
    this.setState({ isDrawerVisible: false });
  }

  public onClose = () => {
    this.setState({ isDrawerVisible: false });
  }

  public render() {
    return (
      <div className={'mediaLibrary__gallery'}>
        <Row style={{ marginBottom: '26px' }}>
          <Col span={24}>
            <Input.Search placeholder="Search a file" />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div className={'mediaLibrary__gallery__row'} style={{ height: '570px' }}>
              <List
                className={'mediaLibrary__fileGallery__list'}
                bordered={true}
                loading={this.props.loading}
                renderItem={item => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    actions={[<Button icon={'eye'} type="primary" key={item.id} />]}
                  >
                    <span style={{ marginRight: '15px' }}>
                      <Icon type={this.getFileTypeIcon(item.filename)} style={{ fontSize: '24px' }} />
                    </span>
                    {item.filename}
                  </List.Item>
                )}
                dataSource={this.props.files}
              />
            </div>
          </Col>
        </Row>

        <hr className="hSep" />

        <Drawer
          title="Media Editor"
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.isDrawerVisible}
          destroyOnClose={true}
          width={500}
        >
          <UploadFile
            closeEditor={() => this.closeDrawer()}
            onChange={this.props.placeFile}
          >
            <FileEditor
              name={this.props.name}
              file={this.state.selectedFile}
              onChange={media => {
                this.props.placeFile(media);
                this.closeDrawer();
              }}
              closeEditor={() => this.closeDrawer()}
            />
          </UploadFile>
        </Drawer>
      </div>
    );
  }
}

export default FileGallery;
