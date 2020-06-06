const util = require('util');
const _ = require('lodash');

const xml2js = require('xml2js');
const yaml = require('js-yaml');

const fhirpath = require('../src/fhirpath');
const { getFHIRModel, calcExpression } = require("../test/test_utils");
const FP_DateTime = require('../src/types').FP_DateTime;
const equals = _.isEqual;

/**
 * Validates a test to determine whether to disable it
 * @param {Object} test
 * @return {boolean}
 */
function validateTest(test) {
  if (!test.error && test.expression) {
    try {
      const result = calcExpression(test.expression, test);
      // Run the result through JSON so the FP_Type quantities get converted to
      // strings.  Also , if the result is an FP_DateTime, convert to a Date
      // object so that timezone differences are handled.
      if (result.length === 1 && result[0] instanceof FP_DateTime)
        return equals(new Date(result[0]), new Date(test.result[0]));
      else
        return equals(JSON.parse(JSON.stringify(result)), test.result);
    } catch (e) {
      return false;
    }
  }
  else if (test.error) {
    let exception = null;
    try {
      fhirpath.evaluate({}, test.expression, null,
        getFHIRModel(test.model));
    }
    catch (error) {
      exception = error;
    }
    return exception !== null;
  }
}

module.exports = {
  resourceXmlStringToJsonString: async (xmlData) => {
    const parser = new xml2js.Parser({explicitCharkey: false});
    const parseString = util.promisify(parser.parseString);

    const parsed = await parseString(xmlData);
    const resourceType = Object.keys(parsed)[0];
    const transformed = { resourceType, ...transformResource(parsed[resourceType])};
    return JSON.stringify(transformed, null, 2);
  },
  testsXmlStringToYamlString: async (xmlData) => {
    const parser = new xml2js.Parser({ explicitCharkey: true });
    const parseString = util.promisify(parser.parseString);

    const parsed = await parseString(xmlData);
    const transformed = transform(parsed);
    transformed.tests.forEach(group => {
      const groupKey = Object.keys(group)[0];
      const groupTests = group[groupKey];
      if (groupTests.some(test => test.disable) && groupTests.every(test => test.disable || test.error)) {
        group.disable = true;
        groupTests.forEach(test => delete test.disable);
      }
    });
    return yaml.dump(transformed);
  }
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
        return { tests: transform(_.pick(node[key], 'group')) };

      case 'group':
        return [...acc, ...node[key].map(item =>
          ({ [`group: ${item['$'].description || item['$'].name}`]: transform(_.pick(item, 'test')) }))];

      case 'test':
        return [...acc, ...node[key].map(item => {
          let test = transform(item);
          if (!validateTest(test)) {
            test.disable = true;
          }
          return test;
        })];

      case '$': {
        const value = node[key];
        const updated = { desc: `** ${node[key].description || node[key].name || 'test'}` };
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

/**
 * Checks if current path ends with one of string or match regexp.
 * @param {Array<string>} currentPath - array of property names defines the path in the resource object
 * @param {Array<string|RegExp>} paths - array of strings or regexp to check
 * @return {boolean}
 */
function checkPaths(currentPath, paths) {
  return paths.some(path => path instanceof RegExp ? path.test(currentPath.join('.')) : currentPath.join('.').endsWith(path));

}

/**
 * Checks if we should convert string value to number for current path in the resource object
 * @param {Array<string>} currentPath - array of property names defines the path in the resource object
 * @return {boolean}
 */
function isPathForNumber(currentPath) {
  return checkPaths( currentPath, [/(?<!identifier\.)value\.\$/, 'rank.$', 'total.$', 'offset.$']);
}

/**
 * Checks if we should use Array value for current path in the resource object
 * @param {Array<string>} currentPath - array of property names defines the path in the resource object
 * @return {boolean}
 */
function isPathForArray(currentPath) {
  return checkPaths(currentPath, ['coding', 'category', 'given', /(?<!contact\.)address$/, 'contact', 'relationship',
    'line', 'telecom', 'subjectType', 'item', 'enableWhen', 'profile', 'include', 'filter', 'extension',
    'parameter', /^identifier$/, 'item.code']);
}

/**
 * Converts Object representing resource XML node to resource JSON object
 * @param {Object} node - result of xml2js.parseString
 * @param {Array<string>} [path] - array of property names defines the path in the resource object, for recursion
 */
function transformResource(node, path) {
  path = path || [];
  return Object.keys(node).reduce((acc, key) => {
    const currentPath = path.concat(key);
    const v = node[key].value;
    const predefined = {
      'true': {val: true},
      'false': {val: false}
    };

    switch(key) {
      case '$':
        if (predefined[v]) {
          return predefined[v].val;
        }
        if (v) {
          return (isPathForNumber(currentPath) && !isNaN(v)) ? +v : v;
        }
        break;
      case 'div':
        break;
      default:
        if (Array.isArray(node[key])) {
          const arr = node[key].map(item => transformResource(item, currentPath));
          if (arr.length === 1 && !isPathForArray(currentPath)) {
            acc[key] = arr[0];
          } else {
            acc[key] = arr;
          }
        } else {
          acc[key] = transformResource(node[key], currentPath);
        }
    }
    return acc;
  }, {});
}
