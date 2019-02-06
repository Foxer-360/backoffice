import * as React from 'react';
import { components, config, LibDefinition } from './config';
import { client, queries } from '../graphql';

interface NamedInstances {
  // tslint:disable-next-line:no-any
  [name: string]: any;
}

interface Name2InstanceMap {
  [name: string]: string;
}

interface Names {
  [name: string]: string[];
}

// Helper to get project id
const getProjectId = (): string | null => {
  let { website } = client.cache.readQuery({ query: queries.LOCAL_SELECTED_WEBSITE });
  const data = client.cache.readQuery({ query: queries.WEBSITE_DETAIL, variables: { id: website } }) as LooseObject;

  if (!data || !data.website || !data.website.project || !data.website.project.id) {
    return null;
  }

  const project = data.website.project.id;

  return project;
};

// Get allowed components for project or null to enable all
const getProjectComponents = (id: string): string[] | null => {
  if (!id || id.length < 2) {
    return null;
  }

  const { project } = client.cache.readQuery({ query: queries.GET_PROJECT, variables: { id } });
  if (!project || !project.components || project.components.length < 2) {
    return null;
  }

  return project.components;
};

// This will return all available components
export const getComponentSets = () => {
  return config.components.map((lib: LibDefinition) => lib.name);
};

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

  private names: Names;

  private name2instance: Name2InstanceMap;

  // tslint:disable-next-line:no-any
  private instances: NamedInstances;

  /**
   * Prepare this module by merging all components from dependencies
   */
  constructor() {
    this.names = {};
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
      this.names[lib.name] = types;
    });
  }

  /**
   *
   */
  public getAllowedTypes() {
    const id = getProjectId();
    let allowed = getProjectComponents(id);
    const names = config.components.map((lib: LibDefinition) => lib.name);

    // All components
    if (!allowed || allowed.length < 1) {
      let res = [];
      names.forEach((n: string) => {
        res = [
          ...res,
          ...this.names[n]
        ];
      });

      return res;
    }

    let result = [];
    names.forEach((n: string) => {
      if (!allowed.includes(n)) {
        return;
      }

      result = [
        ...result,
        ...this.names[n]
      ];
    });

    return result;
  }

  public getComponent(type: string) {
    getProjectId();
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (!name || !i) {
      return this.getNotFoundComponent();
    }

    return i.getComponent(type);
  }

  public getComponentResource(type: string) {
    getProjectId();
    const name = this.name2instance[type];
    const i = this.instances[name];

    if (i) {
      return i.getComponentResource(type);
    }

    return null;
  }

  public getForm(type: string) {
    getProjectId();
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
