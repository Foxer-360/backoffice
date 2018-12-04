import { Button, Drawer, Icon, Popconfirm, Row } from 'antd';
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
  mediaUrl?: string;
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

  public showDrawer = (type: string) => this.setState({ drawerType: type, visible: true });

  public closeDrawer = () => this.setState({ visible: false });

  public dropImage = () => this.props.onChange(null);

  public render() {
    const { mediaData, mediaUrl } = this.props;
    return (
      <div>
        {mediaUrl && (
          <div
            className={'ant-upload ant-upload-select ant-upload-select-picture-card'}
            onClick={() => this.showDrawer('editor')}
            style={{ margin: '32px auto', width: '100%', maxWidth: '250px' }}
          >
            <span className={'ant-upload'}>
              <img style={{ width: '100%' }} src={mediaUrl} alt="file" />
            </span>
          </div>
        )}

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

          {mediaUrl && (
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
          onClose={this.closeDrawer}
          visible={this.state.visible}
          width={500}
          zIndex={1}
          destroyOnClose={true}
        >
          {this.state.drawerType === 'editor' ? (
            <UploadImage closeEditor={() => this.closeDrawer()} onChange={this.props.onChange}>
              <Editor
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
              <Gallery placeImg={this.props.onChange} image={mediaData}/>
            </AllImagesQuery>
          )}
        </Drawer>
      </div>
    );
  }
}

export default MediaLibrary;
