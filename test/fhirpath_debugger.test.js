/* eslint-disable linebreak-style */

const fhirpath = require("../src/fhirpath");
const fhirpath_r4_model = require("../fhir-context/r4");

function readFullPropertyName(item) {
  if (item?.fullPropertyName) {
    return item.fullPropertyName();
  }
  return undefined;
}

function debugTracer(traceOutput) {
  return (ctx, focus, result, node) => {
    if (
      node.type !== "LiteralTerm" &&
      node.type !== "ExternalConstantTerm" &&
      node.type !== "MemberInvocation" &&
      node.type !== "FunctionInvocation" &&
      node.type !== "ThisInvocation" &&
      node.type !== "IndexInvocation" &&
      node.type !== "TotalInvocation" &&
      node.type !== "IndexerExpression" &&
      node.type !== "PolarityExpression" &&
      node.type !== "MultiplicativeExpression" &&
      node.type !== "AdditiveExpression" &&
      node.type !== "TypeExpression" &&
      node.type !== "UnionExpression" &&
      node.type !== "InequalityExpression" &&
      node.type !== "EqualityExpression" &&
      node.type !== "MembershipExpression" &&
      node.type !== "AndExpression" &&
      node.type !== "OrExpression" &&
      node.type !== "ImpliesExpression"
    ) {
      // console.log("skipping " + node.type);
      return;
    }
    // console.log( node, focus, result);
    let debugTraceVal = {
      exprName: node.text,
      exprStartLine: node.start.line,
      exprStartColumn: node.start.column,
      exprLength: node.length,
      values: [],
      thisVar: [],
      focusVar: [],
    };

    if (node.type === "LiteralTerm") debugTraceVal.exprName = "constant";
    if (node.type === "IndexerExpression") debugTraceVal.exprName = "[]";
    if (node.type === "ThisInvocation") debugTraceVal.exprName = "$this";
    if (node.type === "TotalInvocation") debugTraceVal.exprName = "$total";
    if (node.type === "IndexInvocation") debugTraceVal.exprName = "$index";

    for (let item of focus) {
      let val = ToTraceValue(item);
      debugTraceVal.focusVar?.push(val);
    }

    if (ctx.$index != undefined) {
      debugTraceVal.index = ctx.$index;
    }
    if (ctx.$this || ctx.dataRoot) {
      for (let item of ctx.$this || ctx.dataRoot) {
        let val = ToTraceValue(item);
        debugTraceVal.thisVar?.push(val);
      }
    }
    for (let item of result) {
      let val = ToTraceValue(item);
      debugTraceVal.values?.push(val);
    }

    traceOutput.push(debugTraceVal);
  };
}

// BigInt-aware stringify: represent BigInt as a JSON string with trailing 'n'
function stringifySafe(val, space = 2) {
  return JSON.stringify(
    val,
    (_key, v) => (typeof v === 'bigint' ? v.toString() + 'n' : v),
    space
  );
}

function ToTraceValue(item) {
  let typeName = Object.prototype.toString
    .call(item ?? "")
    .substring(8)
    .replace("]", "");
  if (typeof item.getTypeInfo === "function")
    typeName = item.getTypeInfo().name;
  let val = {
    valueType: typeName,
    resourcePath: readFullPropertyName(item),
  };
  if (!val.resourcePath) {
    val.value = item.data
      ? stringifySafe(item.data, 2)
      : stringifySafe(item, 2);
  }
  val.rawData = item.data ?? item;
  return val;
}

