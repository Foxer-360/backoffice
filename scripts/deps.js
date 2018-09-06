const fs = require('fs');
const path = require('path');
const gitClone = require('git-clone');
const { execSync } = require('child_process');


const appPath = path.resolve(__dirname, '../');
const templatePath = path.resolve(appPath, 'scripts/deps.template.ts');
const paths = {
  components: path.resolve(appPath, 'components'),
  plugins: path.resolve(appPath, 'plugins'),
  styles: path.resolve(appPath, 'public/styles'),
  assets: path.resolve(appPath, 'public/assets'),
  config: {
    target: path.resolve(appPath, 'config/deps.json'),
    source: path.resolve(appPath, 'src/services/modules/deps.json'),
    ts: path.resolve(appPath, 'src/services/modules/config.ts')
  }
};


/**
 * Convert JSON config file into array of objects.
 *
 * @param {string} filePath relative path from app folder to json
 */
async function convertJson2Array(filePath) {
  const fullFilePath = path.resolve(appPath, filePath);
  if (!fs.existsSync(fullFilePath)) {
    console.log(`Config file ${filePath} doesn't exists. Nothing to do...`);
    return [];
  }

  const json = require(fullFilePath);
  const keys = Object.keys(json);
  const type = filePath.replace('.json', '');
  const libPath = path.resolve(appPath, type);

  const res = [];

  for (let i = 0; i < keys.length; i++) {
    if (!json.hasOwnProperty(keys[i])) continue;
    const data = await generateDefinition(keys[i], type, libPath, json[keys[i]]);

    if (!data) continue;
    res.push(data);
  }

  return res;
}

/**
 * Parse main file defined in package.json in some lib.
 *
 * @param {string} lib full path to lib
 */
function parseMainFile(lib) {
  const file = path.resolve(lib, 'package.json');
  let package = null;

  try {
    package = require(file);
  } catch (e) {
    throw new Error(`File package.json for lib (${lib}) doesn't exists!`);
  }

  if (!package) return null;
  if (!package.main) return null;

  return package.main;
}

/**
 * Clone repository
 *
 * @param {string} git repo
 * @param {string} path where to clone
 * @return {void}
 */
async function cloneRepository(git, path) {
  const regex = /#(.+)/;
  const match = git.match(regex);
  const options = {};
  if (match && match[1]) {
    options.checkout = match[1];
    git = git.replace(match[0], '');
  }

  const code = await gitCloneSync(git, path, options);
  if (code !== 0) {
    console.log(`Failed to clone repo ${git}. Status code: ${code}`);
    return;
  }

  // Install deps in cloned repo
  console.log(`Called yarn install for ${git}`);
  execSync(`yarn install --production=true`, {
    cwd: path,
  });

  // Pull data also using git LFS to get images
  console.log(`Called git lfs pull for ${git}`);
  execSync(`git lfs pull`, {
    cwd: path,
  });
}

/**
 * Convert async clone to sync clone
 *
 * @param {string} git
 * @param {string} path
 * @param {json} options
 */
async function gitCloneSync(git, path, options) {
  const code = await new Promise((resolve) => {
    gitClone(git, path, options, (err) => {
      if (err) {
        resolve(1);
      } else {
        resolve(0);
      }
    });
  });

  return code;
}

/**
 * Generate full defined object for some lib def. If lib is defined not by
 * relative path but by git, than at first clone this repo into components and
 * than continue as usual. Target path and lib path will be the same for git
 * packages.
 *
 * @param {string} name of lib defined in json
 * @param {string} type of lib, components or plugins
 * @param {string} libPath path to library folder
 * @param {JSON} json original json definition
 * @return {JSON} fully defined object of lib
 */
