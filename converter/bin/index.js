#! /usr/bin/env node

// Directory for downloading XML source files
const sourceDir = __dirname + '/../dataset/';
// Directory for converter output(for YAML and JSON files)
const destDir = __dirname + '/../../test/';

// Descriptions for file generation:
// [<relative path to XML/JSON source file>, <relative path to YAML/JSON output file>, <download URL>[, <FHIR model for test cases>]]
const sources = [
  // FHIR R4 test cases
  ['fhir-r4.xml', 'cases/fhir-r4.yaml', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/fhirpath/tests-fhir-r4.xml', 'r4'],
  ['input-r4/appointment-examplereq.json', 'resources/r4/appointment-examplereq.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/appointment-examplereq.json'],
  ['input-r4/codesystem-example.xml', 'resources/r4/codesystem-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/codesystem-example.xml'],
  ['input-r4/explanationofbenefit-example.json', 'resources/r4/explanationofbenefit-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/explanationofbenefit-example.json'],
  ['input-r4/observation-example.xml', 'resources/r4/observation-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/observation-example.xml'],
  ['input-r4/parameters-example-types.xml', 'resources/r4/parameters-example-types.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/parameters-example-types.xml'],
  ['input-r4/patient-container-example.json', 'resources/r4/patient-container-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/patient-container-example.json'],
  ['input-r4/patient-example-period.xml', 'resources/r4/patient-example-period.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/patient-example-period.xml'],
  ['input-r4/patient-example.xml', 'resources/r4/patient-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/patient-example.xml'],
  ['input-r4/questionnaire-example.xml', 'resources/r4/questionnaire-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/questionnaire-example.xml'],
  ['input-r4/valueset-example-expansion.xml', 'resources/r4/valueset-example-expansion.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r4/valueset-example-expansion.xml'],

  // FHIR R5 test cases
  ['fhir-r5.xml', 'cases/fhir-r5.yaml', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/fhirpath/tests-fhir-r5.xml', 'r5'],
  ['input-r5/conceptmap-example.xml', 'resources/r5/conceptmap-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/conceptmap-example.xml'],
  ['input-r5/observation-example.xml', 'resources/r5/observation-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/observation-example.xml'],
  ['input-r5/patient-example.xml', 'resources/r5/patient-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/patient-example.xml'],
  ['input-r5/valueset-example-expansion.xml', 'resources/r5/valueset-example-expansion.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/valueset-example-expansion.xml'],
  ['input-r5/questionnaire-example.xml', 'resources/r5/questionnaire-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/questionnaire-example.xml'],
  ['input-r5/explanationofbenefit-example.json', 'resources/r5/explanationofbenefit-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/explanationofbenefit-example.json'],
  ['input-r5/appointment-examplereq.json', 'resources/r5/appointment-examplereq.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/appointment-examplereq.json'],
  ['input-r5/codesystem-example.xml', 'resources/r5/codesystem-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/codesystem-example.xml'],
  ['input-r5/parameters-example-types.xml', 'resources/r5/parameters-example-types.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/parameters-example-types.xml'],
  ['input-r5/patient-example-period.xml', 'resources/r5/patient-example-period.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/patient-example-period.xml'],
  ['input-r5/patient-example-name.xml', 'resources/r5/patient-example-name.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/patient-example-name.xml'],
  ['input-r5/patient-container-example.json', 'resources/r5/patient-container-example.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/patient-container-example.json'],
  ['input-r5/diagnosticreport-eric.json', 'resources/r5/diagnosticreport-eric.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/diagnosticreport-eric.json'],
  // Can't convert this one:
  // ['input-r5/ccda.xml', 'resources/r5/ccda.json', 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/refs/heads/master/r5/ccda.xml'],
].map((item) => {
  const [srcFilename, targetFilename, downloadUrl, model] = item;
  return {srcFilename, targetFilename, downloadUrl, model};
});

const commander = require('commander');
const convert = require('../index');

const https = require('https');
const fs = require('fs');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(res) {
      const { statusCode } = res;

      if (statusCode !== 200) {
        // Consume response data to free up memory
        res.resume();
        reject(`Failed to download ${url}.\n` +
          `Status Code: ${statusCode}`);
      } else {
        res.pipe(file);
        file.on('finish', function () {
          resolve();
        });
      }
    });
  });
}

commander
  .option('-s, --skip-download', 'skip downloading sources from FHIRPath repository')
  .description('Convert xml test cases/resources to yaml/json')
  .action(async (cmd) => {
    try {
      if (!cmd.skipDownload) {
        for (let i = 0; i < sources.length; i++) {
          const item = sources[i];
          await downloadFile(item.downloadUrl, sourceDir + item.srcFilename);
        }
      }

      const resourceFiles = sources.filter((item) => item.targetFilename.endsWith('.json'));
      const testFiles = sources.filter((item) => item.targetFilename.endsWith('.yaml'));

      for (let i = 0; i < resourceFiles.length; i++) {
        const item = resourceFiles[i];
        await convert.resourceXmlFileToJsonFile(sourceDir + item.srcFilename, destDir + item.targetFilename);
      }

      for (let i = 0; i < testFiles.length; i++) {
        const item = testFiles[i];
        await convert.testsXmlFileToYamlFile(sourceDir + item.srcFilename, destDir + item.targetFilename, item.model);
      }
    } catch(e) {
      console.error(e);
    }
  })
  .parse(process.argv);

