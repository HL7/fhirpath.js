
var parserClasses = require('../parser');
var antlr4 = require('antlr4/index');
/*
function Evaluator() {
   FHIRPathListener.call(this); // inherit default listener
   return this;
};
// inherit default listener
Evaluator.prototype = Object.create(FHIRPathListener.prototype);
Evaluator.prototype.constructor = Evaluator;
*/

let FHIRPathListener = parserClasses.FHIRPathListener;
class Interpreter extends FHIRPathListener {
  /**
   *  Contstructor.
   * @param context a hash of context information (enviroment variables, etc.)
   * @param data the data against which the FHIRPath expression is to be
   *  evaluated.
   * @param expression the expression to be evaluated against the data object.
   */
  constructor(context, data, expression) {
    super();
    this.context = context;
    this.data = data;
    this.expression = expression;
    this.result = null;
  }

  /**
   *  Interprets a FHIRPath expression against the given context and data node.
   * @param context a hash of context information (enviroment variables, etc.)
   * @param data the data against which the FHIRPath expression is to be
   *  evaluated.
   * @param expression the expression to be evaluated against the data object.
   */
  interpret() {
    this.parentStack = [];
    var chars = new antlr4.InputStream(this.expression);
    var lexer = new parserClasses.FHIRPathLexer(chars);
    var tokens  = new antlr4.CommonTokenStream(lexer);
    var parser = new parserClasses.FHIRPathParser(tokens);
    parser.buildParseTrees = true;
    var tree = parser.expression();
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, tree);
    return this.result;
  }


  /**
   *  Returns the topmost element of the parent node stack (without removing it)
   *  or null if there isn't one.
   */
  getParent() {
    return this.parentStack.length ?
      this.parentStack[this.parentStack.length - 1] : null;
  }


  /**
   *  Resolves the given indentier to a value, based on the context, data, and whether
   *  this is a root node.
   * @return an array of the the identifier's value(s), or an empty array if there are none.
   */
  resolveIndentifier(identifier) {
    var rtn = null;
    let parent = this.getParent();
    let data = parent ? parent.data : this.data;
    if (this.data === data  && this.context.resourceNames.has(identifier)) {
      // Then we are at the root node in the data tree, and this is a known resource
      // name.
      // Then this is an assertion that the root node is a resource of this
      // type.  Confirm.
      rtn = (this.data.resourceType == identifier) ? this.data : [];
    }
    else {
      rtn = data[identifier];
      if (rtn === undefined)
        rtn = [];
    }
    return rtn;
  }
}

for (let p of Object.keys(FHIRPathListener.prototype)) {
  if (p.startsWith('enter')) {
    Interpreter.prototype[p] = function(ctx) {
      let parentNode = this.getParent();
      let nodeType = p.slice(5); // remove "enter"
      node = {type: nodeType};
      node.text = ctx.getText();
      if (parentNode) {
        if (!parentNode.children)
          parentNode.children = [];
        parentNode.children.push(node);
        if (node.type == "MemberInvocation" && parentNode.type == "InvocationExpression") {
          // Use previous child's result as the data
          node.data = parentNode.children[0].result;
        }
        else
          node.data = parentNode.data;
      }
      else
        node.data = this.data;
      this.parentStack.push(node);
    };
  }
  else if (p.startsWith('exit')) {
    Interpreter.prototype[p] = function(ctx) {
      let currentNode = this.parentStack.pop();
      if (currentNode.type === "Identifier") {
        currentNode.result = this.resolveIndentifier(currentNode.text);
      }
      else {
        // For the other cases handled, the result is the last child node's result.
        let children = currentNode.children;
        if (children)
          currentNode.result = children[children.length - 1].result;
      }
      // If this is the top node, set the final result.
      if (this.parentStack.length == 0)
        this.result = currentNode.result;
    }
  }
};

module.exports = Interpreter;
