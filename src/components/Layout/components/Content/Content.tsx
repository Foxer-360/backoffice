import * as React from 'react';
import { Layout } from 'antd';

const AntdContent = Layout.Content;

const style = {
  borderRadius: '6px',
  margin: '10px',
  padding: '7px',
  maxHeight: 'calc(100vh - 100px)',
};

export interface Properties {
  color: string;
}

// tslint:disable-next-line:no-any
const Content = (props: any & Properties) => (
  <AntdContent>
    <div className={'contentHolder'} style={{ ...style, background: props.color }}>
      {props.children ? props.children : null}
    </div>
  </AntdContent>
);

export default Content;
