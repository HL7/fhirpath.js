// Type declarations for the ES module wrapper (src/fhirpath.mjs).
//
// The default export mirrors the CommonJS module.exports object, while the
// named exports are re-exported from the CommonJS declarations so both import
// styles are typed. The CommonJS `require` path keeps using fhirpath.d.ts,
// which intentionally has no default export.

export * from './fhirpath.js';

import type {
  compile,
  evaluate,
  parse,
  resolveInternalTypes,
  types,
  version,
  FP_Decimal,
  util,
  ucumUtils
} from './fhirpath.js';


declare const fhirpath: {
  version: typeof version;
  parse: typeof parse;
  compile: typeof compile;
  evaluate: typeof evaluate;
  resolveInternalTypes: typeof resolveInternalTypes;
  types: typeof types;
  FP_Decimal: typeof FP_Decimal;
  ucumUtils: typeof ucumUtils;
  util: typeof util;
};

export default fhirpath;
