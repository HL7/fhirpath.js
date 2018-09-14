# FHIR-r4 test converter

CLI-tool for convert fhirpath [XML test cases](https://github.com/hl7-fhir/fhir-svn/blob/master/tests/resources/tests-fhir-r4.xml)
into fhirpath.js yaml test cases format.

### Installing:
```npm install```

### Build code with babel:
```npm run build-converter```

### Convert test file:
```/dist/data/bin/index.js ~/fhir-r4.xml(path to xml file)  ~/tests-r4.yaml(path to save result data)```

### Run converter test:
```npm run test-converter```
