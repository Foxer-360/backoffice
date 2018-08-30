import * as React from 'react';
import { Button, Icon, Row, Col, Drawer, Input, Upload } from 'antd';
import Editor from './Components/Editor';
import Gallery from './Components/Gallery';
import './style.scss';

export interface MediaLibraryProps {}

export interface MediaLibraryState {
  visible: boolean;
  drawerType: string;
}

class MediaLibrary extends React.Component<MediaLibraryProps, MediaLibraryState> {
  constructor(props: MediaLibraryProps) {
    super(props);
    this.state = {
      visible: false,
      drawerType: 'editor',
    };
  }

  showDrawer = (type: string) => {
    this.setState({
      visible: true,
      drawerType: type,
    });
  }

  onClose = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    return (  
      <div>
        <label> {this.state.drawerType === 'editor' ? 'Media Editor' : 'Media Library'}</label>

        <Row gutter={8}>
          <Col span={6}>
            <Button onClick={() => this.showDrawer('editor')}>
              <Icon type="upload" /> Upload
            </Button>
          </Col>
          <Col span={6}>
            <Button type="primary" icon="search" onClick={() => this.showDrawer('gallery')}>
              Search
            </Button>
          </Col>
        </Row>

        <Drawer
          title="Media Library"
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
          width={500}
          zIndex={1}
        >
          {this.state.drawerType === 'editor' ? <Editor /> : <Gallery />}
        </Drawer>
      </div>
    );
  }
}

export default MediaLibrary;
