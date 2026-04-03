module.exports = ({
                    options
                  }) => {

  const whitespaceEquivalenceExpression = "'ab\tc\td' ~ 'Ab C D'";

  return [
    ...(options.compileOnly
      ? []
      : [{
        name: 'Equivalence with repeated whitespace using evaluate()',
        filename: 'equivalence-evaluate',
        expression: whitespaceEquivalenceExpression,
        cases: [{
          name: '',
          testFunction: (fhirpath, model) => {
            return () => fhirpath.evaluate({}, whitespaceEquivalenceExpression, {}, model);
          }
        }]
      }]),
    {
      name: 'Equivalence with repeated whitespace using compile()',
      filename: 'equivalence-compile',
      expression: whitespaceEquivalenceExpression,
      cases: [{
        name: '',
        testFunction: (fhirpath, model, compiledFn) => {
          return () => compiledFn({}, {});
        }
      }]
    }];

}

