# fhirpath.js

[![Build Status](https://travis-ci.org/lhncbc/fhirpath.js.svg?branch=master)](https://travis-ci.org/lhncbc/fhirpath.js)

FHIRPath implementation in javascript.

[Demo Page](https://lhncbc.github.io/fhirpath.js/)


## Usage

Installation:

```sh
npm install –save fhirpath
```

```js

const fhirpath = require('fhirpath');
fhirpath.evaluate('{"resourceType": "Patient", ...}', 'Patient.name.given');

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
fhirpath 'Patient.name.given'

> ... will print fhirpath ast in yaml


## Implementation Status

We are currently implementing version 1.0 (a.k.a STU1) of
[FHIRPath](http://hl7.org/fhirpath/).

Completed sections:
- 5.1 (Existence)
- 6.1 (Equality)
- 6.6 (Math)

Partially completed sections:
- 6.2 (Comparison) - type checking is not completely performed

Deviations:
- The library compares dateTime strings as strings, because it does not know
  which strings are dates.  If your times consistently use "Z" for their
  timezone, or consistently avoid using "Z", this should not cause a problem.

## Development Notes

This section is for people doing development on this package (as opposed to
using the package).

If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".


### Building the demo page

```
npm run build
cd demo
npm install && npm run start
```

open browser on localhost:8080