async function generateDefinition(name, type, libPath, json) {
  const _paths = {
    lib: path.resolve(libPath, name),
    relative: {
      import: `${type}/${name}`,
      target: json.path
    }
  };

  // Check if it's repo or local
  if (json.git && json.git.length > 1) {
    _paths.target = _paths.lib;
    _paths.git = json.git;

    // If doesn't exists, clone repo
    if (!fs.existsSync(_paths.target)) {
      await cloneRepository(json.git, _paths.target);
    }
  } else {
    _paths.target = path.resolve(appPath, json.path);

    if (!fs.existsSync(_paths.target)) {
      console.log(`Lib ${name} doesn't exists!`);
      return null;
    }
  }

  // If style is defined, add it
  if (json.style) {
    _paths.style = path.resolve(paths.styles, `${name}.css`);
    _paths.styleTarget = path.resolve(_paths.target, json.style);
    _paths.relative.style = `/styles/${name}.css`;
  }

  // If assets are defined, add it
  if (json.assets) {
    _paths.assets = path.resolve(paths.assets, `${name}`);
    _paths.assetsTarget = path.resolve(_paths.target, json.assets);
    _paths.relative.assets = `/assets/${name}`;
  }

  // Process main file of lib
  const main = parseMainFile(_paths.target);
  if (!main || main === null) {
    console.log(`Lib ${name} has no specified main file in package.json`);
  } else {
    _paths.relative.main = main;
    _paths.main = path.resolve(_paths.lib, main);
  }

  return {
    name,
    git: (_paths.git) ? true : false,
    type,
    paths: _paths
  };
}

/**
 * Function that simply check all necessary folders
 *
 * @return {void}
 */
function checkFolders() {
  if (!resolveFolder(paths.components)) {
    console.log('Folder for components was created...');
  }

  if (!resolveFolder(paths.plugins)) {
    console.log('Folder for plugins was created...');
  }

  if (!resolveFolder(paths.styles)) {
    console.log('Folder for styles in public was created...');
  }

  if (!resolveFolder(paths.assets)) {
    console.log('Folder for assets in public was created...');
  }
}

/**
 * Resolve folder. This mean, that if doesn't exists, try to create it
 *
 * @param {string} folder path to folder
 * @return {boolean} if exists, returns true, else create folder and returns false
 */
function resolveFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    return false;
  }

  return true;
}

/**
 * Save generated JSON object
 *
 * @param {string} target path where file will be saved
 * @param {string} source path to sources, where symlink will be created
 * @param {JSON} json generated data
 * @return {void}
 */
function saveGeneratedJson(target, source, ts, json) {
  const str = JSON.stringify(json, null, 2);
  fs.writeFileSync(target, str);
  fs.writeFileSync(source, str);

  const tsStr = generateTsConfig(json);
  fs.writeFileSync(ts, tsStr);

  // if (!fs.existsSync(source)) {
  //   fs.symlinkSync(target, source, 'file');
  // }
}

/**
 * Link local lib if doesn't exists
 *
 * @param {json} lib full lib definition object
 * @return {void}
 */
function linkLocalLib(lib) {
  // Skip git libs
  if (lib.git) {
    copyLibStyle(lib);
    resolveCssImports(lib);
    copyLibAssets(lib);

    return;
  }

  if (!fs.existsSync(lib.paths.lib)) {
    console.log(`Linking lib ${lib.type}/${lib.name}...`);
    fs.symlinkSync(lib.paths.target, lib.paths.lib, 'dir');
  } else {
    console.log(`Lib ${lib.type}/${lib.name} is already linked...`);
  }

  copyLibStyle(lib);
  resolveCssImports(lib);
  copyLibAssets(lib);
}

/**
 * Link all libs in array
 *
 * @param {json[]} arr of full lib definition objects
 */
function linkAllLibs(libs) {
  if (!Array.isArray(libs)) {
    console.log('Libs are not in array...');
    return;
  }

  libs.forEach(linkLocalLib);
}

/**
 * Recursive copy from target to source
 *
 * @param {string} target
 * @param {string} source
 */
function recursiveCopy(target, source) {
  const stats = fs.statSync(target);
  if (stats.isFile()) {
    // Just simply copy this file
    fs.copyFileSync(target, source);
    return;
  }

  // Invalid ?
  if (!stats.isDirectory()) {
    return;
  }

  if (!fs.existsSync(source)) {
    fs.mkdirSync(source);
  }

  // List all files and folders in target
  const list = fs.readdirSync(target)
  list.forEach((name) => {
    const t = path.resolve(target, name);
    const s = path.resolve(source, name);

    recursiveCopy(t, s);
  });
}

