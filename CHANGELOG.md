# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [0.12.2] - 2019-05-15
### Fixed
- Corrected output in the demo website for results containing dates and times.
- Cleaned up the error message output for parsing errors.

## [0.12.1] - 2019-05-13
### Fixed
- Updated links to the repository to point to the new location.

## [0.12.0] - 2019-04-26
### Added
- Added support for string escape sequences (which was also needed for regex
  escapes).

## [0.11.0] - 2019-03-08
### Added
- Support for DateTime and Time literals, along with equality, equivalence,
  and comparison operators.
### Changed
- If a string is compared against a DateTime or Time, a check will be made to
  see whether the string is convertible to a DateTime or Time, and if that is
  possible the comparison will be made based on the result of that conversion.

## [0.10.3] - 2019-03-07
### Fixed
 - bin/fhirpath now works after npm install.

## [0.10.2] - 2019-02-26
### Fixed
 - Corrected the behavior of xor with an empty set.

## [0.10.1] - 2019-01-04
### Fixed
 - Variables referenced in expressions are now only wrapped in arrays if they
   are not already in an array.

## [0.10.0] - 2018-11-15
### Added
 - bin/fhirpath can now take a resource as a JSON string instead of a filename
   for the resource.

## [0.9.2] - 2018-11-13
### Fixed
 - Removed the postinstall script from package.json.  It was added for
   development, but is also run when this package is installed by another, and
   was causing the installation to error out.

## [0.9.1] - 2018-11-09
### Fixed
 - The browser-ready build file (available on the "releases" tab of the GitHub
   repository) now exposes a "fhirpath" global variable, whereas previously it
   was trying to put that on a LForms object.

## [0.9.0] - 2018-10-27
### Added
 - Support for environment variables

## [0.8.2] - 2018-10-24
### Fixed
 - Issues with decimals and the ~ operator.

## [0.8.1] - 2018-10-10
### Fixed
 - Floating point arithemetic errors are now corrected prior to comparison.

## [0.8.0] - 2018-09-21
### Added
 - Support for "contains" and "in" operators
 - Support for parentheses and null literals

## [0.7.0] - 2018-09-19
### Added
 - An option to the demo app for working with JSON rather than YAML.

## [0.6.0] - 2018-09-07
### Added
 - logical operations
 - tree navigation
 - string functions
 - part of ofType (explicit one)

## [0.5.1] - 2018-09-07
### Fixed
 - Corrected the (outdated) main file entry in package.json.

## [0.5.0] - 2018-09-07
### Added
 - combine()
### Fixed
 - union operator ("|")

## [0.4.3] - 2018-09-05
### Fixed
 - A problem with subsetOf (and supersetOf) that prevented objects with keys
   added in different orders from being considered the same.

## [0.4.1] - 2018-08-29
### Added
 - Tests for functions in 5.2 (except ofType), which is not yet implemented.

## [0.4.0] - 2018-08-27
### Added
 - Remaining functions in 5.1 (Existence) of the FHIRPath specification.

## [0.3.0] - 2018-08-24
### Added
 - Support for $this
 - all/any True/False.
 - Support for !~ and  =~

## [0.2.3] - 2018-08-13
### Changed
 - Reorgnanized math functions into a separate file.

## [0.2.2] - 2018-08-10
### Changed
 - Revised internal routines so everything is handled as a collection.

## [0.2.1] - 2018-08-07
### Fixed
 - An unexpected (math) operator error that happened when the code was
   minimized.

## [0.2.0] - 2018-08-07
### Added
 - Handles all math operations defined in 6.6 of the FHIRPath specification.
 - take, last, tail
 - iif
### Fixed
 - skip

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

