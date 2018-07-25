// Generates the needed subset of information from profiles-resources.json (as
// downloaded from the FHIR definitions link at
// https://www.hl7.org/fhir/downloads.html) to create
// fhir-context/resource-data.json.

if (process.argv.length < 3)
  throw "Usage:  node bin/subset-resource-data.js profiles-resources.json"

let fs = require('fs');
let bundle = JSON.parse(fs.readFileSync(process.argv[2]));
// At the moment, we just need resource names.
let names = [];
for (let def of bundle.entry) {
  if (def.resource.resourceType === 'StructureDefinition')
    names.push(def.resource.name);
}

var path = require('path');
var scriptDir = path.dirname(process.argv[1]);
let outFile = path.join(scriptDir, '..', 'fhir-context', 'resource-data.json');
fs.writeFileSync(outFile, JSON.stringify(names, null, 2));
