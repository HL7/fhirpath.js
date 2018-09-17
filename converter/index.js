import fs from 'fs';
import convert from './converter';

export const run =  async (from, to) => {
  const xmlData = fs.readFileSync(from);
  const ymlData = await convert(xmlData);
  fs.writeFileSync(to, ymlData);
};
