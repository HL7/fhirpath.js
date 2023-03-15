const fhirpath = require("fhirpath");

function extractValues(input, key) {
  let result = [];
  if (input) {
    // If value exists for key on current input object, add it to result
    let keyValue = input[key];
    if (keyValue !== undefined) {
      result.push(keyValue);
    }
    /* Iterate object or array value types on input and recusrivly extract
    values from same key from those "child" values if these exist */
    for (const value of Object.values(input)) {
      if (typeof value === "object") {
        result = result.concat(extractValues(value, key));
      } else if (typeof value === "array") {
        for (const item of value) {
          result = result.concat(extractValues(item, key));
        }
      }
    }
  }

  return result;
}

function filterByValue(array, string) {
  return array.filter((o) =>
    Object.keys(o).some((k) =>
      o[k].toLowerCase().includes(string.toLowerCase())
    )
  );
}

function getResourceExpression(resource) {
  extensions = resource["extension"];
  valueExpressions = extractValues(extensions, "valueExpression");
  filteredExpressions = filterByValue(valueExpressions, "text/fhirpath");
  expressions = extractValues(filteredExpressions, "expression");
  return expressions;
}

function getResourceVariable(resource) {
  extensions = resource["extension"];
  filteredVariables = filterByValue(
    extensions,
    "http://hl7.org/fhir/StructureDefinition/variable"
  );
  return filteredVariables;
}

function validateItemExpressions(resource, context) {
  for (item_idx in resource.item) {
    item = resource.item[item_idx];
    const expressions = getResourceExpression(item);
    context["qitem"] = item;
    for (exp in expressions) {
      // console.log(expressions[exp]);
      try {
        fhirpath.evaluate(item, expressions[exp], context);
      } catch (e) {
        e.message =
          "item:" +
          (resource.linkId === undefined ? resource.name : resource.linkId) +
          "\n" +
          "expresion" +
          expressions[exp] +
          "\n" +
          e.message;
        throw e;
      }
    }
    validateItemExpressions(item, context);
  }
}

module.exports = {
  filterByValue: filterByValue,
  extractValues: extractValues,
  getResourceExpression: getResourceExpression,
  getResourceVariable: getResourceVariable,
  validateItemExpressions: validateItemExpressions,
};
