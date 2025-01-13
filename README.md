# fhirpath.js

[FHIRPath](http://hl7.org/fhirpath/) implementation in JavaScript.

## Demo
Try it out on the [demo page](https://hl7.github.io/fhirpath.js/).

## Table of Contents:
- [Installation](#installation-)
  * [Server-side (Node.js)](#server-side--nodejs-)
  * [Web-browser](#web-browser-)
- [API Usage](#api-usage)
  * [Asynchronous functions](#asynchronous-functions)
  * [User-defined functions](#user-defined-functions)
- [fhirpath CLI](#fhirpath-cli)
- [Implementation Status](#implementation-status)
- [Development Notes](#development-notes)
  * [Building the demo page](#building-the-demo-page)
  * [Updating the FHIR module on a FHIR release](#updating-the-fhir-module-on-a-fhir-release)
- [Credits](#credits)

## Installation:

### Server-side (Node.js)

```sh
npm install --save fhirpath
```

```js
const fhirpath = require('fhirpath');
// For FHIR model data (choice type support) pull in the model file:
const fhirpath_r4_model = require('fhirpath/fhir-context/r4');
```

### Web-browser:

Download the zip file from the [releases
page](https://github.com/HL7/fhirpath.js/releases).  It contains a JavaScript
file, fhirpath.min.js, which defines a global "fhirpath" variable, which you can
then use as shown below.  Note that this file is UTF-8 encoded, and the script
needs to be loaded as such.  For an example, see the
browser-build/test/index.html file, which sets the page to be UTF-8.

For FHIR-specific features (e.g. handling of choice type fields), you will also
want to include a second file with the desired FHIR version model data, e.g.
fhirpath.r4.min.js for pulling in the R4 model.  (At the moment, those files are
small, but it would not be surprising if they grew as more support for FHIR type
handling is added, so they are kept seperate from the main FHIRPath file.)
These will define additional global variables like "fhirpath_dstu2_model",
"fhirpath_stu3_model" or "fhirpath_r4_model".

## API Usage

Evaluating FHIRPath:

```js
evaluate(resourceObject, fhirPathExpression, envVars, model, options);
```
where:
* resourceObject - FHIR resource, part of a resource (in this case
  fhirPathExpression.base should be provided), bundle as js object or array
  of resources.
* fhirPathExpression - string with FHIRPath expression, sample 'Patient.name.given',
  or object, if fhirData represents the part of the FHIR resource:
    * fhirPathExpression.base - base path in resource from which fhirData was extracted
    * fhirPathExpression.expression - FHIRPath expression relative to path.base
* envVars - a hash of variable name/value pairs.
* model - the "model" data object specific to a domain, e.g. R4.
  For example, you could pass in the result of require("fhirpath/fhir-context/r4");
* options - additional options:
    * options.resolveInternalTypes - whether values of internal
      types should be converted to standard JavaScript types (true by default).
      If false is passed, this conversion can be done later by calling
      fhirpath.resolveInternalTypes().
    * options.traceFn - An optional trace function to call when tracing.
    * options.userInvocationTable - a user invocation table used
      to replace any existing functions or define new ones.
    * options.async - defines how to support asynchronous functions:
        * false or similar to false, e.g. undefined, null, or 0 (default) - throw
          an exception,
        * true or similar to true - return Promise, only for asynchronous functions,
        * "always" - return Promise always.
    * options.terminologyUrl - a URL that points to a FHIR RESTful API that is
      used to create %terminologies that implements the Terminology Service API.
    * options.terminologyUrl - a URL that points to a terminology server. This
      URL is used to initialize %terminologies, as defined in the FHIR FHIRPath
      [Terminology Service API](https://www.hl7.org/fhir/fhirpath.html#txapi).
      See the [Implementation Status](#implementation-status) section for the
      currently supported %terminologies APIs.

Note:  The resource will be modified by this function to add type information.

Basic example:

```js
fhirpath.evaluate({"resourceType": "Patient", ...}, 'Patient.name.given');
```

Environment variables can be passed in as third argument as a hash of name/value
pairs:

```js
fhirpath.evaluate({}, '%a - 1', {a: 5});
```

To include FHIR model data (for support of choice types), pass in the model data
object as the fourth argument:

```js
fhirpath.evaluate({"resourceType": "Observation", "valueString": "green"},
                  'Observation.value', null, fhirpath_r4_model);
```

If the first parameter is a part of a resource, the second parameter should be
an object with properties "base" and "expression":
base - the path in the resource that represents the partial resource being used
       as the context,
expression - fhirpath expression relative to base.

```js
fhirpath.evaluate({ "answer": { "valueQuantity": ...}},
                  { "base": "QuestionnaireResponse.item",
                    "expression": "answer.value = 2 year"},
                  null, fhirpath_r4_model);                  
```

Precompiling fhirpath - result can be reused against multiple resources:

```js
const path = fhirpath.compile('Patient.name.given', fhirpath_r4_model);
var res = path({"resourceType": "Patient", ...}, {a: 5, ...});
```

If you are going to use the above "precompile" option with a part of a resource,
the first parameter should be an object with properties "base" and "expression":
base - the path in the resource that represents the partial resource being used
       as the context,
expression - fhirpath expression relative to base.

```js
const path = fhirpath.compile({ "base": "QuestionnaireResponse.item",
                                "expression": "answer.value = 2 year"},
                              fhirpath_r4_model);
var res = path({ "answer": { "valueQuantity": ...}, {a: 5, ...});
```

During expression evaluation, some values or parts of values may have internal
data types (e.g. FP_DateTime, FP_Time, FP_Quantity). By default, all of these
values are converted to standard JavaScript types, but if you need to use the
result of evaluation as a context variable for another FHIRpath expression,
it would be best to preserve the internal data types. To do this you can use
the option "resolveInternalTypes" = false:

```js
const contextVariable = fhirpath.evaluate(
  resource, expression, envVars, model, {resolveInternalTypes: false}
);
```

This option may also be passed to compile function:

```js
const path = fhirpath.compile(
  expression, model, {resolveInternalTypes: false}
);
```

If at some point you decide to convert all values which have internal types to
standard JavaScript types you can use the special function "resolveInternalTypes":

```js
const res = fhirpath.resolveInternalTypes(value);
```

Also, there is a special API function to get the type of each element in FHIRPath
result array which was obtained from evaluate() (unless you resolve the internal
types). This function returns an array of strings.
In the next example, `res` will have a value like this:
  ['FHIR.dateTime', 'FHIR.string', ...].

```js
const res = fhirpath.types(
  fhirpath.evaluate(resource, expression, envVars, model, {resolveInternalTypes: false})
);
```

If you want to capture evaluations of the `trace` method, you can include that in the options object.
```js
let tracefunction = function (x, label) {
  console.log("Trace output [" + label + "]: ", x);
};

const res = fhirpath.evaluate(contextNode, path, envVars, fhirpath_r4_model, { traceFn: tracefunction });
```

### Asynchronous functions

Some FHIRPath functions may be asynchronous. These functions throw exceptions by default.
To enable these functions, we need to pass the `async` option to `evaluate` or `compile`.
`async=true` enables return of a Promise only for expressions containing asynchronous functions.
`async='always'` enables a Promise to be returned for any expression.

For example, using the `memberOf` function might look like this:
```js
fhirpath.evaluate(
  resource,
  "Observation.code.coding.where(memberOf('http://hl7.org/fhir/ValueSet/observation-vitalsignresult'))",
  {},
  model,
  { async: true, terminologyUrl: 'https://lforms-fhir.nlm.nih.gov/baseR4' }
)
```

Please note that for the `memberOf` function to work you must pass in
a terminologyUrl option.

### User-defined functions

You can also replace any existing functions or define new ones. To do this you
need to include a user invocation table in the `options` object. The user
invocation table has the following structure:
```
{
  <function name>: {
    fn: <function implementation>,
    arity: {
      <allowed number of parameters>: <array of parameter types>,
      ...
    },
    [nullable: <boolean, false by default>],
    [internalStructures: <boolean, false by default>]
  },
  ...
}
```

An example of defining a function for raising a number to a specified power (by
default to a power of 2):
```js
const userInvocationTable = {
  pow: {fn: (inputs,exp=2)=>inputs.map(i => Math.pow(i, exp)), arity: {0: [], 1: ["Integer"]}},
};
const res = fhirpath.evaluate({"a": [5,6,7]}, "a.pow()", null, null, { userInvocationTable });
```
Where `pow` is the name of the function, `userInvocationTable.pow.fn` is the
implementation of the `pow` function, `userInvocationTable.pow.arity` is a hash
table describing the mapping between the allowed number of possible parameters
and their types.

A function implementation (e.g. `userInvocationTable.pow.fn`) is a function
whose first parameter is an array of resource node values or an array of values
on which the function is executed, and subsequent parameters are the parameters
passed to the FHIRPath function (e.g. `pow`).

Available parameter types:
- `Expr` - means that a FHIRPath expression passed to the function will be
  converted to a javascript function which will be passed as a parameter to `fn`.
  This javascript function expects one parameter which will be used as `$this`
  for the expression.
- `AnyAtRoot` - a FHIRPath expression passed to the function will be evaluated
  before it is passed to `fn` with `$this` from the parent expression, or, if
  `$this` is not defined for the parent expression, then $this will point to the
  root node of the resource for which the expression is evaluated.

  For example, for the expression `Patient.name.first().subsetOf($this.name)`:
  `Patient.name.first()` is the parent of `$this.name`.
  `$this.name` will be evaluated before it is passed to `subsetOf`, with `$this`
   pointing to the Patient.
- `Identifier` - currently not in use.
- `TypeSpecifier` - expects a type specifier to be converted to an instance of
  the TypeInfo class (see src/types.js) before it will be passed to `fn`.
- `Any` - FHIRPath expression passed to the function will be evaluated before it
  will be passed to `fn`.
- `Integer` - a value will be passed to `fn` if it is an integer, otherwise an
  exception will be thrown.
- `Boolean` - a value will be passed to `fn` if it is a boolean, otherwise an
  exception will be thrown.
- `Number` - a value will be passed to `fn` if it is a number, otherwise an
  exception will be thrown.
- `String` - a value will be passed to `fn` if it is a string, otherwise an
  exception will be thrown.

The optional `nullable` flag means propagation of an empty result, i.e. instead
of calling `fn`, if one of the parameters is empty, empty is returned.

If access to internal structures such as `ResourceNode` (see class `ResourceNode`
in src/types.js) is desired (e.g. for path information), then you can set a flag
`internalStructures` to true. In this case, each parameter of a function
implementation (e.g. `userInvocationTable.pow.fn`) can be an array of
`ResourceNode`s. To ensure that you get the value from the `ResourceNode` or the
value as is, you can use the `fhirpath.util.valData` or
`fhirpath.util.valDataConverted` function (see src/utilities.js).

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

FHIR model data can be included via --model and the FHIR release version (in
lower case, e.g., 'dstu2', 'stu3' or 'r4').

```sh
fhirpath --expression 'Observation.value' --resourceJSON '{"resourceType": "Observation", "valueString": "Green"}' --model r4
```

Also, you can pass in a filename or a string of JSON representing a part of the resource.
In that case, you should pass in the base path from which this part of the resource was extracted.
```sh
fhirpath --basePath QuestionnaireResponse.item --expression 'answer.value' --model r4 --resourceFile questionnaire-part-example.json

> fhirpath(answer.value) =>
> [
>  "2 year"
> ]
```

If given just the FHIRPath expression, the utility will print the parsed tree:

```sh
fhirpath --expression 'Patient.name.given'

> ... will print fhirpath ast in yaml
```

## Implementation Status

We are currently working on implementing version 2.0.0 of
[FHIRPath](http://hl7.org/fhirpath/);
some behavior may still be following the previous version, STU1.

The core parser was generated from the FHIRPath ANTLR grammar.

Completed sections:
- 3 (Path selection)
- 5.1 (Existence)
- 5.2 (Filtering and Projection) "ofType"
- 5.3 (Subsetting)
- 5.4 (Combining)
- 5.5 (Conversion)
- 5.6 (String Manipulation)
- 5.7 (Tree Navigation)
- 5.8 (Utility Functions)
- 6.1 (Equality)
- 6.2 (Comparison)
- 6.3 (Types)
- 6.4 (Collections)
- 6.5 (Boolean logic)
- 6.6 (Math)
- 6.8 (Operator Precedence) - handled by ANTLR parser
- 7   (Aggregates)
- 8   (Lexical Elements) - handled by ANTLR parser
- 9   (Environment Variables)

Supported additional functions from FHIR:
- extension(url : string) : collection
- hasValue() : Boolean
- memberOf(valueset : string) : Boolean

Supported Terminology Service APIs (https://build.fhir.org/fhirpath.html#txapi):
- only `%terminologies.validateVS(valueSet, coded, params) : Parameters` is
  partially supported. `valueSet` can only be a URL.

## Development Notes

This section is for people doing development on this package (as opposed to
using the package).

If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".


### Building the demo page

```sh
npm install && npm run build
cd demo
npm install && npm run build && npm run start
```

open browser on localhost:8080

### Updating the FHIR module on a FHIR release
* Download the FHIR StructureDefinitions (into the `fhir-context` directory - *don't check these in*)
  ```
  > wget http://hl7.org/fhir/profiles-types.json -O profiles-types.json
  > wget http://hl7.org/fhir/profiles-others.json -O profiles-others.json
  > wget http://hl7.org/fhir/profiles-resources.json -O profiles-resources.json
  ```
* Create the new folder for the version you are importing
  ```
  > mkdir r5
  ```
* Run the script `` with NodeJS
  ```
  > node ./extract-model-info.js --outputDir r5 --fhirDefDir .
  ```
* Compare the output files in the new folder to those of the last release
  (looking for issues that might be due to changes in the StructureDefinition format)
* Copy the `index.js` file from the last release into the new folder
  ```
  > cp ../r4/index.js r5
  ```
* Update the `/index.d.ts` file to include the new module as an export
  ``` js
  declare module "fhirpath/fhir-context/r5" {
    export const {
      choiceTypePaths,
      pathsDefinedElsewhere,
      type2Parent,
      path2Type
    }: Model;
  }
  ```

## Credits
This implemention of the FHIRPath specification was developed as a joint project
between the U.S. National Library of Medicine (NLM) and Health Samurai, and was
then donated to HL7.  Current maintenance and additional development is being
performed by NLM, but we welcome contributions from others.  (For anything
substantial, we recommend raising an issue first to coordinate with us.)

A complete list of contributors can be found at
https://github.com/HL7/fhirpath.js/graphs/contributors
