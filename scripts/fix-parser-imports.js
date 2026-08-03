// Post-processes the ANTLR-generated parser files to convert them from
// ES module syntax (import/export) to CommonJS (require/module.exports),
// and to redirect the antlr4 import to the project's custom antlr4 index.
//
// This script is invoked by the "generateParser" npm script after ANTLR
// generates the parser source files into src/parser/generated/.

const fs = require('fs');
const glob = require('glob');

// Current directory is "src/parser", so "generated/*.js" matches the
// ANTLR-generated parser files.
const files = glob.sync('generated/*.js');

// Each replacement is a [pattern, substitution] pair applied in order:
//   1. Redirect the antlr4 ES module import to the project's CommonJS wrapper.
//   2. Convert the FHIRPathListener ES module import to a CommonJS require.
//   3. Convert "export default class" declarations to CommonJS module.exports.
const replacements = [
  [/import antlr4 from 'antlr4';/g,
    "const antlr4 = require('../antlr4-index');"],
  [/import FHIRPathListener from '.\/FHIRPathListener.js';/g,
    "const FHIRPathListener = require('./FHIRPathListener');"],
  [/export default class (.*) extends ([\s\S]*)/gm,
    "class $1 extends $2\nmodule.exports = $1;"]
];

// Apply all replacements to each generated file in place.
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
}
