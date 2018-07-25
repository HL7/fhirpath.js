// Evaluates a FHIRPath expression and prints the result to the console.
const USAGE = "Usage: node bin/evaluate.js '{JSON data object}' 'FHIRPath expression'";

if (process.argv.length < 4)
  throw USAGE;

let data = JSON.parse(process.argv[2]);
let expression = process.argv[3];
let Interpreter = require('../interpreter');
let context = new (require('../fhir-context'))();
console.log(new Interpreter(context, data, expression).interpret());
