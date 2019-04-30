const util = require('util');
const _ = require('lodash');

const xml2js = require('xml2js');
const yaml = require('js-yaml');

module.exports = async (xmlData) => {
  const parser = new xml2js.Parser({ explicitCharkey: true });
  const parseString = util.promisify(parser.parseString);

  const parsed = await parseString(xmlData);
  const transformed = transform(parsed);
  const formatted = yaml.dump(transformed);
  return formatted;
};

const mapper = {
  boolean: (v) => v === 'true',
  integer: (v) => Number(v),
  string: _.identity,
  date: _.identity,
  code: _.identity,
  Quantity: _.identity
};

const castValue = (value, type) => mapper[type](value);

const transform = (node) => {

  return Object.keys(node).reduce((acc, key) => {

    switch(key) {
      case 'tests':
        return { tests: transform(node[key]) };

      case 'group':
        return [...acc, ...node[key].map(item =>
          ({ [`group: ${item['$'].name}`]: transform(_.pick(item, 'test')) }))];

      case 'test':
        return [...acc, ...node[key].map(item => transform(item))];

      case '$': {
        const value = node[key];
        const updated = { desc: `** ${node[key].name || 'test'}` };
        if (_.has(value, 'inputfile')) {
          updated.inputfile = value.inputfile.replace(/.xml$/, '.json');
        }
        return updated;
      }
      case 'expression': {
        const value = _.first(node[key]);
        const updated = { ...acc, [key]: value['_'] };
        if (_.has(value, ['$', 'invalid'])) {
          updated.error = true;
        }
        return updated;
      }
      case 'output':
        return { ...acc, result: node[key].map(({ '$': { type }, '_': value = '' }) => castValue(value, type)) };
      default:
        console.log('Warning, unhandled node');
        return acc;
    }
  }, []);
};
