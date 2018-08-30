import * as React from 'react';
import { Divider } from 'antd';

interface SectionProps {
  title: string;
}

export default class Section extends React.Component<SectionProps> {
  render() {
    return (
      <>
        <Divider orientation="left" style={{ marginBottom: '5px' }}>{this.props.title}</Divider>
        {this.props.children}
      </>
    );
  }
}