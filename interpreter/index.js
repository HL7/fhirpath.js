
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
    if (!this.parentStack.length && context.resourceNames.has(identifer) && ) {
      // Then we are at the root node in the tree, and this is a known resource
      // name.
      // Then this is an assertion that the root node is a resource of this
      // type.  Confirm.
      rtn = (this.data.resourceType == identifer) ? : this.data : [];
    }
    else {
      rtn =
    }
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
      let parentNode = this.getParent();;
      if (currentNode.type = "MemberInvocation") {
        console.log(currentNode.data);
        console.log("%%% currentNode.text = "+currentNode.text);
        let nodeResult = currentNode.data[currentNode.text];
        console.log("%%% nodeResult = "+nodeResult);
        if (!parentNode)
          this.result = nodeResult;
        else
          currentNode.result = nodeResult;
      }
    }
  }
};

module.exports = Interpreter;
