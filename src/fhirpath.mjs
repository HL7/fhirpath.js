// ES module wrapper around the CommonJS entry point (src/fhirpath.js).
//
// Node.js loads the CommonJS module.exports object as the default import; we
// re-expose it as this module's default export and destructure its members as
// named exports. This lets ES module consumers use either
// `import fhirpath from 'fhirpath'` or `import { evaluate } from 'fhirpath'`,
// while CommonJS consumers keep using `require('fhirpath')` unchanged.


import fhirpath from './fhirpath.js';


export default fhirpath;

export const {
  version,
  parse,
  compile,
  evaluate,
  resolveInternalTypes,
  types,
  FP_Decimal,
  ucumUtils,
  util
} = fhirpath;
