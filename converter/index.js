import fs from 'fs';
import util from 'util';
import convert from './converter';

export const run =  async (from, to) => {
  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);
  const xmlData = await readFile(from);
  const ymlData = await convert(xmlData);
  await writeFile(to, ymlData);
};
