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
    files: ['src/**/*.js', 'src/parser/index.js', 'converter/**/*.js'],
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
      'no-console': 'warn'
    }
  }
];
