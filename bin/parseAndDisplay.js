// Parses the FHIRPath expression provided as a command line argument and prints
// the parsed tree of nodes to the console.
// Based on https://github.com/antlr/antlr4/blob/master/doc/javascript-target.md

if (process.argv.length < 2)
  throw 'Usage:  node parseAndDisplay.js \'[fhirpath expression]\''
var input = process.argv[2];

var path = require('path');
var scriptDir = path.dirname(process.argv[1]);
process.chdir(path.join(scriptDir, '..'));
console.log(process.cwd());
console.log(module.paths);
var antlr4 = require('antlr4/index');
var chars = new antlr4.InputStream(input);
var FHIRPathLexer = require('../parser/FHIRPathLexer');
var lexer = new FHIRPathLexer.FHIRPathLexer(chars);
var tokens  = new antlr4.CommonTokenStream(lexer);
var FHIRPathParser = require('../parser/FHIRPathParser');
var parser = new FHIRPathParser.FHIRPathParser(tokens);
parser.buildParseTrees = true;
var tree = parser.expression();

var FHIRPathListener = require('../parser/FHIRPathListener').FHIRPathListener;
function TreePrinter() {
   FHIRPathListener.call(this); // inherit default listener
   return this;
};

// inherit default listener
TreePrinter.prototype = Object.create(FHIRPathListener.prototype);
TreePrinter.prototype.constructor = TreePrinter;

var jsonRep = {}; // we'll build a JSON representation
var node;
var parentStack = [jsonRep];
for (let p of Object.keys(FHIRPathListener.prototype)) {
  if (p.startsWith('enter')) {
    TreePrinter.prototype[p] = function(ctx) {
      let parentNode = parentStack[parentStack.length - 1];
      let nodeType = p.slice(5); // remove "enter"
      node = {type: nodeType};
      node.text = ctx.getText();
      if (!parentNode.children)
        parentNode.children = [];
      parentNode.children.push(node);
      parentStack.push(node);
     // console.log(nodeType + ": " + ctx.getText());
    };
  }
  else if (p.startsWith('exit')) {
    TreePrinter.prototype[p] = function(ctx) {
      parentStack.pop();
    };
  }
};

var printer = new TreePrinter();
antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);
console.log(JSON.stringify(jsonRep, null, 2));
