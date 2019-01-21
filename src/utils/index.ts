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

export { deepCopy, dateFormatter };