const patientExample = {
  "resourceType": "Patient",
  "id": "example",
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table><tbody><tr><td>Name</td><td>Peter James \r\n              <b>Chalmers</b> (\"Jim\")\r\n            </td></tr><tr><td>Address</td><td>534 Erewhon, Pleasantville, Vic, 3999</td></tr><tr><td>Contacts</td><td>Home: unknown. Work: (03) 5555 6473</td></tr><tr><td>Id</td><td>MRN: 12345 (Acme Healthcare)</td></tr></tbody></table></div>"
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR"
          }
        ]
      },
      "system": "urn:oid:1.2.36.146.595.217.0.1",
      "value": "12345",
      "period": {
        "start": "2001-05-06"
      },
      "assigner": {
        "display": "Acme Healthcare"
      }
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Chalmers",
      "given": [
        "Peter",
        "James"
      ]
    },
    {
      "use": "usual",
      "given": [
        "Jim"
      ]
    },
    {
      "use": "maiden",
      "family": "Windsor",
      "given": [
        "Peter",
        "James"
      ],
      "period": {
        "end": "2002"
      }
    }
  ],
  "telecom": [
    {
      "use": "home"
    },
    {
      "system": "phone",
      "value": "(03) 5555 6473",
      "use": "work",
      "rank": 1
    },
    {
      "system": "phone",
      "value": "(03) 3410 5613",
      "use": "mobile",
      "rank": 2
    },
    {
      "system": "phone",
      "value": "(03) 5555 8834",
      "use": "old",
      "period": {
        "end": "2014"
      }
    }
  ],
  "gender": "male",
  "birthDate": "1974-12-25",
  "_birthDate": {
    "extension": [
      {
        "url": "http://hl7.org/fhir/StructureDefinition/patient-birthTime",
        "valueDateTime": "1974-12-26T06:35:45+11:00"
      }
    ]
  },
  "deceasedBoolean": false,
  "address": [
    {
      "use": "home",
      "type": "both",
      "text": "534 Erewhon St PeasantVille, Rainbow, Vic  3999",
      "line": [
        "534 Erewhon St"
      ],
      "city": "PleasantVille",
      "district": "Rainbow",
      "state": "Vic",
      "postalCode": "3999",
      "period": {
        "start": "1974-12-25"
      }
    }
  ],
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "N"
            }
          ]
        }
      ],
      "name": {
        "family": "du Marché",
        "_family": {
          "extension": [
            {
              "url": "http://hl7.org/fhir/StructureDefinition/humanname-own-prefix",
              "valueString": "VV"
            }
          ]
        },
        "given": [
          "Bénédicte"
        ]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+33 (237) 998327"
        }
      ],
      "address": {
        "use": "home",
        "type": "both",
        "line": [
          "534 Erewhon St"
        ],
        "city": "PleasantVille",
        "district": "Rainbow",
        "state": "Vic",
        "postalCode": "3999",
        "period": {
          "start": "1974-12-25"
        }
      },
      "gender": "female",
      "period": {
        "start": "2012"
      }
    }
  ],
  "managingOrganization": {
    "reference": "Organization/1"
  }
};

function formatTrace(expression, traceData) {
  var lines = expression.split('\n');
  let curLine = traceData.exprStartLine - 1;
  let position = traceData.exprStartColumn - 1;
  while (curLine > 0) {
    position += lines[curLine - 1].length + 1; // +1 for the newline character
    curLine--;
  }

  return `${position},${traceData.exprLength},${traceData.exprName}: focus=${traceData.focusVar.length} result=${traceData.values.length}`;
}

