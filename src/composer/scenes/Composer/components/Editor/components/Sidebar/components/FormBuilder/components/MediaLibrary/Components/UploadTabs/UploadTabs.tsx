import * as React from 'react';
import { Tabs } from 'antd';
import ImageEditor from '../../Components/ImageEditor';
import EmbedVideoEditor from '../../Components/EmbedVideoEditor';
import UploadImage from '../../Components/MutationComponents/UploadImage';

export interface UploadTabsProps {
  // tslint:disable:no-any
  onChange?: any;
  mediaData?: any;
  name?: any;
  closeDrawer?: any;
}

export interface UploadTabsState {
  activeTab: string;
}

export default class UploadTabs extends React.Component<UploadTabsProps, UploadTabsState> {
  constructor(props: UploadTabsProps) {
    super(props);

    this.state = {
      activeTab: '0',
    };
  }

  changeTab = (tabIndex: string) => {
    this.setState({
      activeTab: tabIndex,
    });
  }

  public render() {
    return (
      <div>
        <Tabs onChange={(key: string) => this.changeTab(key)} key={this.state.activeTab}>
          <Tabs.TabPane tab="Images" key="0">
            <UploadImage closeEditor={() => this.props.closeDrawer()} onChange={this.props.onChange}>
              <ImageEditor
                name={this.props.name}
                image={this.props.mediaData}
                onChange={media => {
                  this.props.onChange(media);
                  this.props.closeDrawer();
                }}
                closeEditor={() => this.props.closeDrawer()}
              />
            </UploadImage>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Videos" key="1">
            <EmbedVideoEditor
              name={this.props.name}
              onChange={media => {
                this.props.onChange(media);
                this.props.closeDrawer();
              }}
              closeEditor={() => this.props.closeDrawer()}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}
