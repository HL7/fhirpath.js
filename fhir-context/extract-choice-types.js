// Takes a directory of JSON FHIR definitions (STU3 or R4) and extracts the information
// about "choice types" (polymorphic fields).

const process = require('process');
const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');

const fhirDefDir = process.argv[2];
if (!fhirDefDir) {
  throw new Error('Please specify the directory pathname for the JSON FHIR '+
    'definitions to be processed.');
}

// Files defining choice type fields
const choiceTypeFiles = ['profiles-others.json', 'profiles-resources.json',
  'profiles-types.json'];

let choiceTypePaths = {};
for (let f of choiceTypeFiles) {
  // File all of the "path" information from the file.  There will be
  // duplicates, but we will use a hash to get a unique list.
  let fData = JSON.parse(fs.readFileSync(path.join(fhirDefDir, f)));
  // Walk the tree, looking for "path", and then finding the associated "type"
  // field, if any.
  function visitNode(n) {
    if (n.id && n.path && n.type && n.path.match(/\[x\]$/)) {
      // Uppercase the first letter of the type codes so they can be appended to
      // the choice field name.
      let types = n.type.map(t=>t.code[0].toUpperCase() + t.code.slice(1));
      // Remove the [x] from end of the path
      choiceTypePaths[n.path.slice(0, -3)] = types;
    }
    else {
      // Check sub-nodes that are objects or arrays
      if (Array.isArray(n)) {
        for (let e of n)
         visitNode(e);
      }
      else if (typeof n === "object") {
        for (let k of Object.keys(n))
          visitNode(n[k]);
      }
    }
  }
  visitNode(fData);
}

// Output the results as JSON hash for ease of import and ease of checking
// whether a path is a choice type path.
// Since this there no nested objects, we can easily sort the output keys.
console.log(JSON.stringify(choiceTypePaths, Object.keys(choiceTypePaths).sort(), 2));
