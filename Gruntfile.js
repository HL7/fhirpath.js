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
          from: /'antlr4\/index'/g,
          to: "'../antlr4-index'"
        }]
      }
    }

  });

  grunt.registerTask('updateParserRequirements', [
    'replace:antlr4-index'
  ]);

};
