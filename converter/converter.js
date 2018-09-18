import util from 'util';
import _ from 'lodash';

import xml2js from 'xml2js';
import yaml from 'js-yaml';

export default async (xmlData) => {
  const parser = new xml2js.Parser({ explicitCharkey: true });
  const parseString = util.promisify(parser.parseString);

  const parsed = await parseString(xmlData);
  const transformed = transform(parsed);
  const formatted = yaml.dump(transformed);
  return formatted;
};

const castValue = (value, type) => {
  const identity = (v) => v;

  const mapper = {
    boolean: (v) => v === 'true' ? true : false,
    integer: (v) => Number(v),
    string: identity,
    date: identity,
    code: identity,
    Quantity: identity
  };
  return mapper[type](value);
};

const transform = (node) => {

  return Object.keys(node).reduce((acc, key) => {

    switch(key) {
    case 'tests':
      return { tests: transform(node[key]) };

    case 'group':
      return _.flatten([...acc, ...node[key].map(item => transform(item))]);

    case 'test':
      return [acc, ...node[key].map(item => transform(item))];

    case '$':
      return { desc: `** ${node[key].name || 'test'}` };

    case 'expression': {
      const value = _.first(node[key]);
      const hasError = _.get(value, ['$', 'invalid']);
      const updated = { ...acc, [key]: value['_'] };
      if (hasError) {
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

