const deepCopy = (o: LooseObject) => {
  return JSON.parse(JSON.stringify(o));
};

export {
  deepCopy
};
