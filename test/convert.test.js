const fs = require('fs');
const convert = require('../converter/converter');
const { loadResource } = require("./test_utils");

const testXmlString = fs.readFileSync(__dirname + '/fixtures/base-data.xml').toString();
const testYamlString = fs.readFileSync(__dirname + '/fixtures/base-data.yaml').toString();

const resourceXmlString = fs.readFileSync(__dirname + '/fixtures/resource-example.xml').toString();
const resourceYamlString = fs.readFileSync(__dirname + '/fixtures/resource-example.json').toString();

describe('Converter base test', () => {
  it('Convert a simple tests from XML to YAML', async () => {
    loadResource('resource-example.json', __dirname + '/fixtures/resource-example.json');
    const data = await convert.testsXmlStringToYamlString(testXmlString);
    expect(data).toEqual(testYamlString);
  });

  it('Convert a simple resource from XML to JSON', async () => {
    const data = await convert.resourceXmlStringToJsonString(resourceXmlString);
    expect(data).toEqual(resourceYamlString);
  });
});
