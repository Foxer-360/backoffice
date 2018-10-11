import { Divider } from 'antd';
import * as React from 'react';

interface ISectionProps {
  title: string;
}

export default class Section extends React.Component<ISectionProps, {}> {
  public render() {
    return (
      <>
        <Divider orientation="left" style={{ marginBottom: '5px' }}>{this.props.title}</Divider>
        {this.props.children}
      </>
    );
  }
}
