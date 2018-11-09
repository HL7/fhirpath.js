// This is just here to more easily run protractor tests.
'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    protractor: 'grunt-protractor-runner'
  });

  // Define the configuration for all the tasks
  grunt.initConfig({

    connect: {
      test: {
        options: {
          port: 8080,
          base: '.'
        }
      }
    },

    protractor: {
      options: {
        configFile: 'test/protractor/conf.js'
      },
      default: {
        options: {
          args: {
//            browser: 'chrome'
          }
        }
      }
    },

  });

  grunt.registerTask('test:e2e', [
    'connect',
    'protractor'
  ]);

};
