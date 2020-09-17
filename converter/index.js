const fs = require('fs');
const util = require('util');
const convert = require('./converter');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  /**
   * Converts XML resource to the YAML format
   * @param {string} from - path to XML file
   * @param {string} to - path to YAML file
   */
  resourceXmlFileToJsonFile: async (from, to) => {
    const xmlData = await readFile(from);
    const ymlData = await convert.resourceXmlStringToJsonString(xmlData);
    await writeFile(to, ymlData);
  },


  /**
   * Converts XML test cases to the YAML format
   * @param {string} from - path to XML file
   * @param {string} to - path to YAML file
   * @param {string} model - model name, e.g. 'r4','stu3', 'dstu2'
   */
  testsXmlFileToYamlFile: async (from, to, model) => {
    const xmlData = await readFile(from);
    const ymlData = await convert.testsXmlStringToYamlString(xmlData, model);
    await writeFile(to, ymlData);
  }
};
