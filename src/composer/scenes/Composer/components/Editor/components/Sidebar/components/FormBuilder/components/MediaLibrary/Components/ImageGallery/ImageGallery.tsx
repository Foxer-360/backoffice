import { ILooseObject } from '@source/composer/types';
import { Col, Drawer, Input, Pagination, Row, Spin } from 'antd';
import * as React from 'react';
import ImageEditor from '../ImageEditor/ImageEditor';
import UploadImage from '../MutationComponents/UploadImage';
import GalleryCard from './components/GalleryCard';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

export interface IImageGalleryProps {
  images?: ILooseObject[];
  // tslint:disable:no-any
  placeImg?: any;
  image?: any;
  name: string;
  refetch?: () => void;
  loading?: boolean;
  currentPage?: number;
  totalImages?: number;
  imagesPerPage?: number;
  changePage?: (pageNum: number) => void;
}

export interface IImageGalleryState {
  isDrawerVisible: boolean;
  selectedImage: object | null;
}

class ImageGallery extends React.Component<IImageGalleryProps, IImageGalleryState> {
  constructor(props: IImageGalleryProps) {
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

  public changePage = (page, pageSize) => {
    this.props.changePage(page);
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
            <div className={'mediaLibrary__gallery__row'} style={{ height: '570px' }}>
              {this.props.loading && (
                <Row justify={'center'} type={'flex'} style={{ width: '100%' }}>
                  <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spin />
                  </Col>
                </Row>
              )}

              {!this.props.loading &&
                this.props.images &&
                this.props.images.map((item, index) => (
                  <GalleryCard key={index} toggleEdit={this.showDrawer} placeImg={this.props.placeImg} image={item} />
                ))}
            </div>
          </Col>
        </Row>

        <hr className="hSep" />

        <Row justify={'center'}>
          <Col span={24}>
            {console.log(this.props)}
            <Pagination
              defaultCurrent={1}
              current={this.props.currentPage}
              onChange={this.changePage}
              total={this.props.totalImages}
              pageSize={this.props.imagesPerPage}
            />
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
          <UploadImage
            closeEditor={() => this.closeDrawer()}
            onChange={this.props.placeImg}
            refetch={this.props.refetch}
          >
            <ImageEditor
              name={this.props.name}
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

export default ImageGallery;
