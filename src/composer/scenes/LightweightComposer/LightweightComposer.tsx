import { IComponentModule, IPluginModule } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import Container from './components/Container';

export interface IProperties {
  // tslint:disable-next-line:no-any
  content: any;

  componentModule: IComponentModule;
  pluginModule: IPluginModule;

  context: Context;
  plugins: string[];

  client: any; // tslint:disable-line:no-any
}

class LightweightComposer extends React.Component<IProperties, {}> {

  private pluginsInstances: any[]; // tslint:disable-line:no-any

  constructor(props: IProperties) {
    super(props);

    this.pluginsInstances = [];

    props.plugins.forEach((name: string) => {
      const Plugin = props.pluginModule.getPlugin(name);
      if (Plugin) {
        this.pluginsInstances[name] = new Plugin(props.context, null, props.client);
        props.context.addListener(name, () => {
          this.forceUpdate();
        });
      }
    });
  }

  public render(): JSX.Element {
    return (
      <Container
        content={this.props.content.content}
        componentModule={this.props.componentModule}
        context={this.props.context}
      />
    );
  }

}

export default LightweightComposer;
