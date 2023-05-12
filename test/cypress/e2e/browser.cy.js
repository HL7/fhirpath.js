describe('Browser build of FHIRPath', function() {
  beforeEach(() => {
    cy.visit('./browser-build/test/index.html');
    // skip browser console errors when typing
    cy.on('uncaught:exception', (err, runnable) => false);
  })

  it('should be able to evaluate an expression', function() {
    cy.get('#expression').type('1 + 2');
    cy.get('#resource').type('{}');
    cy.get('#result').should('have.value', '[3]');
  });

  it('should have working model files', function() {
    cy.get('#resource').type('{"resourceType": "Observation", "valueString": "green"}', { parseSpecialCharSequences: false });
    cy.get('#expression').type('Observation.value');
    // Observation.value does not exist if no model is selected:
    cy.get('#result').should('have.value', '[]');

    for (let fhirVers of ['dstu2', 'stu3', 'r4', 'r5']) {
      // Change the model used:
      cy.get('#'+fhirVers).click();
      // Observation.value exists if a model is selected:
      cy.get('#result').should('have.value', '["green"]');
    }
  });
});
