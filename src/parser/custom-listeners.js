/**
 * Custom ANTLR4 listeners for FHIRPath parsing.
 * Provides error handling and AST construction for FHIRPath expressions.
 */

const antlr4 = require("./antlr4-index");
const Listener = require("./generated/FHIRPathListener");
const Parser = require("./generated/FHIRPathParser");

/**
 * ErrorListener collects syntax errors during parsing.
 * @class
 * @extends antlr4.error.ErrorListener
 */
class ErrorListener extends antlr4.error.ErrorListener {
  /**
   * @param {Array} errors - Array to store error details.
   */
  constructor(errors) {
    super();
    this.errors = errors;
  }

  /**
   * Called on syntax error.
   * @param {*} rec - Recognizer
   * @param {*} sym - Offending symbol
   * @param {number} line - Line number
   * @param {number} col - Column number
   * @param {string} msg - Error message
   * @param {*} e - Exception
   */
  syntaxError(rec, sym, line, col, msg, e) {
    this.errors.push([rec, sym, line, col, msg, e]);
  }
}

/**
 * PathListener builds an AST for FHIRPath expressions.
 * @class
 * @extends Listener
 */
class PathListener extends Listener {
  /**
   * Initializes AST and parent stack.
   */
  constructor() {
    super();
    this.ast = { type: "EntireExpression", children: [] };
    this.parentStack = [this.ast];
  }

  /**
   * Returns the constructed AST.
   * @returns {Object} AST root node.
   */
  getAST() {
    return this.ast;
  }

  /**
   * Creates and adds a new abstract syntax tree (AST) node to the list of child
   * nodes of a previously created parent AST node.
   * Marks MemberInvocation nodes that appear at the root level of
   * an InvocationTerm to enable proper type-based filtering during evaluation.
   *
   * @param {Object} ctx - ANTLR context.
   * @param {string} nodeType - The type of node being entered (e.g.,
   *  'MemberInvocation', 'InvocationTerm').
   * @returns {Object} The new AST node.
   *
   * @example
   * // When parsing "Observation.code", the MemberInvocation for "Observation"
   * // will be marked with atRoot: 1
   * // When parsing "select(Coding.code)", the MemberInvocation for "Coding"
   * // will be marked with atRoot: 2
   */
  enterNode(ctx, nodeType) {
    let parentNode = this.parentStack[this.parentStack.length - 1];
    let node = { type: nodeType };
    // Mark MemberInvocation nodes at the root level of an InvocationTerm.
    // This enables type-based filtering when the invocation starts with a type name
    // (e.g., "Observation.code" or "Coding.code").
    if (parentNode?.type === 'InvocationTerm' && nodeType === 'MemberInvocation') {
      // atRoot = 1: MemberInvocation is outside any function ParamList
      //             (e.g., "Observation.code" at the top level)
      // atRoot = 2: MemberInvocation is inside a function ParamList
      //             (e.g., "select(Coding.code)")
      node.atRoot = this.parentStack.find(item => item.type === 'ParamList') ? 2 : 1;
    }
    if (!parentNode.children)
      parentNode.children = [];
    parentNode.children.push(node);
    this.parentStack.push(node);
    return node;
  }
}

