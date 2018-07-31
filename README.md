# fhirpath.js

[![Build Status](https://travis-ci.org/lhncbc/fhirpath.js.svg?branch=master)](https://travis-ci.org/lhncbc/fhirpath.js)

FHIRPath implementation in javascript.


## Usage

Installation:

```sh
npm install –save fhirpath
```

```js

const fhirpath = require('fhirpath');
fhirpath('{"resourceType": "Patient", ...}', 'Patient.name.given');

// precompile fhirpath
const path = fhirpath.compile('Patient.name.given');
var res2 = path('{"resourceType": "Patient", ...}');

```


## fhirpath util

```sh
npm install -g fhirpath

curl http://www.hl7.org/fhir/patient-example-a.json  > pt.json

fhirpath 'Patient.name.given' pt.json

> fhirpath(Patient.name.family) =>
> [
>  "Donald"
> ]
```

## Development Notes

If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".
