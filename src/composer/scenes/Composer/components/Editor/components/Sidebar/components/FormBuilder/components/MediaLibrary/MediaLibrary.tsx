import { getImgUrl } from '@source/composer/utils';
import { Button, Col, Drawer, Icon, Input, Popconfirm, Row } from 'antd';
import * as React from 'react';
import GalleryTabs from './Components/GalleryTabs';
import UploadTabs from './Components/UploadTabs';
// import './style.scss';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IMediaLibraryProps {
  // tslint:disable:no-any
  onChange?: any;
  mediaData: any;
  name: string;
}

export interface IMediaLibraryState {
  visible: boolean;
  drawerType: string;
}

class MediaLibrary extends React.Component<IMediaLibraryProps, IMediaLibraryState> {
  constructor(props: IMediaLibraryProps) {
    super(props);
    this.state = {
      drawerType: 'editor',
      visible: false,
    };
  }

  public showDrawer = (type: string) => {
    this.setState({
      drawerType: type,
      visible: true,
    });
  }

  public closeDrawer = () => {
    this.setState({
      visible: false,
    });
  }

  public onClose = () => {
    this.setState({
      visible: false,
    });
  }

  public onChangeAlt = (altValue: string) => {
    const data = { value: { ...this.props.mediaData, alt: altValue }, name: this.props.name };

    this.props.onChange(data);
  }

  public dropImage() {
    this.props.onChange({ value: null, name: this.props.name });
  }

  public render() {
    const { mediaData } = this.props;
    return (
      <div>
        <div className={'ant-divider ant-divider-horizontal ant-divider-with-text-left'}>
          <span className={'ant-divider-inner-text'}>
            {this.state.drawerType === 'editor' ? 'Media Editor: ' : 'Media Library'}
          </span>
        </div>

        {mediaData && mediaData.filename && (
          <div
            className={'ant-upload ant-upload-select ant-upload-select-picture-card'}
            onClick={() => this.showDrawer('editor')}
            style={{ margin: '32px auto', width: '100%', maxWidth: '250px' }}
          >
            <span className={'ant-upload'}>
              <img style={{ width: '100%' }} src={getImgUrl(mediaData)} alt="file" />
            </span>
          </div>
        )}

        {mediaData && mediaData.type === 'embeddedVideo' && (
          <iframe src={mediaData.url} style={{ width: '100%', height: '300px' }} />
        )}

        <Row style={{ margin: '0 0 24px' }}>
          <Col span={24}>
            <label>Image alt text </label>
            <Input
              onChange={e => this.onChangeAlt(e.target.value)}
              defaultValue={mediaData && mediaData.alt ? mediaData.alt : ''}
              placeholder={'Alt Text'}
            />
          </Col>
        </Row>

        <Row gutter={6} style={{ display: 'flex', justifyContent: 'left', padding: '0 3px' }}>
          <Button onClick={() => this.showDrawer('editor')} style={{ marginRight: '16px', minWidth: '105px' }}>
            <Icon type={'upload'} /> Upload
          </Button>
          <Button
            type="primary"
            icon="search"
            onClick={() => this.showDrawer('gallery')}
            style={{ minWidth: '105px', marginRight: '16px' }}
          >
            Search
          </Button>

          {mediaData && Object.keys(mediaData).length !== 0 && (
            <Popconfirm
              placement="topLeft"
              title={'Are you sure you want to delete the image?'}
              okText="Yes"
              onConfirm={() => this.dropImage()}
              cancelText="No"
              icon={<Icon type="exclamation-circle" style={{ color: 'red', fontSize: '16px' }} />}
            >
              <Button type={'danger'}>
                <Icon type={'close-circle'} />
              </Button>
            </Popconfirm>
          )}
        </Row>

        <Drawer
          title="Media Library"
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
          width={500}
          zIndex={1200}
          style={{ position: 'relative' }}
          destroyOnClose={true}
        >
          {this.state.drawerType === 'editor' ? (
            <UploadTabs
              onChange={this.props.onChange}
              name={this.props.name}
              mediaData={mediaData}
              closeDrawer={this.closeDrawer}
            />
          ) : (
            <GalleryTabs placeMedia={this.props.onChange} name={this.props.name} media={mediaData} />
          )}
        </Drawer>

        <hr className={'hSep'} />
      </div>
    );
  }
}

export default MediaLibrary;
