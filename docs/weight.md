# The weight() function

### Description
Returns numeric values from the score extension associated with the input
collection of resource nodes (e.g. QuestionnaireResponse item answers).

Currently, when searching for a score extension, we respect the "Context of
Use" for each possible extension used to store a score:
* https://www.hl7.org/fhir/extensions/StructureDefinition-itemWeight.html
* https://build.fhir.org/ig/HL7/fhir-extensions/StructureDefinition-itemWeight.html
* https://hl7.org/fhir/R5/codesystem.html#defined-props
* https://www.hl7.org/fhir/codesystem-concept-properties.html
* https://www.hl7.org/fhir/R4/extension-ordinalvalue.html

Since the first mention of the `ordinal()` (a.k.a. `weight()`) function was in
SDC 3 (https://hl7.org/fhir/uv/sdc/expressions.html#fhirpath-supplements),
we don't support this function in STU3 and DSTU2 for extensions described in
these links:
* https://www.hl7.org/fhir/stu3/extension-questionnaire-ordinalvalue.html
* https://www.hl7.org/fhir/stu3/extension-valueset-ordinalvalue.html
* https://hl7.org/fhir/STU3/extension-iso21090-co-value.html
* https://hl7.org/fhir/DSTU2/questionnaire.html#4.26.5.9
* https://hl7.org/fhir/DSTU2/extension-iso21090-co-value.html
* https://hl7.org/fhir/DSTU2/extension-valueset-ordinalvalue.html

Also, according to the resolution of this JIRA issue
https://jira.hl7.org/browse/FHIR-49329, we support a score extension for all
possible `[x]` in `value[x]` in QuestionnaireResponse answers.

### Algorithm for searching the score extension

We search for the first score extension for each source node to add its value
to the result in the following order:
1. Check the source node for a score extension.
2. If the source node is an answer from a `QuestionnaireResponse`  or its
   `value[x]`:
    - Check the `value[x]` element for a score extension.
    - Check the corresponding answer option (if any) of the corresponding
      `Questionnaire` item for a score extension.
    - Otherwise, if the `Questionnaire` item references a contained `ValueSet`,
      check the corresponding element there for a score extension.
4. If the source resource (to which the source node belongs, e.g.
   `QuestionnaireResponse`) or `Questionnaire` contains a corresponding
   `CodeSystem`, check for a score extension (for R4) or property (for R5) there.
5. Look for a score extension (for R4) or property (for R5) in the corresponding
   `CodeSystem` loaded from the terminology server.
