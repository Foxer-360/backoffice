import * as React from 'react';
import { Tabs } from 'antd';
import ImageEditor from '../../Components/ImageEditor';
import FileEditor from '../../Components/FileEditor';
import EmbedVideoEditor from '../../Components/EmbedVideoEditor';
import UploadImage from '../../Components/MutationComponents/UploadImage';
import UploadFile from '../../Components/MutationComponents/UploadFile';

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

  public render() {
    return (
      <div>
        <Tabs key={this.state.activeTab}>
          <Tabs.TabPane tab="Images" key="0">
            <UploadImage closeEditor={() => this.props.closeDrawer()} onChange={this.props.onChange}>
              <ImageEditor
                name={this.props.name}
                image={this.props.mediaData && this.props.mediaData.type === 'image' ? this.props.mediaData : null}
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

          <Tabs.TabPane tab="Files" key="3">
            <UploadFile closeEditor={() => this.props.closeDrawer()} onChange={this.props.onChange}>
              <FileEditor
                name={this.props.name}
                onChange={media => {
                  this.props.onChange(media);
                  this.props.closeDrawer();
                }}
                closeEditor={() => this.props.closeDrawer()}
              />
            </UploadFile>
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}
