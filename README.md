This will one day be a FHIRPath processing engine.

## Status
Currently this only able to handle very simple FHIRPath expressions,
such as "Patient.name.given".  See the bin/evaluate.js utility for an example of
how use the code.

The version of the FHIRPath grammar being used is currently the STU1 Release.

## Utility scripts
   * bin/evaluate.js:  Given a JSON FHIR resource structure and a FHIRPath
expression, it will execute the FHIRPath on the resource.  Example:

```
$ node bin/evaluate.js '{"resourceType": "Patient", "name": {"given": "Fred"}}' 'name.given'

Fred
```
   * bin/parse-and-display.js:  Prints a parse tree for a FHIRPath expression (mostly
useful for debugging).


## Development Notes
If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".
