import { components, config, LibDefinition } from './config';

interface NamedInstances {
  // tslint:disable-next-line:no-any
  [name: string]: any;
}

interface Name2InstanceMap {
  [name: string]: string;
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

}

export default ComponentsModule;
