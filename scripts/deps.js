const fs = require('fs');
const path = require('path');
const deps = require('../config/deps');

// Script start
console.log('\nLinking defined components and plugins...');

// Define paths for app, components, plugins
const appPath = path.resolve(__dirname, '..');
const componentsPath = path.resolve(appPath, 'components');
const pluginsPath = path.resolve(appPath, 'plugins');

// Create components folder if doesn't exists
if (!fs.existsSync(componentsPath)) {
  console.log('Folder for components doesn\'t exists, try to create it...');
  fs.mkdirSync(componentsPath);
}

// Create plugins folder if doesn't exists
if (!fs.existsSync(pluginsPath)) {
  console.log('Folder for plugins doesn\'t exists, try to create it...');
  fs.mkdirSync(pluginsPath);
}

// Get all libs which will be linked
const libs = deps.getLibDefinitions([ 'components.json', 'plugins.json' ]);

// Go over all libs and link them
for (let i = 0; i < libs.length; i++) {
  if (!fs.existsSync(libs[i].target)) {
    console.log('Lib ' + libs[i].target + ' doesn\'t exists and cannot be linked!');
    continue;
  }

  if (fs.existsSync(libs[i].libPath)) {
    console.log('Lib ' + libs[i].target + ' is already linked...');
    continue;
  }

  fs.symlinkSync(libs[i].target, libs[i].libPath, 'dir');
  console.log('Linked ' + libs[i].type.slice(0, -1) + ' ' + libs[i].name + ' (' + libs[i].target + ') into project...');
}

console.log('');
