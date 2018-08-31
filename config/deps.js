const fs = require('fs');
const path = require('path');

// Define some paths
const appPath = path.resolve(__dirname, '../');
const componentsPath = path.resolve(appPath, 'components');
const pluginsPath = path.resolve(appPath, 'plugins');

/**
 * Load config JSON with components or plugins and convert it into array
 *
 * @param {string} filePath relative path from app folder to json
 */
function convertJson2Array(filePath) {
  const json = require(path.resolve(appPath, filePath));
  const keys = Object.keys(json);
  const res = [];
  const type = filePath.replace('.json', '');

  for (let i = 0; i < keys.length; i++) {
    if (!json.hasOwnProperty(keys[i])) continue;

    const baseLibPath = path.resolve(appPath, type);

    res.push(Object.assign(json[keys[i]], {
      name: keys[i],
      type,
      target: path.resolve(appPath, json[keys[i]].path),
      libPath: path.resolve(baseLibPath, keys[i]),
    }));
  }

  return res;
}

/**
 * Parse main file defined in package.json in some lib.
 *
 * @param {string} lib relative path from app folder to lib (eg. components/example)
 */
function parseMainFile(lib) {
  const file = path.resolve(appPath, lib, 'package.json');
  let package = null;
  try {
    package = require(file);
  } catch (e) {
    throw new Error('File package.json for lib ' + path.resolve(appPath, lib) + ' doesn\'t exists!');
  }

  if (!package) return null;
  if (!package.main) return null;

  return package.main;
}

/**
 * Get all main files in packages in one array to add it as exception into
 * react module, which disallow import outside of src folder. If we add all
 * these files into allowed, then error with importing outside of src folder
 * with all these files will be solved.
 *
 * @param {string[]} configs array of config json files relative to app folder
 */
function getFilesToAllow(configs) {
  const res = [];

  for (let i = 0; i < configs.length; i++) {
    const libs = convertJson2Array(configs[i]);
    const baseLibPath = configs[i].replace('.json', '');
    const fullBaseLibPath = path.resolve(appPath, baseLibPath);

    if (!fs.existsSync(fullBaseLibPath)) {
      throw new Error('Folder with libs doesn\'t exists! (' + baseLibPath + ')');
    }

    for (let x = 0; x < libs.length; x++) {
      const main = parseMainFile(baseLibPath + '/' + libs[x].name);
      if (!main) {
        throw new Error('Lib ' + libs[x].name + ' has no main file specified in package.json');
      }

      const fullFilePath = path.resolve(fullBaseLibPath, libs[x].name, main.replace('.js', ''));
      res.push(fullFilePath);
    }
  }

  return res;
}

/**
 * Get lib definitions for given configs
 *
 * @param {string[]} configs arrays of config json files relative to app folder
 */
function getLibDefinitions(configs) {
  const res = [];

  for (let i = 0; i < configs.length; i++) {
    const libs = convertJson2Array(configs[i]);
    res.push(...libs);
  }

  return res;
}

module.exports = {
  convertJson2Array,
  parseMainFile,
  getFilesToAllow,
  getLibDefinitions,
  componentsPath,
  pluginsPath
};
