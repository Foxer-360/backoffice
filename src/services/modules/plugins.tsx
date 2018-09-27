import * as React from 'react';
import { plugins, config, LibDefinition } from './config';

interface NamedInstances {
  [name: string]: any; // tslint:disable-line:no-any
}

interface Name2InstanceMap {
  [name: string]: string;
}

class NotFound extends React.Component<{}, {}> {

  public render() {
    return (
      <div>
        <span>Component not found!</span>
      </div>
    );
  }

}

class PluginsModule {

  private names: string[];

  private instances: NamedInstances;

  private name2instance: Name2InstanceMap;

  constructor() {
    this.names = [] as string[];
    this.instances = {};
    this.name2instance = {};

    const plgs = config.plugins;
    plgs.forEach((lib: LibDefinition) => {
      const inst = new plugins[lib.name]();
      this.instances[lib.name] = inst;

      const types = inst.getPluginTypes();
      types.forEach((type: string) => {
        this.name2instance[type] = lib.name;
      });
      this.names = [
        ...this.names,
        ...types,
      ];
    });
  }

  public getPluginTypes(): string[] {
    return this.names;
  }

  public getPluginComponent(type: string): typeof React.Component {
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (!name || !i) {
      return this.getNotFoundComponent();
    }

    return i.getPluginComponent(type);
  }

  public getPlugin(type: string) {
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (!name || !i) {
      return null;
    }

    return i.getPlugin(type);
  }

  public getPluginTabName(type: string): string {
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (!name || !i) {
      return `Undefined ${type}`;
    }

    return i.getPluginTabName(type);
  }

  private getNotFoundComponent(): typeof React.Component {
    return NotFound;
  }

}

export default PluginsModule;
