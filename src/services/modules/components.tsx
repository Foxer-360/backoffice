import * as React from 'react';
import { components, config, LibDefinition } from './config';
import { client, queries } from '../graphql';

interface NamedInstances {
  // tslint:disable-next-line:no-any
  [name: string]: any;
}

interface NamedTypes {
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

// Get allowed components for project (string[]) or null to enable all
const getProjectComponents = (id: string): string[] | null => {
  if (!id || id.length < 2) {
    return null;
  }

  const { project } = client.cache.readQuery({ query: queries.GET_PROJECT, variables: { id } });
  if (!project || !project.components || project.components.length < 2) {
    return null;
  }

  return project.components.split(',');
};

// This will return all available components
export const getComponentSets = () => {
  return config.components.map((lib: LibDefinition) => lib.name);
};

class NotFound extends React.Component<{}, {}> {

  public render() {
    const style = {
      background: '#A4243B',
      padding: '24px 32px',
      color: '#FFF9FB',
      textAlign: 'center',
      fontSize: '24px',
      borderRadius: '10px',
      boxShadow: '0px 0px 8px 2px #646464',
    } as React.CSSProperties;

    const outerStyle = {
      padding: '12px 5%',
      margin: '0px',
    } as React.CSSProperties;

    return (
      <div style={outerStyle}>
        <div style={style}>
          <span>Component not found!</span>
        </div>
      </div>
    );
  }

}

/**
 *
 */
class ComponentsModule {

  // Created instances of components services
  private instances: NamedInstances;

  // Names of components available in this service
  private componentsSet: string[];

  // Cached allowed types for each components service
  private types: NamedTypes;

  /**
   * Prepare this module by merging all components from dependencies
   */
  constructor() {
    this.instances = {};
    this.componentsSet = [];
    this.types = {};

    const cmps = config.components;
    cmps.forEach((lib: LibDefinition) => {
      const inst = new components[lib.name]();
      this.instances[lib.name] = inst;
      this.componentsSet.push(lib.name);

      const types = inst.getAllowedTypes();
      this.types[lib.name] = types;
    });
  }

  /**
   *
   */
  public getAllowedTypes() {
    const allowed = this.getCurrentComponentSet();

    let result = [];
    allowed.forEach((name: string) => {
      result = [ ...result, ...this.types[name] ];
    });

    return result;
  }

  public getComponent(type: string) {
    const name = this.findComponentServiceName(type);

    if (name === null) {
      return this.getNotFoundComponent();
    }

    return this.instances[name].getComponent(type);
  }

  public getComponentResource(type: string) {
    const name = this.findComponentServiceName(type);

    if (name === null) {
      return null;
    }

    return this.instances[name].getComponentResource(type);
  }

  public getForm(type: string) {
    const name = this.findComponentServiceName(type);

    if (name === null) {
      return this.getNotFoundComponent();
    }

    return this.instances[name].getForm(type);
  }

  public getStyles() {
    const allowed = this.getCurrentComponentSet();

    const mapFce = (lib: LibDefinition): string | null => {
      if (allowed.includes(lib.name)) {
        return lib.paths.relative.style;
      }

      return null;
    };

    const filterFce = (value: string | null): boolean => {
      return value ? true : false;
    };

    const result = config.components.map(mapFce).filter(filterFce);
    return result;
  }

  private getNotFoundComponent() {
    return NotFound;
  }

  /**
   * Returns array of names of components set, which is allowed in
   * current project
   */
  private getCurrentComponentSet(): string[] {
    const id = getProjectId();
    const allowed = getProjectComponents(id);

    // Enable all components, if not specified
    if (!allowed || allowed.length < 1) {
      return this.componentsSet;
    }

    const result = this.componentsSet.filter((value: string) => {
      if (allowed.includes(value)) {
        return true;
      }

      return false;
    });

    return result;
  }

  /**
   * Return instance name or null of searched component type. If there
   * is such component set, that includes this component and it's allowed in this
   * project, then return its name
   */
  private findComponentServiceName(type: string): string | null {
    const allowed = this.getCurrentComponentSet();

    const name = allowed.find((value: string) => {
      // This set of components include searched component
      if (this.types[value].includes(type)) {
        return true;
      }

      return false;
    });

    // Not Found
    if (name === undefined || name === null || !name) {
      return null;
    }

    return name;
  }

}

export default ComponentsModule;
