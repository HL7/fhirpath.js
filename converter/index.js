const fs = require('fs');
const util = require('util');
const convert = require('./converter');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  resourceXmlFileToJsonFile: async (from, to) => {
    const xmlData = await readFile(from);
    const ymlData = await convert.resourceXmlStringToJsonString(xmlData);
    await writeFile(to, ymlData);
  },
  testsXmlFileToYamlFile: async (from, to) => {
    const xmlData = await readFile(from);
    const ymlData = await convert.testsXmlStringToYamlString(xmlData);
    await writeFile(to, ymlData);
  }
};
