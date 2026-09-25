// ESLint flat configuration for fhirpath.js
// See https://eslint.org/docs/latest/use/configure/configuration-files

const js = require('@eslint/js');
const babelParser = require('@babel/eslint-parser');
const globals = require('globals');


module.exports = [
  // Start with ESLint's recommended rule set
  js.configs.recommended,

  {
    // Apply this configuration to source files and the converter module
    files: [
      'src/**/*.js', 'src/**/*.mjs', 'src/parser/index.js',
      'converter/**/*.js', 'fhir-context/**/*.mjs'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      // Use Babel parser to support syntax not yet natively handled by ESLint
      parser: babelParser,
      parserOptions: {
        // No separate Babel config file is needed
        requireConfigFile: false
      },
      globals: {
        // Node.js built-in globals (e.g. require, module, process, Buffer)
        ...globals.node,
        // Jest test globals (e.g. describe, it, expect)
        ...globals.jest,
        // Browser globals (e.g. fetch, Headers, atob, btoa)
        ...globals.browser
      }
    },
    rules: {
      // Enforce 2-space indentation with switch-case indentation
      indent: ['error', 2, { SwitchCase: 1 }],
      // Enforce Unix-style line endings (LF)
      'linebreak-style': ['error', 'unix'],
      // Require semicolons at the end of statements
      semi: ['error', 'always'],
      // Warn on console.log usage (allow in production-critical paths)
      'no-console': 'warn',
      // IE11, which the browser build still targets (see
      // browser-build/webpack.config.js), accepts the constructor argument of
      // Set/Map and silently ignores it, so an iterable argument yields an
      // empty collection instead of a failure.
      'no-restricted-syntax': ['error', {
        selector: 'NewExpression[callee.name=/^(Set|Map|WeakSet|WeakMap)$/]' +
          '[arguments.length>0]',
        message: 'IE11 ignores the iterable argument of Set/Map; populate ' +
          'the collection with .add()/.set() instead.'
      }]
    }
  },
  {
    // The converter runs only in Node.js and is not part of the IE11 browser
    // build, so the IE11-specific restriction does not apply to it.
    files: ['converter/**/*.js'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  }
];
