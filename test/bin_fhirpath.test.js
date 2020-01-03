const {execSync} = require('child_process');

/**
 *  Tests that the given fhirpath command outputs something that matches the given pattern.
 * @param fpCmd the command to run.  It should start wiht "bin/fhirpath"
 * followed by the arguments.
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

  it ('should accept a hash of variables', function() {
    checkOutput("bin/fhirpath -e '%v1 + 2' -r '{}' -v '{\"v1\": 5}'", /7/g);
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
  });
})
