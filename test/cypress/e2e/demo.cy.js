describe('Demo page', () => {
  beforeEach(() => {
    cy.visit('demo/build/index.html');
  });

  context('Input format', function() {
    it('should be JSON by default', function() {
      cy.get('input[value=json]').should('exist');
      cy.window()
        .then((win) => win.eval('cm.getValue()'))
        .should('contain', '"resourceType": "Patient"'); // yaml
      cy.get('#output').should('have.text', '- Jim\n')
    });
    it('should be able to be changed to YAML by clicking the YAML radio button', function() {
      cy.get('input[value=yaml]').should('exist');
      cy.get('input[value=yaml]').click();
      cy.window()
        .then((win) => win.eval('cm.getValue()'))
        .should('contain', 'resourceType: Patient'); // json
      cy.get('#output').should('have.text', '- Jim\n')
    })
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

  ['R4', 'R5'].forEach((fhirVersion) => {
    context('Questionnaire example', function() {
      it('should calculate score sum correctly ' , function() {

        cy.window()
          .then((win) => win.cm.setValue(
            JSON.stringify(require(`../../resources/weight-examples/questionnaire-response-${fhirVersion}.json`), null, 2)
          ));

        cy.get('#path').clear();
        cy.get('#path').type('%context.repeat(item).answer.weight().sum()');
        cy.contains('label:has(>input[type=radio])', fhirVersion).click();
        cy.get('#output').should('have.text', 'Error: %questionnaire is needed but not specified.')
        cy.get('#addVariable').click();
        cy.get('#variables input:last').type('questionnaire');
        cy.window()
          .then((win) => win.cm.setValue(
            JSON.stringify(require(`../../resources/weight-examples/questionnaire-${fhirVersion}.json`), null, 2)
          ));

        cy.get('#output').should('have.text', '- 65432211\n')
      });
    });
  });
});