/**
 * Copy style for lib
 *
 * @param {json} lib full lib definition object
 */
function copyLibStyle(lib) {
  if (!lib.paths.style) {
    return;
  }

  if (!fs.existsSync(lib.paths.styleTarget)) {
    console.log(`Styles for ${lib.type}/${lib.name} doesn't exists!`);
    return;
  }

  console.log(`Copy style for ${lib.type}/${lib.name} lib...`);
  fs.copyFileSync(lib.paths.styleTarget, lib.paths.style);
}

/**
 * Copy full assets for lib
 *
 * @param {json} lib full lib definition object
 */
function copyLibAssets(lib) {
  if (!lib.paths.assets) {
    return;
  }

  if (!fs.existsSync(lib.paths.assetsTarget)) {
    console.log(`Assets for ${lib.type}/${lib.name} doesn't exists!`);
    return;
  }

  console.log(`Copy assets for ${lib.type}/${lib.name} lib...`);
  recursiveCopy(lib.paths.assetsTarget, lib.paths.assets);
}

/**
 * Resolve import from assets in css file. Assume, that in css there will be
 * imports like xy/assets/wz. So because we map everything under assets folder
 * in original project into new assets folder in our public folder, than we
 * didn't need xy path before word assets in imports. In our setup it will be
 * just assets/name/wz, where name is name of lib.
 *
 * @param {json} lib full lib defintion object
 */
function resolveCssImports(lib) {
  if (!fs.existsSync(lib.paths.style)) {
    return;
  }

  // Read file into string
  const fileContent = fs.readFileSync(lib.paths.style).toString();

  // Replace imports
  const newContent = fileContent.replace(/[^\s'"()\[\]\\]+\/assets\//gm, `/assets/${lib.name}/`);

  // Save string into file
  fs.writeFileSync(lib.paths.style, newContent);
}

/**
 * Generate config file for using in ts
 *
 * @param {json} config file
 */
function generateTsConfig(config) {
  if (!fs.existsSync(templatePath)) {
    console.log(`Template file ${templatePath} doesn't exists. Unable to generate ts config file.`);
    return;
  }

  let template = fs.readFileSync(templatePath).toString();
  if (!template) {
    console.log(`Failed to load ${templatePath} template...`);
    return;
  }

  const componentsImport = [];
  const componentsJson = [];
  const pluginsImport = [];
  const pluginsJson = [];

  config.components.forEach((lib) => {
    const importedName = `components${capitalizeFirstLetter(lib.name)}`;
    const imp = `import { ComponentsService as ${importedName} } from '${lib.paths.relative.import}';`;
    const json = `  ${lib.name}: ${importedName},`;

    componentsImport.push(imp);
    componentsJson.push(json);
  });

  config.plugins.forEach((lib) => {
    const importedName = `plugins${capitalizeFirstLetter(lib.name)}`;
    const imp = `import { PluginsService as ${importedName} } from '${lib.paths.relative.import}';`;
    const json = `  ${lib.name}: ${importedName},`;

    pluginsImport.push(imp);
    pluginsJson.push(json);
  });

  if (componentsImport.length < 1) {
    template = template.replace('<components-import>', '');
  } else {
    template = template.replace('<components-import>', componentsImport.join('\n') + '\n');
  }
  if (pluginsImport.length < 1) {
    template = template.replace('<plugins-import>', '');
  } else {
    template = template.replace('<plugins-import>', pluginsImport.join('\n') + '\n');
  }
  template = template.replace('<components-json>', componentsJson.join('\n'));
  template = template.replace('<plugins-json>', pluginsJson.join('\n'));

  return template;
}

/**
 * Capitalize first letter in string
 *
 * @param {string} val
 * @return {string}
 */
function capitalizeFirstLetter(val) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Main function which resolve all dependencies
 *
 * @return {void}
 */
async function main() {
  checkFolders();
  const config = {};

  config.components = await convertJson2Array('components.json');
  config.plugins = await convertJson2Array('plugins.json');

  linkAllLibs(config.components);
  linkAllLibs(config.plugins);

  saveGeneratedJson(paths.config.target, paths.config.source, paths.config.ts, config);
}

// Just call main function
main();
