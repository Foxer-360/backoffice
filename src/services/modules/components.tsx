import * as React from 'react';
import { components, config, LibDefinition } from './config';

interface NamedInstances {
  // tslint:disable-next-line:no-any
  [name: string]: any;
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

/**
 *
 */
class ComponentsModule {

  private names: string[];

  private name2instance: Name2InstanceMap;

  // tslint:disable-next-line:no-any
  private instances: NamedInstances;

  /**
   * Prepare this module by merging all components from dependencies
   */
  constructor() {
    this.names = [];
    this.instances = {};
    this.name2instance = {};

    const cmps = config.components;
    cmps.forEach((lib: LibDefinition) => {
      const inst = new components[lib.name]();
      this.instances[lib.name] = inst;

      const types = inst.getAllowedTypes();
      types.forEach((type: string) => {
        this.name2instance[type] = lib.name;
      });
      this.names = [
        ...this.names,
        ...types,
      ];
    });
  }

  /**
   *
   */
  public getAllowedTypes() {
    return this.names;
  }

  public getComponent(type: string) {
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (!name || !i) {
      return this.getNotFoundComponent();
    }

    return i.getComponent(type);
  }

  public getComponentResource(type: string) {
    const name = this.name2instance[type];
    const i = this.instances[name];

    return i.getComponentResource(type);
  }

  public getForm(type: string) {
    const name = this.name2instance[type];
    const i = this.instances[name];

    return i.getForm(type);
  }

  public getStyles() {
    const res = config.components.map((lib) => {
      return lib.paths.relative.style;
    }).filter((style) => {
      return style ? true : false;
    });

    return res;
  }

  private getNotFoundComponent() {
    return NotFound;
  }

}

export default ComponentsModule;
