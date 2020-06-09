#! /usr/bin/env node

// Directory for downloading XML source files
const sourceDir = __dirname + '/../dataset/';
// Directory for converter output(for YAML and JSON files)
const destDir = __dirname + '/../../test/';

// Descriptions for file generation:
// [<relative path to XML source file>, <relative path to YAML/JSON output file>, <download URL>]
const sources = [
  ['fhir-r4.xml', 'cases/fhir-r4.yaml', 'https://raw.githubusercontent.com/HL7/FHIRPath/master/tests/r4/tests-fhir-r4.xml'],
  ['input/observation-example.xml', 'resources/observation-example.json', 'https://raw.githubusercontent.com/HL7/FHIRPath/master/tests/r4/input/observation-example.xml'],
  ['input/patient-example.xml', 'resources/patient-example.json', 'https://raw.githubusercontent.com/HL7/FHIRPath/master/tests/r4/input/patient-example.xml'],
  ['input/questionnaire-example.xml', 'resources/questionnaire-example.json', 'https://raw.githubusercontent.com/HL7/FHIRPath/master/tests/r4/input/questionnaire-example.xml'],
  ['input/valueset-example-expansion.xml', 'resources/valueset-example-expansion.json', 'https://raw.githubusercontent.com/HL7/FHIRPath/master/tests/r4/input/valueset-example-expansion.xml']
];

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
          const [xmlFilename,, url] = sources[i];
          await downloadFile(url, sourceDir + xmlFilename);
        }
      }

      const resourceFiles = sources.filter(([,target]) => target.endsWith('.json'));
      const testFiles = sources.filter(([,target]) => target.endsWith('.yaml'));

      for (let i = 0; i < resourceFiles.length; i++) {
        const [xmlFilename, jsonFilename] = resourceFiles[i];
        await convert.resourceXmlFileToJsonFile(sourceDir + xmlFilename, destDir + jsonFilename);
      }

      for (let i = 0; i < testFiles.length; i++) {
        const [xmlFilename, yamlFilename] = testFiles[i];
        await convert.testsXmlFileToYamlFile(sourceDir + xmlFilename, destDir + yamlFilename);
      }
    } catch(e) {
      console.error(e);
    }
  })
  .parse(process.argv);

