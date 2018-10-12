const fs = require('fs');
const convert = require('../converter/converter');

const xmlData = fs.readFileSync(__dirname + '/fixtures/base-data.xml').toString();
const yamlData = fs.readFileSync(__dirname + '/fixtures/base-data.yaml').toString();

describe('Converter base test', () => {
  it('Convert simple structure', async () => {
    const data = await convert(xmlData);
    expect(data).toEqual(yamlData);
  });
});
