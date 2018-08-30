import * as React from 'react';
import { Icon, Row, Col, Pagination, Input, Drawer } from 'antd';
import GalleryCard from './components/GalleryCard';
import Editor from '../Editor/Editor';

export interface GalleryProps {}

export interface GalleryState {
  isDrawerVisible: boolean;
}
  
class Gallery extends React.Component<GalleryProps, GalleryState> {
  constructor(props: GalleryProps) {
    super(props);
    this.state = {
      isDrawerVisible: false,
    };
  }

  showDrawer = () => {
    this.setState({ isDrawerVisible: true });
  }

  onClose = () => {
    this.setState({ isDrawerVisible: false });
  }
  render() {
    // ! This is dummy data only for mocking, will be later deleted when media library is connected
    const dummydata = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

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
              {dummydata.map(() => (
                <GalleryCard toggleEdit={this.showDrawer} />
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
          width={500}
        >
          <Editor />
        </Drawer>
      </div>
    );
  }
}

export default Gallery;
