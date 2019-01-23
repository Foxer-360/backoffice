import * as React from 'react';
import { Tabs } from 'antd';
import PageTypes from './components/PageTypes';
import Navigations from './components/Navigations';
import Tags from './components/Tags';
import Datasources from './components/Datasources';

const { Component } = React;

class Settings extends Component<{}, {}> {

  render() {
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Page Types" key="1">
            <PageTypes />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Plugins" key="2">
            <span>Nothing is here</span>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Navigations" key="3">
            <Navigations />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tags" key="4">
            <Tags />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Datasources" key="5">
            <Datasources />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }

}

export default Settings;