test("testDebugTrace_PropertyWalking", () => {
  let traceOutput = [];
  let expression = "Patient.birthDate.toString().substring(0, 4)";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results (the annotated results are in the last trace output)
  expect(results.length).toBe(1);
  const resultOutput = traceOutput[traceOutput.length - 1].values;
  expect(resultOutput.length).toBe(1);
  expect(resultOutput[0].value).toBe('"1974"');

  // check the trace results
  expect(traceOutput.length).toBe(6);
  expect(formatTrace(expression, traceOutput[0])).toBe("0,7,Patient: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[1])).toBe("8,9,birthDate: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[2])).toBe("18,8,toString: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[3])).toBe("39,1,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[4])).toBe("42,1,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[5])).toBe("29,9,substring: focus=1 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    expect(traceData.thisVar[0].valueType).toBe("Patient");
    expect(traceData.thisVar[0].resourcePath).toBe("Patient");
    expect(traceData.thisVar[0].rawData).toBeDefined();

    const vFocus = traceData.focusVar[0];
    const vResult = traceData.values[0];

    if (n == 2) {
      // tostring
      expect(vFocus.valueType).toBe("date");
      expect(vFocus.resourcePath).toBe("Patient.birthDate");
      expect(vFocus.rawData).toBe("1974-12-25");

      expect(vResult.valueType).toBe("String");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe("1974-12-25");
    }

    if (n == 3) {
      // constant 0
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");

      expect(vResult.valueType).toBe("Number");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe(0);
    }

    if (n == 4) {
      // constant 4
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");

      expect(vResult.valueType).toBe("Number");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe(4);
    }

    if (n == 5) {
      // substring
      expect(vFocus.valueType).toBe("String");
      expect(vFocus.resourcePath).toBe(undefined);
      expect(vFocus.rawData).toBe("1974-12-25");

      expect(vResult.valueType).toBe("String");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe("1974");
    }

    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_PropertyAndFunctionCalls", () => {
  let traceOutput = [];
  let expression = "Patient.id.indexOf('am')";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results
  expect(results.length).toBe(1);
  expect(results[0]).toBe(2);

  // check the trace results
  expect(traceOutput.length).toBe(4);
  expect(formatTrace(expression, traceOutput[0])).toBe("0,7,Patient: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[1])).toBe("8,2,id: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[2])).toBe("19,4,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[3])).toBe("11,7,indexOf: focus=1 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    expect(traceData.thisVar[0].valueType).toBe("Patient");
    expect(traceData.thisVar[0].resourcePath).toBe("Patient");
    expect(traceData.thisVar[0].rawData).toBeDefined();

    const vFocus = traceData.focusVar[0];
    const vResult = traceData.values[0];

    if (n == 2) {
      // the context and results of the constant 'am' call
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");

      expect(vResult.valueType).toBe("String");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe("am");
    }

    if (n == 3) {
      // the context and results of indexOf call
      expect(vFocus.valueType).toBe("String");
      expect(vFocus.resourcePath).toBe("Patient.id");
      expect(vFocus.rawData).toBe("example");

      expect(vResult.valueType).toBe("Number");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe(2);
    }

    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_Aggregate", () => {
  let traceOutput = [];
  let expression = "(1|2).aggregate($total+$this, 0)";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results (the annotated results are in the last trace output)
  expect(results.length).toBe(1);
  const resultOutput = traceOutput[traceOutput.length - 1].values;
  expect(resultOutput.length).toBe(1);
  expect(resultOutput[0].value).toBe('3');

  // check the trace results
  expect(traceOutput.length).toBe(11);
  let n = 0;
  expect(formatTrace(expression, traceOutput[n++])).toBe("1,1,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("3,1,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("2,1,|: focus=1 result=2");
  expect(formatTrace(expression, traceOutput[n++])).toBe("30,1,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("16,6,$total: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("23,5,$this: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("22,1,+: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("16,6,$total: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("23,5,$this: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("22,1,+: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("6,9,aggregate: focus=2 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    
    if (n == 2) {
      // the results of the | operator
      const vThis = traceData.thisVar[0];
      const vFocus = traceData.focusVar[0];
      const vResult1 = traceData.values[0];
      const vResult2 = traceData.values[1];
      expect(vThis.valueType).toBe("Patient");
      expect(vThis.resourcePath).toBe("Patient");
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");

      expect(vResult1.resourcePath).toBe(undefined);
      expect(vResult1.rawData).toBe(1);
      expect(vResult2.rawData).toBe(2);
      expect(vResult2.valueType).toBe("Number");
    }
    
    if (n == 3) {
      // the results of the constant "0" for the init expression
      const vThis = traceData.thisVar[0];
      const vFocus = traceData.focusVar[0];
      const vResult = traceData.values[0];
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");

      expect(vResult.valueType).toBe("Number");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe(0);
    }
    
    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_Operator", () => {
  let traceOutput = [];
  let expression = "Patient.id.toString() = Patient.id";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results
  expect(results.length).toBe(1);
  expect(results[0]).toBe(true);

  // check the trace results
  expect(traceOutput.length).toBe(6);
  expect(formatTrace(expression, traceOutput[0])).toBe("0,7,Patient: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[1])).toBe("8,2,id: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[2])).toBe("11,8,toString: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[3])).toBe("24,7,Patient: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[4])).toBe("32,2,id: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[5])).toBe("22,1,=: focus=1 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    expect(traceData.thisVar[0].valueType).toBe("Patient");
    expect(traceData.thisVar[0].resourcePath).toBe("Patient");
    
    const vFocus = traceData.focusVar[0];
    const vResult = traceData.values[0];

    if (n == 2) {
      // the context and results of toString call
      expect(vFocus.valueType).toBe("String");
      expect(vFocus.resourcePath).toBe("Patient.id");
      expect(vFocus.rawData).toBe("example");

      expect(vResult.valueType).toBe("String");
      expect(vResult.resourcePath).toBe(undefined);
      expect(vResult.rawData).toBe("example");
    }
    
    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_WhereClause", () => {
  let traceOutput = [];
  let expression = "name.where(use='official' or use='usual').given";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results
  expect(results.length).toBe(3);
  expect(results[0]).toBe("Peter");
  expect(results[1]).toBe("James");
  expect(results[2]).toBe("Jim");

  // Check the paths of the nodes
  var finalResults = traceOutput[traceOutput.length - 1].values;
  expect(finalResults.length).toBe(3);
  expect(finalResults[0].rawData).toBe("Peter");
  expect(finalResults[1].rawData).toBe("James");
  expect(finalResults[2].rawData).toBe("Jim");
  expect(finalResults[0].resourcePath).toBe("Patient.name[0].given[0]");
  expect(finalResults[1].resourcePath).toBe("Patient.name[0].given[1]");
  expect(finalResults[2].resourcePath).toBe("Patient.name[1].given[0]");

  // check the trace results
  expect(traceOutput.length).toBe(24); // the fhirpath.js engine doesn't do short circuit evaluation
  let n = 0;
  expect(formatTrace(expression, traceOutput[n++])).toBe("0,4,name: focus=1 result=3");

  expect(formatTrace(expression, traceOutput[n++])).toBe("11,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("15,10,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("14,1,=: focus=1 result=1");

  // These aren't done by the Firely engine that has short circuit evaluation
  expect(formatTrace(expression, traceOutput[n++])).toBe("29,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("33,7,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("32,1,=: focus=1 result=1");

  expect(formatTrace(expression, traceOutput[n++])).toBe("26,2,or: focus=1 result=1");

  expect(formatTrace(expression, traceOutput[n++])).toBe("11,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("15,10,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("14,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("29,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("33,7,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("32,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("26,2,or: focus=1 result=1");

  expect(formatTrace(expression, traceOutput[n++])).toBe("11,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("15,10,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("14,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("29,3,use: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("33,7,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("32,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[n++])).toBe("26,2,or: focus=1 result=1");

  expect(formatTrace(expression, traceOutput[n++])).toBe("5,5,where: focus=3 result=2");
  expect(formatTrace(expression, traceOutput[n++])).toBe("42,5,given: focus=2 result=3");

  // And check the traced data for specific cases
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    const vFocus = traceData.focusVar[0];
    const vResult = traceData.values[0];
    const vThis = traceData.thisVar[0];

    if (n == 0) {
      // name
      expect(vThis.valueType).toBe("Patient");
      expect(vThis.resourcePath).toBe("Patient");
      expect(vFocus.valueType).toBe("Patient");
      expect(vFocus.resourcePath).toBe("Patient");
      expect(traceData.values.length).toBe(3);
    }

    // For the first HumanName (name[0]) - indices 1-7 approximately
    if (n >= 1 && n <= 7) {
      expect(vThis.valueType).toBe("HumanName");
      expect(vThis.resourcePath).toBe("Patient.name[0]");
      expect(vFocus.valueType).toBe("HumanName");
      expect(vFocus.resourcePath).toBe("Patient.name[0]");
      expect(traceData.index).toBe(0);
    }

    // For the second HumanName (name[1]) - indices 8-14 approximately  
    if (n >= 8 && n <= 14) {
      expect(vThis.valueType).toBe("HumanName");
      expect(vThis.resourcePath).toBe("Patient.name[1]");
      expect(vFocus.valueType).toBe("HumanName");
      expect(vFocus.resourcePath).toBe("Patient.name[1]");
      expect(traceData.index).toBe(1);
    }

    // For the third HumanName (name[2]) - indices 15-21 approximately
    if (n >= 15 && n <= 21) {
      expect(vThis.valueType).toBe("HumanName");
      expect(vThis.resourcePath).toBe("Patient.name[2]");
      expect(vFocus.valueType).toBe("HumanName");
      expect(vFocus.resourcePath).toBe("Patient.name[2]");
      expect(traceData.index).toBe(2);
    }

    if (n == 22) {
      // Where clause result
      expect(vThis.valueType).toBe("Patient");
      expect(vThis.resourcePath).toBe("Patient");
      expect(vFocus.valueType).toBe("HumanName");
      expect(vFocus.resourcePath).toBe("Patient.name[0]");
      expect(traceData.focusVar.length).toBe(3);
      expect(traceData.values.length).toBe(2); // Should return 2 names that match the criteria
      expect(vResult.valueType).toBe("HumanName");
      expect(vResult.resourcePath).toBe("Patient.name[0]");
    }

    if (n == 23) {
      // The final given property navigator
      expect(vThis.valueType).toBe("Patient");
      expect(vThis.resourcePath).toBe("Patient");
      expect(vFocus.valueType).toBe("HumanName");
      expect(vFocus.resourcePath).toBe("Patient.name[0]");
      expect(traceData.focusVar.length).toBe(2);
      expect(traceData.values.length).toBe(3); // Should return 3 given names total
    }
    
    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_ConstantValues", () => {
  let traceOutput = [];
  let expression = "'42'";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results
  expect(results.length).toBe(1);
  expect(results[0]).toBe("42");

  // check the trace results
  expect(traceOutput.length).toBe(1);
  expect(formatTrace(expression, traceOutput[0])).toBe("0,4,constant: focus=1 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    
    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});

test("testDebugTrace_GroupedOr", () => {
  let traceOutput = [];
  let expression = "id='official' or id='example'";
  let options = {
    debugger: debugTracer(traceOutput),
  };
  let results = fhirpath.evaluate(patientExample, expression, {}, fhirpath_r4_model, options);
  console.log(JSON.stringify(results, null, 2));
  let logData = [];
  for (let traceData of traceOutput) {
    logData.push(formatTrace(expression, traceData));
  }
  console.log(logData);

  // Check the actual results
  expect(results.length).toBe(1);
  expect(results[0]).toBe(true);

  // check the trace results
  expect(traceOutput.length).toBe(7);
  expect(formatTrace(expression, traceOutput[0])).toBe("0,2,id: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[1])).toBe("3,10,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[2])).toBe("2,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[3])).toBe("17,2,id: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[4])).toBe("20,9,constant: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[5])).toBe("19,1,=: focus=1 result=1");
  expect(formatTrace(expression, traceOutput[6])).toBe("14,2,or: focus=1 result=1");

  // And check the traced data
  for (let n = 0; n < traceOutput.length; n++) {
    const traceData = traceOutput[n];
    expect(traceData.thisVar[0].valueType).toBe("Patient");
    expect(traceData.thisVar[0].resourcePath).toBe("Patient");
    
    const vFocus = traceData.focusVar[0];
    expect(vFocus.valueType).toBe("Patient");
    expect(vFocus.resourcePath).toBe("Patient");
    
    expect(traceData.exprName).toBeDefined();
    expect(traceData.exprStartLine).toBeDefined();
    expect(traceData.exprStartColumn).toBeDefined();
    expect(traceData.exprLength).toBeDefined();
    expect(traceData.values).toBeDefined();
    expect(traceData.focusVar).toBeDefined();
    expect(traceData.thisVar).toBeDefined();
  }
});
