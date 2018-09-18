const fs = require('fs');
const util = require('util');
const convert = require('./converter');

module.exports = async (from, to) => {
  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);
  const xmlData = await readFile(from);
  const ymlData = await convert(xmlData);
  await writeFile(to, ymlData);
};
