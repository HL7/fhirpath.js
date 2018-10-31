# fhirpath.js

[![Build Status](https://travis-ci.org/lhncbc/fhirpath.js.svg?branch=master)](https://travis-ci.org/lhncbc/fhirpath.js)

[FHIRPath](http://hl7.org/fhirpath/) implementation in JavaScript.

## Demo
Try it out on the [demo page](https://lhncbc.github.io/fhirpath.js/).


## Usage

Installation:

```sh
npm install –save fhirpath
```

```js

// Evaluating FHIRPath
// API: evaluate(resourceObject, fhirPathExpression, environment)
const fhirpath = require('fhirpath');
fhirpath.evaluate({"resourceType": "Patient", ...}, 'Patient.name.given');

// Environment variables can be passed in as third argument as a hash of
// name/value pairs:
fhirpath.evaluate({}, '%a - 1', {a: 5});

// Precompiling fhirpath - result can be reused against multiple resources
const path = fhirpath.compile('Patient.name.given');
var res2 = path({"resourceType": "Patient", ...});

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

Instead of passing a filename containing the resource, the string of JSON
representing the resource can be passed directly as the second argument (which
is useful for testing and experimenting).

Environment variables can be passed as a third argument as a string of JSON.

If given just the FHIRPath expression, the utility will print the parsed tree:

```sh
fhirpath 'Patient.name.given'

> ... will print fhirpath ast in yaml
```

## Implementation Status

We are currently implementing version 1.0 (a.k.a STU1) of
[FHIRPath](http://hl7.org/fhirpath/).

The core parser was generated from the FHIRPath ANTLR grammar.

Completed sections:
- 3 (Path selection) - except that "is" and "as" are not supported yet
- 5.1 (Existence)
- 5.2 (Filtering and Projection) "ofType" - basic support for primitives
- 5.3 (Subsetting)
- 5.4 (Combining)
- 5.6 (String Manipulation)
- 5.7 (Tree Navigation)
- 5.8 (Utility Functions)
- 6.1 (Equality)
- 6.4 (Collections)
- 6.5 (Boolean logic)
- 6.6 (Math)
- 6.8 (Operator Precedence) - handled by ANTLR parser
- 7   (Lexical Elements) - handled by ANTLR parser
- 8   (Environment Variables)

Partially completed sections:
- 6.2 (Comparison) - type checking is not completely performed, and dates are
  treated as strings (for now).

We are deferring handling information about FHIR resources, as much as
possible.  This affects implementation of the following sections:
- 6.3 (Types) - deferred

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
