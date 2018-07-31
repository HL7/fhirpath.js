const antlr4 = require("antlr4");
const Lexer = require("./generated/FHIRPathLexer").FHIRPathLexer;
const Parser = require("./generated/FHIRPathParser").FHIRPathParser;
const Listener = require("./generated/FHIRPathListener").FHIRPathListener;


var ErrorListener = function(errors) {
  antlr4.error.ErrorListener.call(this);
  this.errors = errors;
  return this;
};

ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
ErrorListener.prototype.constructor = ErrorListener;
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
  this.errors.push([rec, sym, line, col, msg, e]);
};

var parse = function(path){
  var chars = new antlr4.InputStream(path);
  var lexer = new Lexer(chars);

  var tokens  = new antlr4.CommonTokenStream(lexer);


  var parser = new Parser(tokens);
  parser.buildParseTrees = true;
  var errors = [];
  var listener = new ErrorListener(errors);

  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  var tree = parser.expression();

  function PathListener() {
    Listener.call(this); // inherit default listener
    return this;
  }
  // inherit default listener
  PathListener.prototype = Object.create(Listener.prototype);
  PathListener.prototype.constructor = PathListener;

  var ast = {};
  var node;
  var parentStack = [ast];
  for (let p of Object.keys(Listener.prototype)) {
    if (p.startsWith("enter")) {
      PathListener.prototype[p] = function(ctx) {
        let parentNode = parentStack[parentStack.length - 1];
        let nodeType = p.slice(5); // remove "enter"
        node = {type: nodeType};
        node.text = ctx.getText();
        if (!parentNode.children)
          parentNode.children = [];
        parentNode.children.push(node);
        parentStack.push(node);
      };
    }
    else if (p.startsWith("exit")) {
      PathListener.prototype[p] = function() {
        parentStack.pop();
      };
    }
  }

  var printer = new PathListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);

  if (errors.length > 0) {
    var e = new Error();
    e.errors = errors;
    throw e;
  }
  return ast;
};


module.exports = {
  parse: parse
};
