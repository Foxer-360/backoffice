import { ILooseObject } from '@source/composer/types';
import { Col, Drawer, Input, Pagination, Row } from 'antd';
import * as React from 'react';
import Editor from '../Editor/Editor';
import UploadImage from '../MutationComponents/UploadImage';
import GalleryCard from './components/GalleryCard';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IGalleryProps {
  images?: ILooseObject[];
  // tslint:disable:no-any
  placeImg?: any;
  image?: any;
}

export interface IGalleryState {
  isDrawerVisible: boolean;
  selectedImage: object | null;
}

class Gallery extends React.Component<IGalleryProps, IGalleryState> {
  constructor(props: IGalleryProps) {
    super(props);
    this.state = { isDrawerVisible: false, selectedImage: null };
  }

  public showDrawer = (image?: object) => {
    if (!image) {
      this.setState({ isDrawerVisible: true, selectedImage: null });
    } else {
      this.setState({ isDrawerVisible: true, selectedImage: image });
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
            <Input.Search placeholder="Search and Image" />
          </Col>
        </Row>

        <hr className="hSep" />

        <Row>
          <Col span={24}>
            <div className={'mediaLibrary__gallery__row'}>
              {this.props.images &&
                this.props.images.map((item, index) => (
                  <GalleryCard key={index} toggleEdit={this.showDrawer}image={item} />
                ))}
            </div>
          </Col>
        </Row>

        <hr className="hSep" />

        <Row justify={'center'}>
          <Col span={24}>
            <Pagination defaultCurrent={1} total={30} />
          </Col>
        </Row>

        <Drawer
          title="Media Editor"
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.isDrawerVisible}
          destroyOnClose={true}
          width={500}
        >
          <UploadImage closeEditor={() => this.closeDrawer()} onChange={this.props.placeImg}>
            <Editor
              image={this.state.selectedImage}
              onChange={media => {
                this.props.placeImg(media);
                this.closeDrawer();
              }}
              closeEditor={() => this.closeDrawer()}
            />
          </UploadImage>
        </Drawer>
      </div>
    );
  }
}

export default Gallery;
