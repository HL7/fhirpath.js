var port = 9001;
exports.config = {
  port: port,
  baseUrl: 'http://localhost:' + (process.env.PORT || port),

  //directConnect: true,
  //Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
  },
  specs: 'spec/*.spec.js',
  rootElement: 'body',
  framework: 'jasmine2',

  onPrepare: function() {

    browser.ignoreSynchronization = true; // non-angular website

    // Replace default dot reporter with something better.
    var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    // add jasmine spec reporter
    jasmine.getEnv().addReporter(new
    SpecReporter({summary: {displayStacktrace: true}}));

   },

  jasmineNodeOpts: {
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 200000
  }
};
