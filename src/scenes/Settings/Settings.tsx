import * as React from 'react';
import { Tabs } from 'antd';
import PageTypes from './components/PageTypes';
import Navigations from './components/Navigations';
import Tags from './components/Tags';
import Datasources from './components/Datasources';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router';

const { Component } = React;

interface Properties extends RouteComponentProps<LooseObject> {
}

class Settings extends Component<Properties, {}> {

  render() {

    const { 
      match: { 
        params: { 
          section 
        } 
      },
      history: {
        push
      }
    } = this.props;
    return (
      <div>
        <Tabs 
          defaultActiveKey="page-types" 
          {...(section ? { activeKey: section } : {})}
          onChange={(activeKey) => push(`/settings/${activeKey}`)}
        >
          <Tabs.TabPane tab="Page Types" key="page-types">
            <PageTypes />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Plugins" key="plugins">
            <span>Nothing is here</span>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Navigations" key="navigations">
            <Navigations />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tags" key="tags">
            <Tags />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Datasources" key="datasources">
            <Datasources />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }

}

export default withRouter(Settings);
