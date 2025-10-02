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

var parse = function (path) {
  var chars = new antlr4.InputStream(path);
  var lexer = new Lexer(chars);

  var tokens = new antlr4.CommonTokenStream(lexer);


  var parser = new Parser(tokens);
  parser.buildParseTrees = true;
  var errors = [];
  var listener = new ErrorListener(errors);

  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  var tree = parser.entireExpression();

  class PathListener extends Listener {
    constructor() {
      super();
    }
  }

  var ast = { type: "EntireExpression", children: [] };
  var parentStack = [ast];
  function enterNode(ctx, nodeType) {
    let parentNode = parentStack[parentStack.length - 1];
    let node = { type: nodeType };
    if (!parentNode.children)
      parentNode.children = [];
    parentNode.children.push(node);
    parentStack.push(node);
    return node;
  }

  for (let p of Object.getOwnPropertyNames(Listener.prototype)) {
    if (p.startsWith("enter")) {
      const nodeType = p.slice(5); // remove "enter"
      
      // Register specific handlers for each enter method
      switch (p) {
        // Operators
        case "enterMultiplicativeExpression":
        case "enterAdditiveExpression":
        case "enterTypeExpression":
        case "enterUnionExpression":
        case "enterInequalityExpression":
        case "enterEqualityExpression":
        case "enterMembershipExpression":
        case "enterAndExpression":
        case "enterOrExpression":
        case "enterImpliesExpression":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const opSymbol = ctx.children[1].symbol;
            node.text = opSymbol.text;
            // position information is for the operator itself, not it's arguments
            node.start = { line: opSymbol.line, column: opSymbol.column + 1 };
            node.length = opSymbol.text.length;
          };
          break;

        case "enterPolarityExpression":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const pSymbol = ctx.children[0].symbol;
            node.text = pSymbol.text;
            // position information is just the polarity operator, not the argument too
            node.start = { line: pSymbol.line, column: pSymbol.column + 1 };
            node.length = pSymbol.text.length;
          };
          break;

        case "enterMemberInvocation":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const mSymbol = ctx.children[0].children[0].symbol;
            node.text = mSymbol.text;
            // this is the argument (excluding the `.` if it was present)
            // if is a delimited argument, it also includes the delimiters
            node.start = { line: mSymbol.line, column: mSymbol.column + 1 };
            node.length = node.text.length;
          };
          break;

        case "enterFunctionInvocation":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const fSymbol = ctx.children[0].children[0];
            node.text = fSymbol.getText();
            // this is the function name (excluding the `.` if it was present, and excluding the () and arguments)
            node.start = { line: fSymbol.start.line, column: fSymbol.start.column + 1 };
            node.length = node.text.length;
          };
          break;

        case "enterThisInvocation":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = 5; // "$this".length
          };
          break;

        case "enterIndexInvocation":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = 6; // "$index".length
          };
          break;

        case "enterTotalInvocation":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = 6; // "$total".length
          };
          break;

        case "enterIdentifier":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.text = ctx.getText();
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = node.text.length;
          };
          break;

        case "enterIndexerExpression":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const fLeftBraceSymbol = ctx.children[1].symbol;
            const fRightBraceSymbol = ctx.children[3].symbol;
            node.start = { line: fLeftBraceSymbol.line, column: fLeftBraceSymbol.column + 1 };
            if (fLeftBraceSymbol.line === fRightBraceSymbol.line) {
              node.length = fRightBraceSymbol.column - fLeftBraceSymbol.column + 1;
            } else {
              node.end = { line: fRightBraceSymbol.line, column: fRightBraceSymbol.column + 1 };
              node.length = fRightBraceSymbol.stop - fLeftBraceSymbol.start + 1;
            }
          };
          break;

        case "enterLiteralTerm":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.text = ctx.getText();
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = node.text.length;
          };
          break;

        case "enterBooleanLiteral":
        case "enterStringLiteral":
        case "enterNumberLiteral":
        case "enterLongNumberLiteral":
        case "enterDateLiteral":
        case "enterDateTimeLiteral":
        case "enterTimeLiteral":
        case "enterTypeSpecifier":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            // All the literal texts
            node.text = ctx.getText();
            // don't capture the position information, as that's captured at the enterLiteralTerm level
          };
          break;

        case "enterQuantityLiteral":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            node.text = ctx.getText();
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = node.text.length;

            // NUMBER unit? (unit is optional)
            const qtyContext = ctx.children[0];
            node.value = qtyContext.children[0].getText();
            const unitContext = qtyContext.children ? qtyContext.children[1] : null;
            if (unitContext) {
              node.unit = unitContext.getText();
            }
          };
          break;

        case "enterExternalConstantTerm":
          PathListener.prototype[p] = function (ctx) {
            let node = enterNode(ctx, nodeType);
            const extConstContext = ctx.children[0];
            // first child is the TerminalNode for the '%'
            const valueContext = extConstContext.children[1];
            if (valueContext.ruleIndex === Parser.RULE_identifier) {
              // this is an identifier
              // it has children of several types
              const idTerminalNode = valueContext.children[0];
              const idSymbol = idTerminalNode.symbol;
              if (idSymbol.type === Parser.DELIMITEDIDENTIFIER) {
                // need to strip the delimiters
                // e.g. %`v` (back ticks)
                node.delimitedText = idSymbol.text.slice(1, -1);
              }
              else if (idSymbol.type === Parser.IDENTIFIER) {
                // e.g. %v
                node.text = idSymbol.text;
              }
              else {
                // this is one of the other keywords, which is just use the symbol text
                // eg. %v (simple identifier)
                node.text = idSymbol.text;
              }
            }
            if (valueContext.ruleIndex === undefined) {
              // this is a string, eg %'v' (single quotes)
              const idSymbol = valueContext.symbol;
              if (idSymbol.type === Parser.STRING) {
                node.delimitedText = idSymbol.text;
              }
            }
            // '%' ( identifier | STRING)
            //       IDENTIFIER | DELIMITEDIDENTIFIER | 'as' | 'contains' | 'in' | 'is'
            node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
            node.length = node.text?.length ?? node.delimitedText?.length;
          };
          break;

        default:
          // Default handler for enter methods without special processing
          PathListener.prototype[p] = function (ctx) {
            enterNode(ctx, nodeType);
          };
          break;
      }
    }
    else if (p.startsWith("exit")) {
      switch (p) {
        case "exitTermExpression":
          PathListener.prototype[p] = function (ctx) {
            let parent = parentStack.pop();
            // special case handling for functions that use the argument as a type, not a value
            // need to read out the text for them 
            // Note: doesn't handle the delimited text cases correctly in the engine later on
            if (parent && ctx.ruleIndex === Parser.RULE_expression) {
              if (ctx.parentCtx?.ruleIndex === Parser.RULE_paramList) {
                parent.text = ctx.getText();
              }
            }
          };
          break;
        case "exitInvocationExpression":
          PathListener.prototype[p] = function (ctx) {
            let parent = parentStack.pop();
            // special case handling for functions that use the argument as a type, not a value
            // need to read out the text for them 
            // Note: doesn't handle the delimited text cases correctly in the engine later on
            if (parent && ctx.ruleIndex === Parser.RULE_expression) {
              if (ctx.parentCtx?.ruleIndex === Parser.RULE_paramList) {
                if (parent.type === "InvocationExpression") {
                  parent.text = ctx.getText();
                }
              }
            }
          };
          break;
        default:
          PathListener.prototype[p] = function () {
            parentStack.pop();
          };
          break;
      }
    }
  }

  var printer = new PathListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);

  if (errors.length > 0) {
    let errMsgs = [];
    for (let i = 0, len = errors.length; i < len; ++i) {
      let err = errors[i];
      let msg = "line: " + err[2] + "; column: " + err[3] + "; message: " + err[4];
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
