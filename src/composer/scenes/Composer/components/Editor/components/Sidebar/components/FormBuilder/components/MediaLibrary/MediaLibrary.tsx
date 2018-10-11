import { getImgUrl } from '@source/composer/utils';
import { Button, Col, Drawer, Icon, Input, Popconfirm, Row } from 'antd';
import * as React from 'react';
import Editor from './Components/Editor';
import Gallery from './Components/Gallery';
import UploadImage from './Components/MutationComponents/UploadImage';
import AllImagesQuery from './Components/QueryComponents';
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
            {this.state.drawerType === 'editor' ? 'Media Editor: ' + this.props.name.toUpperCase() : 'Media Library'}
          </span>
        </div>

        {mediaData &&
          mediaData.filename && (
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

        <Row style={{ margin: '0 0 24px' }}>
          <Col span={24}>
            <label>Image alt text </label>
            <Input
              onChange={e => this.onChangeAlt(e.target.value)}
              value={mediaData && mediaData.alt ? mediaData.alt : ''}
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

          {mediaData && (
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
          zIndex={1}
          destroyOnClose={true}
        >
          {this.state.drawerType === 'editor' ? (
            <UploadImage closeEditor={() => this.closeDrawer()} onChange={this.props.onChange}>
              <Editor
                name={this.props.name}
                image={mediaData}
                onChange={media => {
                  this.props.onChange(media);
                  this.closeDrawer();
                }}
                closeEditor={() => this.closeDrawer()}
              />
            </UploadImage>
          ) : (
            <AllImagesQuery>
              <Gallery placeImg={this.props.onChange} image={mediaData} name={this.props.name} />
            </AllImagesQuery>
          )}
        </Drawer>

        <hr className={'hSep'} />
      </div>
    ); 
  }
}

export default MediaLibrary;
