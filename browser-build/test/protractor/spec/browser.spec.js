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

  it('should have working model files', function() {
    browser.get(demoURL);
    let expression = $('#expression');
    let resource = $('#resource');
    resource.sendKeys('{"resourceType": "Observation", "valueString": "green"}');
    expression.sendKeys('Observation.value');
    let result = $('#result');
    expect(result.getAttribute('value')).toBe('[]'); // no model yet
    for (let fhirVers of ['dstu2', 'stu3', 'r4']) {
      $('#'+fhirVers).click(); // changes the model used
      expect(result.getAttribute('value')).toBe('["green"]');
    }
  });
});
