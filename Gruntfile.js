module.exports = function (grunt) {
  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    replace: 'grunt-text-replace'
  });

  // Define the configuration for all the tasks
  grunt.initConfig({

    replace: {
      'antlr4-index': {
        src: ['src/parser/generated/*.js'],
        overwrite: true,
        replacements: [{
          from: "import antlr4 from 'antlr4';",
          to: "const antlr4 = require('../antlr4-index');"
        }, {
          from: "import FHIRPathListener from './FHIRPathListener.js';",
          to: "const FHIRPathListener = require('./FHIRPathListener');"
        }, {
          from: /export default class (.*) extends ([\s\S]*)/gm,
          to: "class $1 extends $2\nmodule.exports = $1;"
        }]
      }
    }

  });

  grunt.registerTask('updateParserRequirements', [
    'replace:antlr4-index'
  ]);

};
