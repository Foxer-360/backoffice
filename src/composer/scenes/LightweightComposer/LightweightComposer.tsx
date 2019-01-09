import { IComponentModule, IPluginModule } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import Container from './components/Container';

export interface IProperties {
  // tslint:disable-next-line:no-any
  content: any;

  componentModule: IComponentModule;
  pluginModule: IPluginModule;
  plugins: string[];

  client: any; // tslint:disable-line:no-any
}

class LightweightComposer extends React.Component<IProperties, {}> {

  private pluginsInstances: any[]; // tslint:disable-line:no-any

  constructor(props: IProperties) {
    super(props);

    this.pluginsInstances = [];

  }

  public render(): JSX.Element {
    return (
      <Container
        content={this.props.content.content}
        componentModule={this.props.componentModule}
      />
    );
  }

}

export default LightweightComposer;
