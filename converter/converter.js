const util = require('util');
const _ = require('lodash');

const xml2js = require('xml2js');
const yaml = require('js-yaml');

const fhir = new (require('fhir').Fhir);
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

const mapper = {
  boolean: (v) => v === 'true',
  integer: (v) => Number(v),
  string: _.identity,
  date: _.identity,
  code: _.identity,
  Quantity: _.identity
};

const castValue = (value, type) => mapper[type](value);

/**
 * Converts Object representing test cases from XML to Object that can be serialized to YAML
 * @param {Object} node - result of xml2js.parseString
 * @return {Object}
 */
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
          if (!test.hasOwnProperty('result') && !test.error) {
            test.result = [];
          }
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

module.exports = {
  /**
   * Serializes an XML resource to JSON
   * @param {string} xmlData
   * @returns {string}
   */
  resourceXmlStringToJsonString: async (xmlData) => {
    return fhir.xmlToJson(xmlData).replace(/\t/g, '  ');
  },
  /**
   * Serializes an XML test cases to YAML
   * @param {string} xmlData
   * @returns {string}
   */
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