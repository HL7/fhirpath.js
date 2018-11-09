var demoURL = 'http://localhost:8080/test/protractor/index.html'
describe('Browser build of FHIRPath', function() {
  it('should be able to evaluate an expression', function() {
    browser.get(demoURL);
    let expression = $('#expression');
    let resource = $('#resource');
    let result = $('#result');
    expression.sendKeys('1 + 2');
    resource.sendKeys('{}');
    expect(result.getAttribute('value')).toBe('[3]');
  });
});
