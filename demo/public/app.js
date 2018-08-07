require('file-loader?name=index.html!./index.html');
require('./app.css');

const fhirpath = require('../../build/fhirpath.js');
const codeMirror = require("codemirror");
const yaml = require('js-yaml');

require("codemirror/mode/yaml/yaml.js");
require("codemirror/addon/lint/yaml-lint.js");
require("codemirror/lib/codemirror.css");

const example = require("json-loader!yaml-loader!./example.yaml");

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
    var res = yaml.safeLoad(cm.getValue());
    console.log(pathNode.value, res);
    var result = fhirpath.evaluate(res, pathNode.value);
    outNode.innerHTML = '<pre>' + yaml.dump(result) + '</pre>';
  } catch (e) {
    outNode.innerHTML = '<pre style="color: red;">' + e.toString() + '</pre>';
    console.error(e);
  }
}


var cm = codeMirror(document.getElementById("input"), {
  value: yaml.dump(example),
  lineNumbers: true,
  mode:  "yaml"
});

pathNode.addEventListener("input", debounce(evaluate, 200));
cm.on('change', debounce(evaluate, 300));

evaluate();
