const _ = require('lodash');

module.exports = ({
                    current_fhirpath,
                    current_r4_model,
                    minimumDataset,
                    options
                  }) => {
  // We need copy of objects because the __path__ property is not configurable and may have different values in different versions
  const minimumDatasetCopy1 = _.cloneDeep(minimumDataset);
  const minimumDatasetCopy2 = _.cloneDeep(minimumDataset);
  const numberOfItems = current_fhirpath.evaluate(minimumDatasetCopy1,'Questionnaire.descendants().count()', {},  current_r4_model);
  const expression = 'Questionnaire.descendants()';

  return [{
    name: `Getting ${numberOfItems} descendants`,
    filename: 'descendants',
    expression,
    cases: [
      ...(options.compileOnly
        ? []
        : [{
          name: `using evaluate()`,
          testFunction: (fhirpath, model) => {
            fhirpath.evaluate(fhirpath === current_fhirpath ? minimumDatasetCopy1 : minimumDatasetCopy2, expression, {}, model);
          }
        }]),
      {
        name: `using compile()`,
        testFunction: (fhirpath, model, compiledFn) => {
          compiledFn(fhirpath === current_fhirpath ? minimumDatasetCopy1 : minimumDatasetCopy2, {});
        }
      }
    ]
  }];

}
