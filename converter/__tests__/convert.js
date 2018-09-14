import fs from 'fs';
import convert from '../../converter/converter';


const xmlData = fs.readFileSync('./converter/__tests__/fixtures/base-data.xml').toString();
const yamlData = fs.readFileSync('./converter/__tests__/fixtures/base-data.yaml').toString();

test('base test', async () => {
    const data = await convert(xmlData);
    expect(data).toEqual(yamlData);
});

