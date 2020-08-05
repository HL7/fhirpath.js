# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [2.4.0] - 2020-08-05
### Added
- Support for DSTU2 model

## [2.3.0] - 2020-06-17
### Added
- Functions: toBoolean(), convertsToBoolean(), convertsToInteger(), convertsToDecimal(), convertsToString(),
  convertsToDateTime(), convertsToTime(), convertsToQuantity()
### Fixed
- toInteger() function should return an empty collection for non-convertible string
- toQuantity() function should work with the entire input string, not part of it (RegExp expression surrounded with ^...$)
- toQuantity() function should support boolean values
- toQuantity() function should not accept a string where UCUM unit code is not surrounded with single quotes
- The third parameter of iif function should be optional

## [2.2.2] - 2020-06-05
### Fixed
- Updated FHIRPath test cases

## [2.2.1] - 2020-06-03
### Fixed
- Issue with substring function without a second parameter

## [2.2.0] - 2020-05-26
### Added
- Function aggregate(aggregator, init)

## [2.1.5] - 2020-05-12
### Fixed
- Fixed issue with comparing dates (without time) in various time zones
- Added execution of tests for various time zones

## [2.1.4] - 2020-05-04
### Fixed
- Using "Number.parseFloat" replaced with "parseFloat" for IE11

## [2.1.3] - 2020-04-28
### Changed
- Removed the need to exclude package "fs" when building

## [2.1.2] - 2020-04-27
### Changed
- ucum-lhc package updated to 4.1.3
- added polyfills required to run in IE

## [2.1.1] - 2020-04-08
### Changed
- Browser build fixed to work in IE 11
- Non-browser build removed

## [2.1.0] - 2020-03-26
### Added
- Function toQuantity(unit)
- Operators =(equality) and ~(equivalence) for Quantity
- Implicit conversion from FHIR Quantity to FHIRPath System.Quantity

## [2.0.0] - 2020-03-11
### Changed
- FHIRPath grammar updated to version 2.0.0 (N1)

## [1.0.2] - 2020-03-11
### Changed
- ucum-lhc package updated to 4.1.1, which saves about 200k (uncompressed).

## [1.0.1] - 2020-01-17
### Fixed
- Issues with the new choice type support raised in
  https://github.com/HL7/fhirpath.js/pull/34.

## [1.0.0] - 2019-12-19
### Added
- Support for FHIR "choice types" (e.g. Observation.value).  The support is
  currently limited to being able to specify paths like Observation.value (when
  the resource might actually contain Observation.valueString).
### Changed
- Remove the deprecated "context" parameter from the "compile" function.  The
  context should be passed into the function that "compile" returns.  This
  breaking change is the reason for the major version number increment.

## [0.17.5] - 2019-11-18
### Fixed
- Although one could add a Quantity to a date, subtracting the quantity resulted
  in an error.
- Fixed functions toDateTime() and toTime(), for the minified versions of the
  code.

## [0.17.4] - 2019-10-22
### Fixed
- Fixed the compile API, so that the returned function now takes the "context"
  hash of environment variables as a second argument (after the resource data).
  Previously this context hash was passed into the compile function, not the
  returned function, which meant that the parsed expression could only be reused
  if the context variable hash was the same object.

## [0.17.3] - 2019-09-30
### Fixed
- Removed Linux-specific commands from the build process.

## [0.17.2] - 2019-09-30
### Fixed
- Updated packages for the demo to get patches for vulnerabilities.

## [0.17.1] - 2019-08-22
### Fixed
- Set the charset of the test pages to UTF-8, because fhirpath.min.js is UTF-8,
  and added a note to the README about the need to set the character encoding.

## [0.17.0] - 2019-07-24
### Added
- Support for adding time-based Quantities to DateTimes and Times.
  These changes included adding the ucum-lhc unit-conversion library, which has
  a large data file, but the data file compresses down to about 1/10th of its
  expanded size, so users are encouraged to gzip their JavaScript builds.
- The ucum-lhc instance is exported for convenience, as ucumUtils.  See
  https://lhncbc.github.io/ucum-lhc/ for instructions if you want to use it.

## [0.16.2] - 2019-08-01
### Fixed
- IE 10 compatibility issues were fixed (by "bpacJoseph")

## [0.16.1] - 2019-06-11
### Fixed
- Updated packages for the demo to get patches for vulnerabilities.

## [0.16.0] - 2019-05-30
### Added
- Quantity types can now be parsed, though arithmetic is not yet supported.

## [0.15.0] - 2019-05-23
### Added
- Support for unary - and +.

## [0.14.0] - 2019-05-28
### Added
- Math functions defined in paragraphs 5.7.1 - 5.7.4 and 5.7.7 - 5.7.10 of the FHIRPath specification.

## [0.13.0] - 2019-05-21
### Added
- Functions ln() and log() in 5.7 (Math) of the FHIRPath specification.

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

