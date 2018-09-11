import ComponentsModule from './components';
import PluginsModule from './plugins';

const components = new ComponentsModule();
const plugins = new PluginsModule();

export {
  components as ComponentsModule,
  plugins as PluginsModule,
};
