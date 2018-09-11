const fs = require('fs');
const path = require('path');

const appPath = path.resolve(__dirname, '../');
const paths = {
  components: path.resolve(appPath, 'components'),
  plugins: path.resolve(appPath, 'plugins'),
  styles: path.resolve(appPath, 'public/styles'),
  assets: path.resolve(appPath, 'public/assets'),
  config: {
    target: path.resolve(appPath, 'config/deps.json'),
    source: path.resolve(appPath, 'src/services/deps.json'),
    ts: path.resolve(appPath, 'src/services/modules/config.ts')
  }
};


/**
 * Get all names of libs from config file
 *
 * @param {string} config path to config file
 */
function getAllNamesOfLibs(config) {
  if (!fs.existsSync(config)) {
    console.log(`Config file ${config} doesn't exists`);
    return [];
  }

  const deps = require(config);

  if (!deps || !deps.components || !deps.plugins) {
    console.log(`Config file ${config} is invalid`);
    return [];
  }

  const mapFce = (lib) => {
    return lib.name;
  };

  const components = deps.components.map(mapFce);
  const plugins = deps.plugins.map(mapFce);

  return [
    ...components,
    ...plugins
  ];
}

/**
 * Recursive dir removing
 *
 * @param {string} rmPath which will be removed
 */
function recursiveRm(rmPath) {
  const stats = fs.lstatSync(rmPath);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    // It's file, maybe so remove it normally
    fs.unlinkSync(rmPath);
    return;
  }

  const list = fs.readdirSync(rmPath);
  list.forEach((file) => {
    const fp = path.resolve(rmPath, file);
    recursiveRm(fp);
  });

  // Remove this folder
  fs.rmdirSync(rmPath);
}

/**
 * Main function of this script. This will remove all files related with deps
 *
 * @return {void}
 */
function main() {
  const names = getAllNamesOfLibs(paths.config.target);

  if (fs.existsSync(paths.components)) {
    recursiveRm(paths.components);
    console.log(`Components was removed...`);
  }

  if (fs.existsSync(paths.plugins)) {
    recursiveRm(paths.plugins);
    console.log(`Plugins was removed...`);
  }

  names.forEach((name) => {
    const s = path.resolve(paths.styles, `${name}.css`);
    const a = path.resolve(paths.assets, name);

    if (fs.existsSync(s)) {
      fs.unlinkSync(s);
      console.log(`Removed style for ${name}...`);
    }

    if (fs.existsSync(a)) {
      recursiveRm(a);
      console.log(`Removed assets for ${name}...`);
    }
  });

  if (fs.existsSync(paths.config.source)) {
    fs.unlinkSync(paths.config.source);
    console.log(`Removed generated config from sources...`);
  }

  if (fs.existsSync(paths.config.target)) {
    fs.unlinkSync(paths.config.target);
    console.log(`Removed generated config...`);
  }

  if (fs.existsSync(paths.config.ts)) {
    fs.unlinkSync(paths.config.ts);
    console.log(`Removed generated ts config...`);
  }

  console.log(`Done...`);
}

// Just call main function
main();
