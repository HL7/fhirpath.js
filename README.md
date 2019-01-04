# fhirpath.js

[![Build Status](https://travis-ci.org/lhncbc/fhirpath.js.svg?branch=master)](https://travis-ci.org/lhncbc/fhirpath.js)

[FHIRPath](http://hl7.org/fhirpath/) implementation in JavaScript.

## Demo
Try it out on the [demo page](https://lhncbc.github.io/fhirpath.js/).



## Installation:

### Server-side (Node.js)

```sh
npm install –save fhirpath
```

```js
const fhirpath = require('fhirpath');
```

### Web-browser:

Download the zip file from the [releases
page](https://github.com/lhncbc/fhirpath.js/releases).  It contains a JavaScript
file, fhirpath.min.js, which defines a global "fhirpath" variable, which you can
then use as shown below.

## Usage
```
// Evaluating FHIRPath
// API: evaluate(resourceObject, fhirPathExpression, environment)
// Note:  The resource will be modified by this function to add type information.
fhirpath.evaluate({"resourceType": "Patient", ...}, 'Patient.name.given');

// Environment variables can be passed in as third argument as a hash of
// name/value pairs:
fhirpath.evaluate({}, '%a - 1', {a: 5});

// Precompiling fhirpath - result can be reused against multiple resources
const path = fhirpath.compile('Patient.name.given');
var res2 = path({"resourceType": "Patient", ...});

```


## fhirpath CLI

bin/fhirpath is a command-line tool for experimenting with FHIRPath.

```sh
curl http://www.hl7.org/fhir/patient-example-a.json  > pt.json

fhirpath --expression 'Patient.name.given' --resourceFile pt.json

> fhirpath(Patient.name.family) =>
> [
>  "Donald"
> ]
```

Instead of passing a filename containing the resource, the string of JSON
representing the resource can be passed directly via --resourceJSON (useful if
the JSON is brief).

```sh
fhirpath --expression 'a.b + 2' --resourceJSON '{"a": {"b": 1}}'

> fhirpath(a.b + 2) =>
> [
>  3
> ]
```

Environment variables can be passed via --variables followed by the JSON for an object with variable names as keys.

```sh
fhirpath --expression '%v + 2' --resourceJSON '{}' --variables '{"v": 5}'

> fhirpath(%v + 2) =>
> [
>  7
> ]
```

If given just the FHIRPath expression, the utility will print the parsed tree:

```sh
fhirpath --expression 'Patient.name.given'

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
- 6.2 (Comparison)
- 6.4 (Collections)
- 6.5 (Boolean logic)
- 6.6 (Math)
- 6.8 (Operator Precedence) - handled by ANTLR parser
- 7   (Lexical Elements) - handled by ANTLR parser
- 8   (Environment Variables)

We are deferring handling information about FHIR resources, as much as
possible.  This affects implementation of the following sections:
- 6.3 (Types) - deferred
Also, because in JSON DateTime and Time types are represented as strings, if a
string in a resource looks like a DateTime or Time (matches the regular
expression defined for those types in FHIR), the string will be interpreted as a
DateTime or Time.

## Development Notes

This section is for people doing development on this package (as opposed to
using the package).

If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".


### Building the demo page

```
npm install && npm run build
cd demo
npm install && npm run build && npm run start
```

open browser on localhost:8080
