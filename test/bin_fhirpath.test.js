const {execSync} = require('child_process');

/**
 * Tests that the given fhirpath command outputs something that matches the given pattern.
 * @param {string} fpCmd - The command to run. It should start with
 *   "bin/fhirpath" followed by the arguments.
 * @param {RegExp} pattern - A regular expression that the command output
 *   is expected to match.
 */
function checkOutput(fpCmd, pattern) {
  let output = execSync(__dirname +'/../'+fpCmd);
  expect(output.toString()).toMatch(pattern);
}

/**
 *  Creates a temporary resource file with the given JSON string.
 * @return an object with a "name" attribute for the pathname for the temporary
 * file and a "removeCallback" function to call to delete the file.
 */
function createTempResource(json) {
  let tmp = require('tmp');
  let tmpObj = tmp.fileSync();
  require('fs').writeSync(tmpObj.fd, json);
  return tmpObj;
}

describe ('bin/fhirpath', function () {
  it ('should output a parse tree without a resource', function() {
    checkOutput('bin/fhirpath -e "1 + 2"', /Additive/g);
  });

  it ('should evaluate when given a resource', function() {
    checkOutput("bin/fhirpath -e '1 + 2' -r '{}'", /3/g);
  });

  it ('should evaluate when given a resource file', function() {
    let tempFileObj = createTempResource('{"a": {"b": 1}}');
    checkOutput("bin/fhirpath -e 'a.b + 3' -f "+tempFileObj.name, /4/g);
    tempFileObj.removeCallback();
  });

  it ('should evaluate when given a file with a part of a resource', function() {
    checkOutput("bin/fhirpath -b QuestionnaireResponse.item "
      +"-e 'answer.value = 2 year' -m r4 -f '"
      +__dirname+"/resources/r4/questionnaire-part-example.json'", /true/g);
  });

  it ('should accept a hash of variables', function() {
    checkOutput("bin/fhirpath -e '%v1 + 2' -r '{}' -v '{\"v1\": 5}'", /7/g);
  });

  it ('should accept the -o parameter to enable precision-safe arithmetic', function() {
    checkOutput("bin/fhirpath -e '0.1 + 0.2' -r '{}' -o precise", /\s0.3\s/g);
  });

  it ('should accept the -o parameter to disable precision-safe arithmetic', function() {
    checkOutput("bin/fhirpath -e '0.1 + 0.2' -r '{}' -o native", /\s0.300000/g);
  });

  it ('should output help without arguments', function() {
    checkOutput("bin/fhirpath", /Options/g);
  });

  describe('long options', function() {
    it ('should output a parse tree without a resource', function() {
      checkOutput('bin/fhirpath --expression "1 + 2"', /Additive/g);
    });

    it ('should evaluate when given a resource', function() {
      checkOutput("bin/fhirpath --expression '1 + 2' --resourceJSON '{}'", /3/g);
    });

    it ('should evaluate when given a resource file', function() {
      let tempFileObj = createTempResource('{"a": {"b": 1}}');
      checkOutput("bin/fhirpath --expression 'a.b + 3' --resourceFile "+
        tempFileObj.name, /4/g);
      tempFileObj.removeCallback();
    });

    it ('should accept a hash of variables', function() {
      checkOutput("bin/fhirpath --expression '%v1 + 2' --resourceJSON '{}'"+
        " --variables '{\"v1\": 5}'", /7/g);
    });

    it('should accept a FHIR model object', function() {
      checkOutput("bin/fhirpath --expression 'Observation.value' --resourceJSON "+
        "'{\"resourceType\": \"Observation\", \"valueString\": \"green\"}'"+
        " --model r4", /green/);
    });

    it ('should accept the --mathMode parameter to enable precision-safe arithmetic', function() {
      checkOutput("bin/fhirpath -e '0.1 + 0.2' -r '{}' --mathMode precise", /\s0.3\s/g);
    });
  });
})
