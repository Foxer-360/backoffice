import * as React from 'react';
import { Tabs } from 'antd';
import PageTypes from './components/PageTypes';
import Navigations from './components/Navigations';

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
        </Tabs>
      </div>
    );
  }

}

export default Settings;
