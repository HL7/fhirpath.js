require('./index.html');
require('./app.css');

require ('../../browser-build/fhirpath.min');
require('../../browser-build/fhirpath.r5.min');
require('../../browser-build/fhirpath.r4.min');
require('../../browser-build/fhirpath.stu3.min');
require('../../browser-build/fhirpath.dstu2.min');
const codeMirror = require("codemirror");
const yaml = require('js-yaml');

require("codemirror/mode/yaml/yaml.js");
require("codemirror/mode/javascript/javascript.js");
require("codemirror/addon/lint/yaml-lint.js");
require("codemirror/lib/codemirror.css");

const {compressToEncodedURIComponent, decompressFromEncodedURIComponent} = require("lz-string");

const example = require("./patient-example.yaml");

document.getElementById('version').innerText = '(version ' + fhirpath.version + ')';


const debounce = (func, delay) => {
  let inDebounce;
  return () => {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(context, args), delay);
  };
};

const pathNode = document.getElementById("path");
const terminologyUrlNode = document.getElementById("terminologyUrl");
const fhirServerUrlNode = document.getElementById("fhirServerUrl");
const outNode = document.getElementById("output");
let abortController;

function evaluate(){
  try  {
    // Clear the output node
    document.getElementById('copyStatus').className = '';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;
    const expr = pathNode.value;
    const terminologyUrl = terminologyUrlNode.value;
    const fhirServerUrl = fhirServerUrlNode.value;
    if (expr.trim() !== '') {
      let res;
      let envVars = {};
      console.log('Expression:', pathNode.value);
      console.log('Model version:', window[modelName].version);
      console.log('Terminology server URL:', terminologyUrl);
      console.log('FHIR server URL:', fhirServerUrl);
      getVariableLabels().forEach((item, index) => {
        const inputText = item.getAttribute('data-json');
        if (index === 0) {
          res = inputText ? JSON.parse(inputText) : undefined;
          console.log('Input resource:', res);
        } else {
          const varName = item.querySelector('input').value;
          if (varName) {
            envVars[varName] = inputText ? JSON.parse(inputText) : undefined;
            console.log(`Variable %%${varName}:`, envVars[varName]);
          }
        }
      });
      const result = fhirpath.evaluate(res, expr, envVars, window[modelName],
        {terminologyUrl, fhirServerUrl, async: true, signal});
      outNode.innerHTML = '<pre>Evaluation...</pre>';
      if (result instanceof Promise) {
        result.then(function (r) {
          // yaml.dump will pick up internal keys, e.g. "asStr" in the FP_Type
          // objects (dates and times).  Apparently, toString() is not called on the
          // objects during yaml.dump, so we take care of that by calling toJSON
          // first, parsing that, and then creating the yaml output.
          outNode.childNodes.item(0).textContent =
            yaml.dump(JSON.parse(fhirpath.util.toJSON(r)), {lineWidth: 50});
        }).catch((e) => {
          if (!signal.aborted) {
            outNode.innerHTML = '<div style="color: red;" />';
            outNode.childNodes.item(0).textContent = e.toString();
          }
        });
      } else {
        outNode.childNodes.item(0).textContent =
          yaml.dump(JSON.parse(fhirpath.util.toJSON(result)), {lineWidth: 50});
      }
    }
  } catch (e) {
    outNode.innerHTML = '<div style="color: red;" />';
    const msg = e.toString();
    msg.replace(/\n/, '<br>');
    outNode.childNodes.item(0).textContent = e.toString();
    console.error(e);
  }
}


let inputTypeBeforeChange = document.querySelector(
  'input[name="inputType"]:checked'
).value;


const cm = codeMirror(document.getElementById("input"), {
  value: '',
  lineNumbers: true,
  mode: {name: 'javascript', json: true}
});
window.cm = cm; // for testing purposes


/**
 *  Event handle for the inputType buttons.
 */
function handleInputTypeChange(event) {
  const newInputType = event.target.value;
  if (newInputType !== inputTypeBeforeChange) {
    inputTypeBeforeChange = newInputType;
    if (newInputType === 'json') {
      var yamlVal = cm.getValue();
      cm.setOption('mode', 'javascript');
      cm.setOption('json', 'true');
      if (yamlVal) {
        cm.setValue(fhirpath.util.toJSON(yaml.safeLoad(yamlVal), 2));
      }
    }
    else { // yaml
      var jsonVal = cm.getValue();
      cm.setOption('mode', 'yaml');
      if (jsonVal) {
        cm.setValue(yaml.dump(JSON.parse(jsonVal)));
      }
    }
  }
}


