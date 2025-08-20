const fs = require('fs');
const util = require('util');
const convert = require('./converter');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = {
  /**
   * Converts an XML resource file to a JSON file. If the input file is not XML,
   * it is assumed to be JSON and copied as is.
   *
   * @param {string} from - path to XML(or JSON) file.
   * @param {string} to - path to JSON file
   */
  resourceXmlFileToJsonFile: async (from, to) => {
    const fileContent = (await readFile(from)).toString();
    if (fileContent.startsWith('<') && !from.endsWith('.xml')) {
      console.log('Incorrect file name, should end with *.xml: ', from);
    } else if (!fileContent.startsWith('<') && from.endsWith('.xml')) {
      console.log('Incorrect file name, should end with *.json: ', from);
    }
    const resultJson = from.endsWith('.xml') ?
      await convert.resourceXmlStringToJsonString(fileContent)
      : fileContent;
    await writeFile(to, resultJson);
  },


  /**
   * Converts XML test cases to the YAML format
   * @param {string} from - path to XML file
   * @param {string} to - path to YAML file
   * @param {string} model - model name, e.g. 'r5', 'r4','stu3', 'dstu2'
   */
  testsXmlFileToYamlFile: async (from, to, model) => {
    const fileContent = await readFile(from);
    const resultYaml = await convert.testsXmlStringToYamlString(fileContent, model);
    await writeFile(to, resultYaml);
  }
};
