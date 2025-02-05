# Change log

This log documents significant changes for each release.  This project follows
[Semantic Versioning](http://semver.org/).

## [3.17.0] - 2025-02-03
### Added
- getValue() function.

## [3.16.4] - 2025-01-24
### Fixed
- Bug where single-quoted variable names were not supported.

## [3.16.3] - 2025-01-21
### Fixed
- Bug with async boolean expressions (when an operator takes an async value as
  a singleton parameter).

## [3.16.2] - 2025-01-16
### Fixed
- Bug with toString when userInvocationTable passed.

## [3.16.1] - 2025-01-09
### Fixed
- Read environment variables only when they are used in an expression, avoiding
  unnecessary getter calls when working with libraries like Jotai.

## [3.16.0] - 2024-10-10
### Added
- Support for type factory API (%factory).

## [3.15.2] - 2024-08-30
### Fixed
- Removed the need to run `(cd demo && npm ci)`.
- Excluded unnecessary files from the npm package.

## [3.15.1] - 2024-08-06
### Fixed
- Return data type for `evaluate` and `compile` in TypeScript type declarations.
  The return data type now depends on the `async` option.

## [3.15.0] - 2024-08-05
### Added
- option `async`, which allows us to get the result of an expression evaluation
  asynchronously.
- Support for asynchronous functions: if any function in an expression returns
  a Promise and option `async=true`, then the result of evaluating
  the expression is a Promise.
- async function `memberOf`.

## [3.14.1] - 2024-07-02
### Fixed
- impossibility to use attribute name that starts with a capital letter.

## [3.14.0] - 2024-07-02
### Added
- supplementary function `weight()` with alternative name `ordinal()`.

## [3.13.4] - 2024-06-13
### Fixed
- a bug that could cause the context input parameter containing environment
  variables to change.

## [3.13.3] - 2024-05-24
### Changed
- Added separate TypeScript type definition files for the main file and each
  supported model.

## [3.13.2] - 2024-05-15
### Fixed
- an issue with evaluating an expression for a resource passed through an
  environment variable.
- an issue with "statusShift" during performance tests.

## [3.13.1] - 2024-04-25
### Fixed
- Added flag 'u' for regular expressions in the specification's `matches` and
  `replaceMatches` functions to support the use of unicode character class
  escapes.

## [3.13.0] - 2024-04-10
### Added
- Function `defineVariable(name: String [, expr: expression])`.

## [3.12.0] - 2024-04-10
### Changed
- Updated Cypress to version 13.

## [3.11.0] - 2024-03-29
### Added
- Storing the FHIR data type along with the path in internal ResourceNode
  objects to improve the accuracy of determining a resource node data type.
- Missing entries to mapping paths to data types.

## [3.10.5] - 2024-03-25
### Fixed
- Handling of empty values that came from nulls.

## [3.10.4] - 2024-03-13
### Fixed
- hasValue() function previously only checked the data type of an input
  single-element collection, but not the existence of a value.

## [3.10.3] - 2024-03-12
### Fixed
- Functions `as(<type specifier>)`, `is(<type specifier>)`,
  `ofType(<type specifier>)` and operators `as <type specifier>`,
  `is <type specifier>` now throw an exception if `<type specifier>` is invalid.
- Resource object properties that are not defined in the model now have System.*
  data types.
- All tests in `fhir-r4.yaml` are executed using the `R4` model.

## [3.10.2] - 2024-03-12
### Fixed
- children() and descendants() were returning resource nodes with the incorrect
  data types.

## [3.10.1] - 2024-01-29
### Changed
- Improved performance comparison task: added command line options and enabled
  Ctrl+C for stopping the tests.

## [3.10.0] - 2024-01-23
### Added
- Support for comparison and math operations with Quantity values.
  It also became possible to use Quantity values with `aggregate()`, `min()`,
  `max()`, `sum()`, `avg()`, and `abs()`.
- Unary `-` for a Quantity value.

## [3.9.1] - 2024-01-22
### Fixed
- Fixed exception in the "hashObject" internal function when an object has
  a property with the "null" value. This may affect functions that compare
  objects:
  intersect(), subsetOf(), repeat(), union(), distinct(), isDistinct().
- Null values are excluded from the expression evaluation result.
- Fixed an issue when evaluating an expression for a resource object with missed
  values at the end of the array in a property.
- Fixed an issue when evaluating an expression for a resource object when there
  are no values at all for a property, but there is a list of associated data
  (ids/extensions).

## [3.9.0] - 2023-11-09
### Added
- support for user-defined functions.

## [3.8.1] - 2023-10-11
### Fixed
- Use `deepEqual` instead of `hashObject` to optimize the comparison of items of
  small collections in these functions: intersect(), union(), exclude(),
  subsetOf(), distinct().

## [3.8.0] - 2023-10-03
### Added
- support FHIR.instant in expressions.

## [3.7.1] - 2023-09-27
### Fixed
- crash in `exists()` when running in strict mode.

## [3.7.0] - 2023-09-12
### Added
- exclude() function.

## [3.6.1] - 2023-08-17
### Fixed
- trace() affected the context of the following subexpressions.

## [3.6.0] - 2023-07-11
### Added
- hasValue() function.

## [3.5.0] - 2023-05-04
### Added
- Add `split` and `join` functions
- Add `encode` and `decode` functions
- Added a callback (traceFn) to the options object for the `trace` function
### Fixed
- Update the typescript definition to mark context and model as optional
- Correct the `trace` function's name parameter is required

## [3.4.0] - 2023-04-26
### Added
- support for FHIR R5 publication.

## [3.3.2] - 2023-03-29
### Fixed
- toQuantity() now works with subclasses of Quantity.

## [3.3.1] - 2022-11-22
### Fixed
- Aggregate init parameter can be any type, not just an integer.

## [3.3.0] - 2022-11-21
### Added
- An API method `types` which returns the type of each element in FHIRPath result
  array which was obtained from `evaluate()` with option `resolveInternalTypes=false`.
### Fixed
- The hidden (non-enumerable) property `__path__` has been moved from the entire
  array of result values to each element of the array, because the result array
  may contain items of different types.
- The type of `today()` was defined as `System.DateTime`. Now it is defined as
  `System.Date`.

## [3.2.0] - 2022-10-28
### Added
- Functions: toDate(), convertsToDate().
### Fixed
- Date/Time arithmetic to make this expression work:
  `Patient.birthDate + 1 day`
- Removed implicit string to date/time conversion during comparison.

## [3.1.0] - 2022-09-14
### Added
- function "as(type)".
- operator "as".
- Support for data type hierarchy from FHIR specification for:
  - functions "is(type)", "as(type)", and "ofType(type)",
  - operators "is" and "as".

## [3.0.0] - 2022-08-25
### Added
- Option `resolveInternalTypes` to control whether any instances of internal data
  types (e.g. FP_DateTime, FP_Time, FP_Quantity) in a result of FHIRPath
  expression should be converted to standard JavaScript types.
- Method `resolveInternalTypes` which converts any instances of internal data
  types (e.g. FP_DateTime, FP_Time, FP_Quantity) in a result of FHIRPath
  expression evaluation to standard JavaScript types.
### Changed
- By default, any instances of internal data types (e.g. FP_DateTime, FP_Time,
  FP_Quantity) in a result of FHIRPath expression are converted to strings.

## [2.14.7] - 2022-08-15
### Fixed
- Fixed directly (without member invocation) accessing the value of a variable in the context if this value was fetched
  from a resource using fhirpath.js.

## [2.14.6] - 2022-06-29
### Fixed
- FHIR Quantities are now only converted to System Quantities when necessary, so
  that FHIR Quantities can be returned from an expression, and so that the
  fields from a FHIR Quantity can be accessed.

## [2.14.5] - 2022-06-07
### Added
- Version number to fhirpath.js demo page.
### Fixed
- "extension()" for primitive types did not work properly without a value.

## [2.14.4] - 2022-05-23
### Added
- Suite of performance tests.

## [2.14.3] - 2022-05-02
### Changed
- Updated to NodeJS 16.
- Updated the antlr4 dependency to 4.9.3.

## [2.14.2] - 2022-04-12
### Fixed
- Corrected scope of function parameter of `collection` type for `union`,
  `subsetOf`, `supersetOf`, `combine`, and `intersect`.
  For example,`Patient.name.select(use.union(given))` should be the same as
  `Patient.name.select(use|given)`.

## [2.14.1] - 2022-03-31
### Added
- Added a "version" field with the release version to the object exported by fhirpath.js.
### Fixed
- Previously, the `repeat` function changed the contents of the `%someVar` value
  when used in a `%someVar.repeat(...)` expression.
- Previously, `a.repeat('b')` went into an infinite loop.
- The `repeat` function should no longer return duplicates.
- Optimized functions: `distinct`, `union`, `subsetOf`, `intersect`, and `repeat`
  by changing complexity of the algorithm from O(n**2) to O(n).

## [2.14.0] - 2022-03-02
### Added
- Function to get the intersection of two collections: intersect().
### Fixed
- The `distinct`, `union`, `subsetOf`, and `intersect` functions now use
  the "6.1.1. = (Equals)" function to compare collection items instead of using
  a map with JSON keys, which can affect their performance because the
  complexity of the algorithm has changed from O(n) to O(n**2).

## [2.13.0] - 2022-02-28
### Added
- Current time function: timeOfDay().

## [2.12.0] - 2022-01-06
### Added
- FHIRPath extension functions: sum(), min(), max(), and avg().
### Fixed
- Division by 0 for `/`, `div`, and `mod` operators.

## [2.11.0] - 2021-12-29
### Added
- Storing the path for the data extracted from the resource in a hidden
  (non-enumerable) property `__path__`. This allows the FHIR model to be
  applied to data extracted from the resource and used as a context variable.
  For example, you can use `%thisItem.answerOption.value.where(code='LA19952-3')`
  instead of `%thisItem.answerOption.valueCoding.where(code='LA19952-3')`

## [2.10.2] - 2021-12-02
### Fixed
- Date/Time arithmetic: "@2016 + 365 days" should equal "@2017".

## [2.10.1] - 2021-10-25
### Fixed
- toDecimal() function should return an empty collection for non-convertible string
- convertsToDecimal() function should return false for non-convertible string

## [2.10.0] - 2021-10-19
### Added
- Some type definitions for TypeScript users.

## [2.9.1] - 2021-06-02
### Fixed
- Function matches() didn't use "single line" mode ("." should match newlines)

## [2.9.0] - 2021-05-13
### Added
- Additional function: extension()
- Support for "id" and "extension" properties for primitive types.

## [2.8.0] - 2021-04-26
### Added
- String manipulation functions: upper(), lower(), toChars().
### Fixed
- String manipulation functions did not properly return an empty
  collection when the input collection is empty.

## [2.7.4] - 2021-03-12
### Fixed
- Evaluation of singleton collections.
- Removed ignoring the unknown part of the expression.

## [2.7.3] - 2021-02-02
### Fixed
- $this wasn't set correctly if it is not used in an operator expression
- It was unable to use $index in expressions for functions: all, where, select.

## [2.7.2] - 2021-01-05
### Fixed
- Prevented the antlr4 dependency from moving beyond 4.8, because 4.9 has
  breaking changes. Also, per https://github.com/antlr/antlr4/issues/2970,
  it seems that antlr 4.9 requires Node.js 14, so we do not plan to update
  the antlr dependency while Node.js 10 and 12 are still being maintained.

## [2.7.1] - 2020-10-29
### Fixed
- Now, attempting to access an undefined environment variable will result
  in an error

## [2.7.0] - 2020-10-21
### Added
- Evaluating expression for a part of a resource

## [2.6.2] - 2020-10-09
### Fixed
- Comparison of dates indicated with different level of precision

## [2.6.1] - 2020-09-22
### Fixed
- Module not found errors with TypeScript when importing json files
  inside module declaration (in an Angular project)

## [2.6.0] - 2020-09-01
### Added
Limited support for types (see README.md for details):
- Function is(type) and operator "is"
- Function ofType(type)

## [2.5.0] - 2020-08-26
### Added
- Function union(other: collection)

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