/**
 * Updates the title of the CodeMirror editor based on the selected variable's
 * name.
 */
function updateEditorTitle() {
  const selected = document.querySelector('#variables label.selected');
  const varName = selected.querySelector('input').value;
  const inputTitle = document.querySelector('#inputTitle');
  inputTitle.textContent = (varName === 'context')
    ? 'Edit the contents of the context resource (%context)'
    : varName
      ? 'Edit the contents of the %' + varName + ' variable'
      : 'Edit the contents of the new variable';
}

/**
 * Updates the CodeMirror editor text based on the selected variable's data.
 * If the editor mode is 'yaml', it converts the JSON data to YAML format.
 * Otherwise, it sets the editor text to the JSON data directly.
 */
function updateEditorText() {
  const selected = document.querySelector('#variables label.selected');
  const json = selected.getAttribute('data-json');
  if (cm.getOption('mode') === 'yaml') {
    cm.setValue(json ? yaml.dump(JSON.parse(json)) : '');
  } else {
    cm.setValue(json || '');
  }
}


/**
 * Updates the currently selected variable's data attribute with the text
 * from the CodeMirror editor. If the editor mode is 'yaml', it converts the
 * editor text to JSON format before setting the data attribute.
 */
function updateCurrentVariable() {
  const selected = document.querySelector('#variables label.selected');
  const editorText = cm.getValue();
  if (cm.getOption('mode') === 'yaml') {
    selected.setAttribute('data-json', editorText ? fhirpath.util.toJSON(yaml.safeLoad(cm.getValue()), 2) : '');
  } else {
    selected.setAttribute('data-json', editorText);
  }
  evaluate();
}


var inputTypeElems = document.querySelectorAll('input[name="inputType"]');
for (let i=0, len=inputTypeElems.length; i<len; ++i)
  inputTypeElems[i].onchange = handleInputTypeChange;

pathNode.addEventListener("input", debounce(evaluate, 200));
cm.on('change', debounce(updateCurrentVariable, 300));

let modelName = document.querySelector(
  'input[name="modelName"]:checked'
).value;


/**
 * Event handle for the modelName buttons.
 */
function handleModelNameChange(event) {
  var newModelName = event.target.value;
  if (newModelName !== modelName) {
    modelName = newModelName;
    debounce(evaluate, 300)();
  }
}


const modelNameElems = document.querySelectorAll('input[name="modelName"]');
for (let i = 0, len = modelNameElems.length; i < len; ++i)
  modelNameElems[i].onchange = handleModelNameChange;

[terminologyUrlNode, fhirServerUrlNode].forEach(nodeWithUrl => {
  nodeWithUrl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      debounce(evaluate, 300)();
    }
  });
  nodeWithUrl.addEventListener("blur", debounce(evaluate, 300));
});


/**
 * Returns all variable labels.
 * @returns {NodeList} A NodeList of label elements.
 */
const getVariableLabels = () =>
  document.querySelectorAll('#variables label:has(li)');


/**
 * Event handler for selecting a variable label.
 * @param {Event} event - The focusin event.
 */
const selectVariableLabel = (event) => {
  getVariableLabels().forEach((item) => (item.className = ""));
  event.currentTarget.className = 'selected';
  updateEditorText();
  updateEditorTitle();
};

// Add focusin event listeners to each variable label and set the first label as
// selected by default.
getVariableLabels().forEach((item, index) => {
  item.addEventListener("focusin", selectVariableLabel);
  if (index === 0) {
    item.className = "selected";
    item.setAttribute("data-json", fhirpath.util.toJSON(example, 2));
  }
});


/**
 * Adds a new variable label element to the variables list in the UI. The label
 * contains an input for the variable name and a button to remove the variable.
 * If a value is provided, it is serialized and set as a data attribute.
 * Event listeners are attached for selection, input changes, and removal.
 *
 * @param {string|null} name - The name of the variable to add. If null,
 *  the input will be empty.
 * @param {Object|null} val - The value of the variable to add. Serialized
 *  as JSON if provided.
 * @returns {HTMLElement} The newly created label element representing
 *  the variable.
 */
