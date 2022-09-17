describe('Demo page', () => {
  before(() => {
    cy.visit('demo/build/index.html');
  });

  context('JSON entry mode', function() {
    it('should be enabled by clicking on the JSON radio button', function() {
      cy.get('input[value=json]').should('exist');
      cy.window()
        .then((win) => win.eval('cm.getValue()'))
        .should('contain', 'resourceType: Patient'); // yaml
      cy.get('#output').should('have.text', '- Jim\n')
      cy.get('input[value=json]').click();
      cy.window()
        .then((win) => win.eval('cm.getValue()'))
        .should('contain', '"resourceType": "Patient"'); // json
      cy.get('#output').should('have.text', '- Jim\n')
    });
  });

  context('minified FHIRPath', function() {
    // This section tests that the minification process has not broken things.
    it('should have a working toDateTime()', function () {
      cy.get('#path').clear();
      cy.get('#path').type('birthDate.toDateTime()');
      cy.get('#output').should('have.text', '- \'1974-12-25\'\n')
    });
  });

  context('Choice types', function() {
    it('should be understood' , function() {
      cy.window()
        .then((win) => win.cm.setValue('{"resourceType": "Observation", "valueString": "green"}'));
      cy.get('#path').clear();
      cy.get('#path').type('Observation.value');
      cy.get('#output').should('have.text', '- green\n')
    });
  });
});
