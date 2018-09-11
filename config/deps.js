const fs = require('fs');
const path = require('path');


const appPath = path.resolve(__dirname, '../');
const componentsPath = path.resolve(appPath, 'components');
const pluginsPath = path.resolve(appPath, 'plugins');


/**
 * Get array of main files of libs to allow import them out of sources.
 *
 * @param {string} config relative path to config file
 * @return {string[]} files which will be allowed to import from src folder
 */
function getFilesToAllow(config) {
  const fp = path.resolve(__dirname, config);
  if (!fs.existsSync(fp)) {
    console.log(`Config file ${config} doen't exists. Please try to run yarn deps`);
    return null;
  }

  const deps = require(fp);
  if (!deps || !deps.components || !deps.plugins) {
    console.log(`Config file ${config} is invalid`);
    return null;
  }

  const mapFce = (lib) => {
    return lib.paths.main.replace('.js', '');
  };

  const components = deps.components.map(mapFce);
  const plugins = deps.plugins.map(mapFce);

  return [
    ...components,
    ...plugins
  ];
}

module.exports = {
  componentsPath,
  getFilesToAllow,
  pluginsPath
};
