require('file-loader?name=index.html!./index.html');
require('./app.css');

const fhirpath = require('../../build/fhirpath.js');
const codeMirror = require("codemirror");
const yaml = require('js-yaml');

require("codemirror/mode/yaml/yaml.js");
require("codemirror/mode/javascript/javascript.js");
require("codemirror/addon/lint/yaml-lint.js");
require("codemirror/lib/codemirror.css");

const example = require("json-loader!yaml-loader!./patient-example.yaml");

const debounce = (func, delay) => {
  let inDebounce;
  return () => {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(context, args), delay);
  };
};

var pathNode = document.getElementById("path");
var outNode = document.getElementById("output");

function evaluate(){
  try  {
    var inputType = document.querySelector('input[name="inputType"]:checked').value
    var inputText = cm.getValue();
    var res = inputType === 'yaml' ? yaml.safeLoad(inputText) : JSON.parse(inputText);
    console.log(pathNode.value, res);
    var result = fhirpath.evaluate(res, pathNode.value);
    outNode.innerHTML = '<pre />';
    outNode.childNodes.item(0).textContent = yaml.dump(result);
  } catch (e) {
    outNode.innerHTML = '<pre style="color: red;" />';
    outNode.childNodes.item(0).textContent = e.toString();
    console.error(e);
  }
}


var cm = codeMirror(document.getElementById("input"), {
  value: yaml.dump(example),
  lineNumbers: true,
  mode:  "yaml"
});
window.cm = cm; // for testing purposes

var inputTypeBeforeChange =
  document.querySelector('input[name="inputType"]:checked').value;

/**
 *  Event handle for the inputType buttons.
 */
function handleInputTypeChange(event) {
  var newInputType = event.target.value;
  if (newInputType !== inputTypeBeforeChange) {
    if (newInputType === 'json') {
      var yamlVal = cm.getValue();
      cm.setOption('mode', 'javascript');
      cm.setOption('json', 'true');
      cm.setValue(JSON.stringify(yaml.safeLoad(yamlVal), null, 2));
    }
    else { // yaml
      var jsonVal = cm.getValue();
      cm.setOption('mode', 'yaml');
      cm.setValue(yaml.dump(JSON.parse(jsonVal)));
    }
    inputTypeBeforeChange = newInputType;
  }
}
var inputTypeElems = document.querySelectorAll('input[name="inputType"]');
for (var i=0, len=inputTypeElems.length; i<len; ++i)
  inputTypeElems[i].onchange = handleInputTypeChange;

pathNode.addEventListener("input", debounce(evaluate, 200));
cm.on('change', debounce(evaluate, 300));

evaluate();
