// This provides a FHIR context class for use in evaluating FHIRPath
// expressions.  This would normally be provided by an application using the
// interpreter, but this provides a default for applications not wishing to
// implement their own (and also for the package's test code).

let fs = require('fs');
let path = require('path');
let resourceNameList =
  JSON.parse(fs.readFileSync(path.join(__dirname, "generated/resource-data.json")));
let resourceNames = new Set(resourceNameList);
let Context = require ('../interpreter/context');

class FHIRContext extends Context {
  constructor(){
    super(resourceNames);
  }
}

module.exports = FHIRContext;