function addVariable(name = null, val = null) {
  const newItem = document.createElement("label");
  newItem.innerHTML =
    `<li>%<input type="text" value="${name || ''}"></li><button type="button">` +
    "Remove variable</button>";
  if (val) {
    newItem.setAttribute("data-json", fhirpath.util.toJSON(val, 2));
  }

  newItem.addEventListener("focusin", selectVariableLabel);
  newItem.querySelector('input').addEventListener("input", debounce(() => {
    updateEditorTitle();
    evaluate();
  }, 300));
  newItem.querySelector("button").addEventListener("click", () => {
    newItem.previousElementSibling.focus();
    newItem.remove();
  });
  document.querySelector("#variables ul").appendChild(newItem);
  return newItem;
}


// Event handler for adding a new variable.
document.getElementById("addVariable").addEventListener("click", () => {
  const newItem = addVariable();
  setTimeout(() => newItem.querySelector("input").focus());
});

/**
 * Adds an event listener to the "Load from file" button to trigger a click
 * event on the hidden file input element.
 */
document.getElementById('loadFileButton').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

/**
 * Adds an event listener to the file input element to handle file selection
 * and reading. When a file is selected, it reads the file content and sets it
 * as the value of the CodeMirror editor.
 * @param {Event} event - The change event triggered when a file is selected.
 */
document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      cm.setValue(content);
    };
    reader.readAsText(file);
  }
  // Reset the file input value to allow reloading the same file if needed
  event.target.value = '';
});


/**
 * Parses the current URL and extracts the 'p' query parameter, which contains
 * compressed and encoded application state.
 */
const currentUrl = new URL(location.href);
const encAppState = currentUrl.searchParams.get('p');


/**
 * Adds a click event listener to the "Copy URL" button. When clicked, it
 * serializes the current application state (path, variables, model, terminology
 * URL, and input type), compresses and encodes it, and copies the resulting
 * shareable URL to the clipboard.
 */
document.getElementById("copyUrl").addEventListener("click", () => {
  const vars = [];
  getVariableLabels().forEach((item, index) => {
    const varName = item.querySelector('input').value;
    const inputText = item.getAttribute('data-json');
    vars[index] = {
      name: varName,
      val: inputText ? JSON.parse(inputText) : undefined
    };
  });

  let shareUrl = `${currentUrl.origin}${currentUrl.pathname}?p=${
    compressToEncodedURIComponent(JSON.stringify({
      path: pathNode.value,
      vars,
      model: modelName,
      terminologyUrl: terminologyUrlNode.value,
      fhirServerUrl: fhirServerUrlNode.value,
      inputType: inputTypeBeforeChange
    }))}`;
  navigator.clipboard.writeText(shareUrl)
    .then(() => {
      document.getElementById('copyStatus').className = 'success';

    })
    .catch(() => {
      document.getElementById('copyStatus').className = 'error';
    });
});


/**
 * If a compressed state is present in the URL ('p' parameter), this block
 * restores the application state by:
 * - Setting the FHIRPath expression value
 * - Removing existing variables
 * - Restoring resource value(%context), variables and their values
 * - Updating the selected model, terminology URL, and input type
 */
if (encAppState) {
  const appState = JSON.parse(decompressFromEncodedURIComponent(encAppState));
  // Update the value of the FHIRPath expression:
  pathNode.value = appState.path;

  // Remove all vars:
  document.querySelectorAll('#variables label:has(li):not(:first-child)')
    .forEach(item => item.remove());

  // Update resource and variables:
  appState?.vars?.forEach(({name, val}, index) => {
    if (index === 0) {
      const item = document.querySelector(
        '#variables label:has(li):first-child');
      item.className = 'selected';
      item.setAttribute("data-json", fhirpath.util.toJSON(val, 2));
    } else {
      addVariable(name, val);
    }
  });

  // Update model and terminology URL:
  if (appState?.model) {
    modelName = appState.model;
    document.querySelector(`input[name="modelName"][value="${modelName}"]`)
      .checked = true;
  }
  // Update terminology server Url
  if (appState?.terminologyUrl) {
    terminologyUrlNode.value = appState.terminologyUrl;
  }

  // Update FHIR server Url
  if (appState?.fhirServerUrl) {
    fhirServerUrlNode.value = appState.fhirServerUrl;
  }

  // Update input type
  if (appState?.inputType) {
    const inputTypeNode = document.querySelector(
      `input[name="inputType"][value="${appState.inputType}"]`);
    if (inputTypeNode) {
      inputTypeNode.checked = true;
      handleInputTypeChange({target: inputTypeNode});
    }
  }
}


// Initial evaluation
updateEditorText();
updateEditorTitle();
