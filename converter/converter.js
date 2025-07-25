const util = require('../src/utilities');
// Cannot use util.hasOwnProperty directly because it triggers the error:
// "Do not access Object.prototype method 'hasOwnProperty' from target object"
const { hasOwnProperty } = util;
const nodeUtil = require('util');
const _ = require('lodash');

const xml2js = require('xml2js');
const yaml = require('js-yaml');

const fhir = new (require('fhir').Fhir);
const { calcExpression } = require("../test/test_utils");
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
        return equals(JSON.parse(util.toJSON(result)), test.result);
    } catch (e) {
      return false;
    }
  }
  else if (test.error) {
    let exception = null;
    try {
      calcExpression(test.expression, test);
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
  decimal: (v) => Number(v),
  string: _.identity,
  date: (v) => (/^@(.*)/.exec(v)?.[1] || ''),
  dateTime: (v) => (/^@(.*)/.exec(v)?.[1] || ''),
  time: (v) => (/^@T(.*)/.exec(v)?.[1] || ''),
  code: _.identity,
  id: _.identity,
  Quantity: _.identity
};

const castValue = (value, type) => {
  if (!mapper[type]) {
    console.log(`Warning, unhandled data type "${type}", value "${value}" used as is.`);
    return value; // return as is if type is not handled
  }
  return mapper[type](value);
};

/**
 * Converts Object representing test cases from XML to Object that can be serialized to YAML
 * @param {Object} node - result of xml2js.parseString
 * @param {string} model - model name, e.g. 'r5', 'r4','stu3', 'dstu2'
 * @return {Object}
 */
const transform = (node, model = null) => {

  return Object.keys(node).reduce((acc, key) => {

    switch(key) {
      case 'tests':
        return { tests: transform(_.pick(node[key], 'group'), model) };

      case 'group':
        return [...acc, ...node[key].map(item =>
          ({ [`group: ${item['$'].description || item['$'].name}`]: transform(_.pick(item, 'test'), model) }))];

      case 'test':
        return [...acc, ...node[key].map(item => {
          let test = transform(item, model);
          // Add model to the test if it is specified
          if (model) {
            test.model = model;
          }
          if (!hasOwnProperty(test,'result') && !test.error) {
            test.result = [];
          }
          if (!validateTest(test)) {
            // if the test cannot be passed, we disable it
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
        return {
          ...acc,
          result: node[key].map((item) => {
            let type = item['$']?.['type'];
            const value = item['_'] ?? '';
            if (!type) {
              if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
                type = 'decimal';
              } else if (/^[+-]?\d+(\.\d+)?\s\S+$/.test(value)) {
                type = 'Quantity';
              } else if (/^(true|false)$/.test(value)) {
                type = 'boolean';
              } else if (/^@T/.test(value)) {
                type = 'time';
              } else if (/^@/.test(value)) {
                type = 'dateTime';
              } else {
                console.log('Warning, output node doesn\'t have type: ', acc, item['_']);
              }
            }
            return castValue(value, type);
          })
        };
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
    return fhir.xmlToJson(
      // Remove comment from XML data, because xmlToJson converts this XML comment:
      //   <!--   use FHIR code system for male / female   -->
      //   <gender value="male"/>
      //
      // to this JSON:
      //   "_gender": {
      //     "fhir_comments": [
      //       "   use FHIR code system for male / female   "
      //     ]
      //   },
      xmlData.replaceAll(/<!--[\s\S]*?-->/g, "")
    ).replace(/\t/g, '  ');
  },
  /**
   * Serializes an XML test cases to YAML
   * @param {string} xmlData
   * @param {string} model - model name, e.g. 'r5', 'r4','stu3', 'dstu2'
   * @returns {string}
   */
  testsXmlStringToYamlString: async (xmlData, model) => {
    const parser = new xml2js.Parser({ explicitCharkey: true });
    const parseString = nodeUtil.promisify(parser.parseString);

    const parsed = await parseString(xmlData);
    const transformed = transform(parsed, model);
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
