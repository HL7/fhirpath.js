// ES module wrapper around the CommonJS FHIR DSTU2 model (index.js).
//
// Re-exposes the model object as the default export and its fields as named
// exports so ES module consumers can use either
// `import model from 'fhirpath/fhir-context/dstu2'` or named imports.


import model from './index.js';


export default model;

export const {
  version,
  choiceTypePaths,
  pathsDefinedElsewhere,
  type2Parent,
  path2Type,
  path2Repeating,
  resourcesWithUrlParam,
  path2TypeWithoutElements,
  path2RefType
} = model;
