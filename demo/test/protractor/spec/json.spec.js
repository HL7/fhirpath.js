var EC = protractor.ExpectedConditions;
var demoURL = 'http://localhost:8080/index.html'

describe('JSON entry mode', function() {
  it('should be enabled by clicking on the JSON radio button', function() {
    browser.get(demoURL);

    let jsonButton = element(by.css("input[value=json]"));
    browser.wait(browser.isElementPresent(jsonButton), 5000);
    let cmVal = browser.executeScript('return window.cm.getValue()');
    expect(cmVal).toContain('resourceType: Patient'); // yaml
    let output = element(by.id('output'));
    expect(output.getText()).toEqual('- Jim');

    jsonButton.click();
    cmVal = browser.executeScript('return window.cm.getValue()');
    expect(cmVal).toContain('"resourceType": "Patient"');  // json
    expect(output.getText()).toEqual('- Jim');
  });

});

describe('minified FHIRPath', function() {
  // This section tests that the minification process has not broken things.
  it('should have a working toDateTime()', function () {
    $('#path').clear();
    $('#path').sendKeys('birthDate.toDateTime()');
    browser.wait(EC.textToBePresentInElement($('#output'), '1974'), 3000);
  });
});

describe('Choice types', function() {
  it('should be understood' , function() {
    browser.executeScript(
      'window.cm.setValue(\'{"resourceType": "Observation", "valueString": "green"}\')');
    $('#path').clear();
    $('#path').sendKeys('Observation.value');
    browser.wait(EC.textToBePresentInElement($('#output'), 'green'), 3000);
  });
});