// Assign handlers for all Listener methods
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
        /**
         * Handles operator nodes, capturing operator symbol and position.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          const opSymbol = ctx.children[1].symbol;
          node.text = opSymbol.text;
          // position information is for the operator itself, not its arguments
          node.start = { line: opSymbol.line, column: opSymbol.column + 1 };
          node.length = opSymbol.text.length;
        };
        break;

      case "enterPolarityExpression":
        /**
         * Handles polarity operator nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          const pSymbol = ctx.children[0].symbol;
          node.text = pSymbol.text;
          // position information is just the polarity operator, not the argument too
          node.start = { line: pSymbol.line, column: pSymbol.column + 1 };
          node.length = pSymbol.text.length;
        };
        break;

      case "enterMemberInvocation":
        /**
         * Handles member invocation nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          const mSymbol = ctx.children[0].children[0].symbol;
          node.text = mSymbol.text;
          // this is the argument (excluding the `.` if it was present)
          // if is a delimited argument, it also includes the delimiters
          node.start = { line: mSymbol.line, column: mSymbol.column + 1 };
          node.length = node.text.length;
        };
        break;

      case "enterSortDirectionArgument":
        /**
         * Handles sort direction argument nodes, capturing the optional asc/desc direction.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          // ctx.children[0] is the expression, ctx.children[1] (if present) is 'asc' or 'desc'
          if (ctx.children.length > 1 && ctx.children[1].symbol) {
            node.direction = ctx.children[1].symbol.text;
          }
        };
        break;

      case "enterFunctn":
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          const fSymbol = ctx.children[0];
          node.text = fSymbol.getText();
        };
        break;

      case "enterFunctionInvocation":
        /**
         * Handles function invocation nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          const fSymbol = ctx.children[0].children[0];
          node.text = fSymbol.getText();
          // this is the function name (excluding the `.` if it was present, and excluding the () and arguments)
          if (fSymbol.start) {
            node.start = { line: fSymbol.start.line, column: fSymbol.start.column + 1 };
          }
          else if (fSymbol.symbol) {
            // the introduction of the `sort` function creates a new path for this
            node.start = { line: fSymbol.symbol.line, column: fSymbol.symbol.column + 1 };
          }
          node.length = node.text.length;
        };
        break;

      case "enterThisInvocation":
        /**
         * Handles $this invocation nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
          node.length = 5; // "$this".length
        };
        break;

      case "enterIndexInvocation":
        /**
         * Handles $index invocation nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
          node.length = 6; // "$index".length
        };
        break;

      case "enterTotalInvocation":
        /**
         * Handles $total invocation nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
          node.length = 6; // "$total".length
        };
        break;

      case "enterIdentifier":
      case "enterLiteralTerm":
        /**
         * Handles identifier and literal term nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          node.text = ctx.getText();
          node.start = { line: ctx.start.line, column: ctx.start.column + 1 };
          node.length = node.text.length;
        };
        break;

      case "enterIndexerExpression":
        /**
         * Handles indexer expression nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
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

      case "enterBooleanLiteral":
      case "enterStringLiteral":
      case "enterNumberLiteral":
      case "enterLongNumberLiteral":
      case "enterDateLiteral":
      case "enterDateTimeLiteral":
      case "enterTimeLiteral":
      case "enterTypeSpecifier":
        /**
         * Handles literal nodes (boolean, string, number, date, etc.).
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
          // All the literal texts
          node.text = ctx.getText();
          // don't capture the position information, as that's captured at the enterLiteralTerm level
        };
        break;

      case "enterQuantityLiteral":
        /**
         * Handles quantity literal nodes.
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
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
        /**
         * Handles external constant term nodes (e.g. %identifier or %'string').
         */
        PathListener.prototype[p] = function (ctx) {
          let node = this.enterNode(ctx, nodeType);
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
              // e.g. %v (simple identifier)
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
        /**
         * Default handler for enter methods without special processing.
         */
        PathListener.prototype[p] = function (ctx) {
          this.enterNode(ctx, nodeType);
        };
        break;
    }
  }
  else if (p.startsWith("exit")) {
    switch (p) {
      case "exitTermExpression":
        /**
         * Handles exit for term expressions, capturing text for function arguments.
         */
        PathListener.prototype[p] = function (ctx) {
          let parent = this.parentStack.pop();
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
        /**
         * Handles exit for invocation expressions, capturing text for function arguments.
         */
        PathListener.prototype[p] = function (ctx) {
          let parent = this.parentStack.pop();
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
        /**
         * Default handler for exit methods, pops parent stack.
         */
        PathListener.prototype[p] = function () {
          this.parentStack.pop();
        };
        break;
    }
  }
}

/**
 * Exports ErrorListener and PathListener classes.
 */
module.exports = {
  ErrorListener,
  PathListener
};
