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
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.textToBePresentInElement($('#output'), '1974'), 3000);
  });
});
