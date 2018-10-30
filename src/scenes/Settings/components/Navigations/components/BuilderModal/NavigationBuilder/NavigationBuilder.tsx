import * as React from 'react';
import Organizer from './components/Organizer';
import Builder from './components/Builder';
import { Steps } from 'antd';
import './style.css';
import { NavigationPage, NavigationNode, NavigationNodeWithJoin } from '../../../interfaces';

const { Component } = React;
const Step = Steps.Step;

interface Properties {
  navigationID: string;
  current: number;
  pages: NavigationPage[];
  nodes: NavigationNode[];
  onSave: (data: NavigationNodeWithJoin[]) => void;
}

interface State {
  nodes: NavigationNode[];
  pages: NavigationPage[];
}

class NavigationBuilder extends Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      pages: props.pages,
      nodes: props.nodes,
    };
  }

  handleOrganizerChange(nodes: NavigationNode[]): void {
    this.setState({ nodes });
  }

  handleBuilderChange(nodes: NavigationNode[]): void {
    // tslint:disable-next-line:no-console
    console.log('handleBuilderChange nodes', nodes);
    this.setState({ nodes });
  }

  getRelevantComponent(current: number): React.ReactNode {
    switch (current) {
      case 0:
        return (
          <Organizer
            pages={this.state.pages}
            nodes={this.state.nodes}
            onChange={(nodes: NavigationNode[]) => this.handleOrganizerChange(nodes)}
          />
        );
      case 1:
        return (
          <Builder
            pages={this.state.pages}
            nodes={this.state.nodes}
            structureChange={(data: NavigationNode[]) => this.handleBuilderChange(data)}
          />
        );
      default:
        return <div>Something went wrong!</div>;
    }
  }

  saveStructure(): void {
    const { navigationID } = this.props;
    this.props.onSave(this.state.nodes.map((node: NavigationNode) => {
      const model = {
        ...node,
        navigation: {
          connect: {
            id: navigationID
          }
        }
      };
      return model;
    }));
  }

  render(): React.ReactNode {
    return (
      <>
        <Steps current={this.props.current}>
          <Step key={0} title={'Setup'} description={'Choose items'} />
          <Step key={1} title={'Build'} description={'Organize navigation'} />
        </Steps>
        <div className="navigation-steps-content">
          {this.getRelevantComponent(this.props.current)}
        </div>
      </>
    );
  }

}

export default NavigationBuilder;