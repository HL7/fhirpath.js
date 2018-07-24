const antlr4 = require('antlr4');

const  Lexer = require('../parser/generated/FHIRPathLexer').FHIRPathLexer;
const  Parser = require('../parser/generated/FHIRPathParser').FHIRPathParser;
const  Listener = require('../parser/generated/FHIRPathListener').FHIRPathListener;


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
  var errors = []
  var listener = new ErrorListener(errors);

  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  var tree = parser.expression();

    function PathListener() {
        Listener.call(this); // inherit default listener
        return this;
    };
    // inherit default listener
    PathListener.prototype = Object.create(Listener.prototype);
    PathListener.prototype.constructor = PathListener;

    var jsonRep = {}; // we'll build a JSON representation
    var node;
    var parentStack = [jsonRep];
    for (let p of Object.keys(Listener.prototype)) {
        if (p.startsWith('enter')) {
            PathListener.prototype[p] = function(ctx) {
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
            PathListener.prototype[p] = function(ctx) {
                parentStack.pop();
            };
        }
    };

    var printer = new PathListener();
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(printer, tree);

  if (errors.length > 0) {
    var e = new Error();
    e.errors = errors;
    throw e;
  }
  return jsonRep;
}

var InvocationExpression = (ctx, result, expr)=> {
    // console.log('InvocationExpression');
    return expr.children.reduce((acc, ch)=>{
        return doEval(ctx, acc, ch);
    }, result);
};

var TermExpression = (ctx, result, expr)=> {
    // console.log('TermExpression', expr);
    const resourceType = expr.text;
    if(expr.text === result.resourceType){
        return result;
    } else {
        return [];
    }
};

var MemberInvocation = (ctx, result ,expr )=> {
    // console.log('MemberInvocation', expr);
    const key = expr.text;

    if (result) {
        if(result[key]) {
            return result[key];
        } else if (Array.isArray(result)) {
            return result.reduce((acc, res)=> {
                if(res[key]) {
                    acc.push(res[key]);
                    return acc;
                } else {
                    return acc;
                }
            }, []);
        }
    } else {
        return null;
    }
};

const evalTable = {
    InvocationExpression: InvocationExpression,
    TermExpression: TermExpression,
    MemberInvocation: MemberInvocation
};

var doEval = (ctx, result, expr) => {
    const evaluator = evalTable[expr.type];
    if(evaluator){
       return evaluator(ctx, result, expr);
    } else {
        throw new Error("No " + expr.type + " evaluator ");
    }
};

var evaluate = (resource, path) => {
    const expr = parse(path);
    return doEval({}, resource, expr.children[0]);
};

var compile = (path)=> {
    return (resource)=>{};
};

module.exports = {
    parse: parse,
    compile: compile,
    evaluate: evaluate
};
