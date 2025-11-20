const antlr4 = require("./antlr4-index");
const Lexer = require("./generated/FHIRPathLexer");
const Parser = require("./generated/FHIRPathParser");
const { ErrorListener, PathListener } = require("./custom-listeners");


function parse(path) {
  const chars = new antlr4.InputStream(path);
  const lexer = new Lexer(chars);

  const tokens = new antlr4.CommonTokenStream(lexer);


  const parser = new Parser(tokens);
  parser.buildParseTrees = true;
  const errors = [];
  const listener = new ErrorListener(errors);

  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  const tree = parser.entireExpression();

  const printer = new PathListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);

  if (errors.length > 0) {
    let errMsgs = [];
    for (let i = 0, len = errors.length; i < len; ++i) {
      let err = errors[i];
      let msg = "line: " + err[2] + "; column: " + err[3] + "; message: " + err[4];
      errMsgs.push(msg);
    }
    const e = new Error(errMsgs.join("\n"));
    e.errors = errors;
    throw e;
  }
  return printer.getAST();
}


module.exports = {
  parse
};
