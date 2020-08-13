// Takes a directory of JSON FHIR definitions (DSTU2, STU3 or R4) and extracts the information
// about "choice types" (polymorphic fields).

const path = require('path');
const fs = require('fs');

const args = require('yargs')
  .nargs('fhirDefDir', 1)
  .describe('fhirDefDir', 'the directory pathname for the JSON FHIR '+
    'definitions to be processed')
  .nargs('outputDir', 1)
  .describe('outputDir', 'the directory into which the output files should be written')
  .demandOption(['fhirDefDir', 'outputDir'])
  .help('h')
  .alias('h', 'help')
  .argv;

const fhirDefDir = args.fhirDefDir;
const outputDir = args.outputDir;

// Files defining choice type fields
const choiceTypeFiles = ['profiles-types.json', 'profiles-resources.json',
  'profiles-others.json'];

let choiceTypePaths = {};
let pathsDefinedElsewhere = {};
for (let f of choiceTypeFiles) {
  // for DSTU2 we use "nameReference" instead of "contentReference"
  // (https://www.hl7.org/fhir/DSTU2/elementdefinition.html)
  let name2Path = {};

  // File all of the "path" information from the file.  There will be
  // duplicates, but we will use a hash to get a unique list.
  let fData = JSON.parse(fs.readFileSync(path.join(fhirDefDir, f)));
  // Walk the tree, looking for "path", and then finding the associated "type"
  // field, if any.
  let currentResource;
  function visitNode(n) {
    if (n.kind === "resource") {
      currentResource = n;
      // Only process definitions that are not constraints on resources defined
      // elsewhere.
      if (currentResource.derivation !== "constraint") {
        // Only process snapshot definitions (not differentials)
        visitNode(currentResource.snapshot);
      }
    }
    else {
      if (n.id && n.path && n.contentReference) {
        if (n.contentReference[0] !== '#')
          throw new Error('Unhandled new type of contentReference');
        let refID = n.contentReference.slice(1);
        // The content references point to IDs, and we want the path, which is
        // the same except for slice labels.  Remove those.
        refID = refID.replace(/:[^\.]+/g, '');
        pathsDefinedElsewhere[n.path] = refID;
      }

      // for DSTU2 we use "nameReference" instead of "contentReference"
      if (n.path && n.name) {
        // save path for each name
        // name is not unique in the JSON, but it always appears before nameReference which refers to it
        name2Path[n.name] = n.path;
      }
      if (n.path && n.nameReference) {
        // we use previously saved path by name
        pathsDefinedElsewhere[n.path] = name2Path[n.nameReference];
      }

      if (n.path && n.type && n.path.match(/\[x\]$/)) {
        // Uppercase the first letter of the type codes so they can be appended to
        // the choice field name.
        let types = n.type.map(t=>t.code[0].toUpperCase() + t.code.slice(1));
        // Remove the [x] from end of the path and store only unique "types"
        choiceTypePaths[n.path.slice(0, -3)] =[...new Set(types)];
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
  }
  visitNode(fData);
}

// Output the results as JSON hash for ease of import and ease of checking
// whether a path is a choice type path.
// Since there are no nested objects, we can easily sort the output keys.
fs.writeFileSync(path.join(outputDir, 'choiceTypePaths.json'),
  JSON.stringify(choiceTypePaths, Object.keys(choiceTypePaths).sort(), 2));
fs.writeFileSync(path.join(outputDir, 'pathsDefinedElsewhere.json'),
  JSON.stringify(pathsDefinedElsewhere, Object.keys(pathsDefinedElsewhere).sort(), 2));

