module.exports = ({
                    options,
                    fhirpathOptions
                  }) => {

  // GLN (Global Location Number) checksum validation expression
  // Source: https://hl7.dk/fhir/core/StructureDefinition-dk-core-gln-identifier.html
  // See also:
  // https://www.gs1.org/services/how-calculate-check-digit-manually
  // https://en.wikipedia.org/wiki/Global_Location_Number#Check_digit_calculation
  const expression = "(( (10-((substring(0,1).toInteger()*1)+ (substring(1,1).toInteger()*3)+ (substring(2,1).toInteger()*1)+ (substring(3,1).toInteger()*3)+ (substring(4,1).toInteger()*1) +(substring(5,1).toInteger()*3) +(substring(6,1).toInteger()*1) +(substring(7,1).toInteger()*3) +(substring(8,1).toInteger()*1) +(substring(9,1).toInteger()*3) +(substring(10,1).toInteger()*1) +(substring(11,1).toInteger()*3))mod(10))mod(10))=substring(12,1).toInteger())";

  // Valid GLN number: 5798002472264 (13 digits with valid checksum)
  const validGLN = "5798002472264";

  // Invalid GLN number: 5798002472265 (13 digits with invalid checksum)
  const invalidGLN = "5798002472265";

  return [
    ...(options.compileOnly
      ? []
      : [
        {
          name: `GLN checksum validation (valid) using evaluate()`,
          filename: 'gln-validation-evaluate-valid',
          expression,
          cases: [{
            name: '',
            testFunction: (fhirpath, model) => {
              return () => fhirpath.evaluate(validGLN, expression, {}, model, fhirpathOptions);
            }
          }]
        },
        {
          name: `GLN checksum validation (invalid) using evaluate()`,
          filename: 'gln-validation-evaluate-invalid',
          expression,
          cases: [{
            name: '',
            testFunction: (fhirpath, model) => {
              return () => fhirpath.evaluate(invalidGLN, expression, {}, model, fhirpathOptions);
            }
          }]
        }
      ]),
    {
      name: `GLN checksum validation (valid) using compile()`,
      filename: 'gln-validation-compile-valid',
      expression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            return () => compiledFn(validGLN, {});
          }
        }
      ]
    },
    {
      name: `GLN checksum validation (invalid) using compile()`,
      filename: 'gln-validation-compile-invalid',
      expression,
      cases: [
        {
          name: '',
          testFunction: (fhirpath, model, compiledFn) => {
            return () => compiledFn(invalidGLN, {});
          }
        }
      ]
    }
  ];

}
