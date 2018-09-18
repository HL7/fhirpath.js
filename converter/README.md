# FHIR-r4 test converter

CLI-tool for converting fhirpath [XML test cases](https://github.com/hl7-fhir/fhir-svn/blob/master/tests/resources/tests-fhir-r4.xml)
into fhirpath.js yaml test cases format.

### Installing:
```npm ci```

### Build code with babel:
```npm run build-converter```

### Convert test file:
```build/converter/bin/index.js converter/dataset/fhir-r4.xml(path to xml file)  converter/dataset/tests-r4.yaml(path to save result data)```

### Converter test in whole test scope:
```npm run test```
