# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [] - TBD
### Added
 - Handles addition.

## [0.1.1] - 2018-08-02
### Added
 - GitHub repository to package.json.

## [0.1.0] - 2018-08-01
### Added
 - Added beginning of a FHIRPath engine.  There is name a script bin/fhirpath
   which will take a FHIRPath expression and a filename containing a JSON FHIR
   resource, and prints the result of the expression (for many basic
   expressions).  Without the filename, it prints the parsed expression tree,
   which is what bin/parseAndDisplay.js used to do, so that has been removed.

## [0.0.1] - 2018-07-23
### Added
 - There is a now a parser and a small script (bin/parseAndDisplay.js) which
   prints out the parse tree of a FHIRPath expression.

