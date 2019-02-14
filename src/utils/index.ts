const deepCopy = (o: LooseObject) => {
  return JSON.parse(JSON.stringify(o));
};

const dateFormatter = inputDate => {
  let date = inputDate.split('T');

  let currentDate = new Date(date[0]);

  let finalDate =
    (`${currentDate.getMonth() + 1}`.length === 1 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1) +
    '.' +
    (`${currentDate.getDate()}`.length === 1 ? '0' + currentDate.getDate() : currentDate.getDate()) +
    '.' +
    currentDate.getFullYear();

  return finalDate;
};

const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const getSchemaPaths = function (schemaWithoutRefs: LooseObject, path: string, paths: Array<string>) {
  if (!schemaWithoutRefs.properties && schemaWithoutRefs.type === 'string') {
    paths.push(`${path}%`);
  } else if (schemaWithoutRefs.properties) {
    Object.keys(schemaWithoutRefs.properties).forEach(key => {
      let newPath = String(path);
      let prefix = path.length > 0 ? ',' : '';
      if (schemaWithoutRefs.properties[key].type === 'array') {
        newPath += `${prefix}${key},[n]`;
        return getSchemaPaths(schemaWithoutRefs.properties[key].items, newPath, paths);
      } else {
        newPath += `${prefix}${key}`;
        return getSchemaPaths(schemaWithoutRefs.properties[key], newPath, paths);
      }
    
    });
  }
};

export { deepCopy, dateFormatter, capitalizeFirstLetter, getSchemaPaths };
