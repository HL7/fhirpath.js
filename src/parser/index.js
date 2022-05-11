const antlr4 = require("./antlr4-index");
const Lexer = require("./generated/FHIRPathLexer");
const Parser = require("./generated/FHIRPathParser");
const Listener = require("./generated/FHIRPathListener");


class ErrorListener extends antlr4.error.ErrorListener {
  constructor(errors) {
    super();
    this.errors = errors;
  }
  syntaxError(rec, sym, line, col, msg, e) {
    this.errors.push([rec, sym, line, col, msg, e]);
  }
}

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

  var tree = parser.entireExpression();

  class PathListener extends Listener{
    constructor() {
      super();
    }
  }

  var ast = {};
  var node;
  var parentStack = [ast];
  for (let p of Object.getOwnPropertyNames(Listener.prototype)) {
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
        // Also collect this node's terminal nodes, if any.  Terminal nodes are
        // not walked with the rest of the tree, but include things like "+" and
        // "-", which we need.
        node.terminalNodeText = [];
        for (let c of ctx.children) {
          // Test for node type "TerminalNodeImpl".  Minimized code no longer
          // has the original function names, so we can't rely on
          // c.constructor.name.  It appears the TerminalNodeImpl is the only
          // node with a "symbol" property, so test for that.
          if (c.symbol)
            node.terminalNodeText.push(c.getText());
        }
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
    let errMsgs = [];
    for (let i=0, len=errors.length; i<len; ++i) {
      let err = errors[i];
      let msg = "line: "+err[2]+"; column: "+ err[3]+"; message: "+err[4];
      errMsgs.push(msg);
    }
    var e = new Error(errMsgs.join("\n"));
    e.errors = errors;
    throw e;
  }
  return ast;
};


module.exports = {
  parse: parse
};
