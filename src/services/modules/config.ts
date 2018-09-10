// Import all components
import { ComponentsService as componentsBase } from 'components/base';

// Import all plugins

// Import config file
import * as depsJson from './deps.json';

type LibType = 'components' | 'plugins';

interface LibPaths {
  assets?: string;
  assetsTarget?: string;
  git?: string;
  lib: string;
  main?: string;
  relative: LibRelativePaths;
  style?: string;
  styleTarget?: string;
  target: string;
}

interface LibRelativePaths {
  assets?: string;
  import: string;
  main?: string;
  style?: string;
  target: string;
}

interface LibDefinition {
  git: boolean;
  name: string;
  paths: LibPaths;
  type: LibType;
}

interface LibConfig {
  components: LibDefinition[];
  plugins: LibDefinition[];
}

/**
 * Define components
 */
const components = {
  base: componentsBase,
};

/**
 * Define plugins
 */
const plugins = {

};

/**
 * "Transform" imported config file
 */
// tslint:disable-next-line:no-any
const deps = depsJson as any;
const config = deps as LibConfig;

export {
  components,
  config,
  plugins,

  LibConfig,
  LibDefinition,
  LibPaths,
  LibRelativePaths,
  LibType,
};
