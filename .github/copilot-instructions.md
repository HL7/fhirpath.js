# Copilot Instructions for fhirpath.js

## Project Overview
- This project implements the [FHIRPath](https://hl7.org/fhirpath/) language in JavaScript for querying FHIR data.
- It supports multiple FHIR versions (DSTU2, STU3, R4, R5).

## Code Style
- Use modern JavaScript (ES6+) syntax (e.g., `const`, `let`, arrow functions, destructuring).
- Prefer CommonJS modules (`require`, `module.exports`) unless editing files that use ES modules.
- Follow existing indentation (2 spaces) and code formatting.
- Use descriptive variable and function names.
- Leave two blank lines between function/method declarations. The JSDoc
  comment for a function is considered part of that function's declaration,
  so the two blank lines go *above* the JSDoc block, not between the JSDoc
  and the function keyword.

  Correct:
  ```js
  function foo() {
    // ...
  }


  /**
   * Description.
   */
  function bar() {
    // ...
  }
  ```

  Wrong (only one blank line before JSDoc):
  ```js
  function foo() {
    // ...
  }

  /**
   * Description.
   */
  function bar() {
    // ...
  }
  ```

## File Organization
- Place core logic in `src/`.
- Place FHIR version-specific logic in `fhir-context/` subfolders.
- Place tests in `test/` and use Jest for new tests.
- The unit tests, described in the `test/cases/*.yaml` files, are executed using
  the fhirpath.test.js script.
- Place documentation in `docs/` or update `README.md` as needed.

## Adding Features
- Add new FHIRPath functions to `src/` as separate modules if appropriate.
- Update relevant FHIR version logic in `fhir-context/` if needed.
- Add or update tests in `test/` to cover new features or bug fixes.
- Update documentation for any new public API or behavior.

## Testing
- Use Jest for all new and existing tests.
- Ensure all tests pass before submitting changes.

## Documentation
- Document new and modified functions using JSDoc comments.
- When adding or updating JSDoc comments, always preserve two blank lines
  between the end of the previous function and the JSDoc block of the next
  function (see Code Style above).
- Update `README.md` or `docs/` for major changes or new features.

## FHIRPath and FHIR Specifics
- Ensure all FHIRPath logic is standards-compliant.
- When handling FHIR resources, validate against the relevant FHIR version.

## General Guidance
- Write clear, maintainable, and well-tested code.
- Focus on performance and efficiency, especially for large FHIR datasets.
- Follow the structure and conventions of existing code.
- When in doubt, refer to existing files for examples.
