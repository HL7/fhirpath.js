// Takes a directory of JSON FHIR definitions (DSTU2, STU3, R4 or R5) and extracts the information
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
let type2Parent = {};
let path2Type = {};

/**
 * Adds mapping from property path to data type.
 * @param {string} path - property path.
 * @param {string} code - data type code.
 */
function addPath2Type(path, code) {
  if (path.indexOf('.') !== -1) {
    if (/http:\/\/hl7\.org\/fhirpath\/(.*)/.test(code)) {
      path2Type[path] = RegExp.$1;
    } else {
      path2Type[path] = code;
    }
  }
}

/**
 * Extracts data type code from the type description object.
 * @param {Object} typeDesc - type description object. e.g.
 *  {
 *    "extension" : [{
 *      "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type",
 *        "valueUrl" : "id"
 *      }],
 *      "code" : "http://hl7.org/fhirpath/System.String"
 *  }
 * @return {string}
 */
function getTypeCode(typeDesc) {
  return typeDesc.code;
  // We don't currently use the extension, but we may need to in the future.
  // return typeDesc.extension?.find(
  //   e => e.url === 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type'
  // )?.valueUrl || typeDesc.code;
}

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
    if ( f !== 'profiles-others.json'
         && ['resource', 'datatype', 'complex-type', 'primitive-type']
            .some(i => i === n.kind)
         && n.name && (n.baseDefinition || n.base) ) {
      const type = n.name;
      const baseUrl = n.baseDefinition || n.base;
      if (type2Parent[type]) {
        throw new Error('Conflict: ' + type + '->' + type2Parent[type]
          + ' with: ' + type + '->' + baseUrl.lastIndexOf('/') + 1);
      } else {
        type2Parent[type] = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
      }
    }
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

      if (n.path && n.type) {
        if (n.path.match(/\[x\]$/)) {
          const prefix = n.path.slice(0, -3);
          // Uppercase the first letter of the type codes so they can be appended to
          // the choice field name.
          let types = n.type.map(t => {
            const typeCode = getTypeCode(t);
            const suffix = typeCode[0].toUpperCase() + typeCode.slice(1);
            addPath2Type(prefix + suffix, typeCode);
            return suffix;
          });
          // Remove the [x] from end of the path and store only unique "types"
          choiceTypePaths[prefix] = [...new Set(types)];
        } else {
          const typeDesc = n.type[0];
          // Obtaining FHIR Definition Data in the normal way
          addPath2Type(n.path, getTypeCode(typeDesc));
        }
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
fs.writeFileSync(path.join(outputDir, 'type2Parent.json'),
  JSON.stringify(type2Parent, Object.keys(type2Parent).sort(), 2));
fs.writeFileSync(path.join(outputDir, 'path2Type.json'),
  JSON.stringify(path2Type, Object.keys(path2Type).sort(), 2));
