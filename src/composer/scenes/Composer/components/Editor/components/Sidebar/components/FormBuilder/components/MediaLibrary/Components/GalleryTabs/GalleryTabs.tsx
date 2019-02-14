import * as React from 'react';
import { Tabs } from 'antd';
import ImageGallery from '../../Components/ImageGallery';
import FilesGallery from '../../Components/FilesGallery';
import AllImagesQuery from '../QueryComponents';
import AllFilesQuery from '../QueryComponents/AllFiles';

export interface GalleryTabsProps {
  // tslint:disable:no-any
  placeMedia?: any;
  media?: any;
  name: string;
}

export interface GalleryTabsState {
  activeTab: string;
}

export default class GalleryTabs extends React.Component<GalleryTabsProps, GalleryTabsState> {
  constructor(props: GalleryTabsProps) {
    super(props);

    this.state = {
      activeTab: '0',
    };
  }

  setTab = (tabIndex: string) => {
    this.setState({
      activeTab: tabIndex,
    });
  }

  public render() {
    return (
      <Tabs
        activeKey={this.state.activeTab}
        onChange={(key: string) => this.setTab(key)}
        type="card"
        style={{ zIndex: 200 }}
      >
        <Tabs.TabPane tab="Images" key="0">
          <AllImagesQuery>
            <ImageGallery placeImg={this.props.placeMedia} image={this.props.media} name={this.props.name} />
          </AllImagesQuery>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Files" key="1">
          <AllFilesQuery>
            <FilesGallery placeFile={this.props.placeMedia} file={this.props.media} name={this.props.name} />
          </AllFilesQuery>
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
