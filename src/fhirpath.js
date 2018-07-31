// This is fhirpath interpreter
// everything starts at evaluate function,
// which is passed  fhirpath AST and resource.
//
// We reduce/eval recursively each node in AST
// passing the context and current data
//
// each AST node has eval function, which should be registered in evalTable
// and named after node type
// if node needs to eval father it's children it has to call `doEval` function
//
// For FunctionInvocation node there is two lookup tables - fnTable & macroTable
// difference between fn and macro - should we eval argument or pass AST.
// in case of function: we eval args and pass to function with current data 
// in case of macro (like where or select): we pass expression (lambda), which should
// be evaluated inside macro

const parser = require("./parser");

function isEmpty(x){
  return Array.isArray(x) && x.length == 0;
}

function isSome(x){
  return x !== null && x !== undefined && !isEmpty(x);
}

function isCapitalized(x){
  return x && (x[0] === x[0].toUpperCase());
}

function flatten(x){
  return x.reduce((acc, x)=> {
    if(Array.isArray(x)){
      // todo replace with array modification
      acc = acc.concat(x);
    } else {
      acc.push(x);
    }
    return acc;
  }, []);
}

function arraify(x){
  if(Array.isArray(x)){ return x; }
  if(isSome(x)){ return [x]; }
  return [];
}

var InvocationExpression = (ctx, result, expr)=> {
  return expr.children.reduce((acc, ch)=>{
    return doEval(ctx, acc, ch);
  }, result);
};

var TermExpression = (ctx, result, expr)=> {
  return doEval(ctx,result, expr.children[0]);
};

var LiteralTerm = (ctx, result, expr)=> {
  var term = expr.children[0];
  if(term){
    return doEval(ctx, result, term); 
  } else {
    return expr.text;
  }
};

var StringLiteral = (ctx, result, expr)=> {
  return expr.text.replace(/(^['"]|['"]$)/g, "");
};

var NumberLiteral = (ctx, result, expr)=> {
  return parseInt(expr.text);
};

var Identifier = (ctx, result, expr)=> {
  return expr.text.replace(/(^"|"$)/g, "");
};

var InvocationTerm = (ctx, result, expr)=> {
  return doEval(ctx,result, expr.children[0]);
};

var MemberInvocation = (ctx, result ,expr )=> {
  const key = doEval(ctx, result, expr.children[0]);

  if (result) {
    if(isCapitalized(key)) {
      if(Array.isArray(result)){
        return result.filter((x)=> { return x.resourceType === key; });
      } else {
        if(result.resourceType === key){
          return result;
        } else {
          return [];
        }
      }
    } else {
      if(result[key]) {
        return result[key];
      } else if (Array.isArray(result)) {
        return result.reduce((acc, res)=> {
          var toAdd = res[key];
          if(isSome(toAdd)) {
            if(Array.isArray(toAdd)) {
              // replace with array modification
              acc = acc.concat(toAdd);
            } else {
              acc.push(toAdd);
            }
            return acc;
          } else {
            return acc;
          }
        }, []);
      } else {
        return [];
      }
    }
  } else {
    return [];
  }
};

var IndexerExpression = (ctx, result, expr) => {
  const coll_expr = expr.children[0];
  const idx_expr = expr.children[1];
  var coll = doEval(ctx, result, coll_expr);
  var idx = doEval(ctx, result, idx_expr);
  idx = idx && parseInt(idx);

  if(coll) {
    return coll[idx] || [];
  } else {
    return []; 
  }
};

var Functn = (ctx, result, expr) => {
  return expr.children.map((x)=> {
    return doEval(ctx, result, x);
  });
};


var whereMacro = (ctx, result, expr) => {
  if(result !== false && ! result) { return []; }

  var lambda = expr[0].children[0];

  if(Array.isArray(result)){
    return flatten(result.filter((x)=> {
      var exprRes = doEval(ctx, x, lambda);
      return exprRes; 
    }));
  } else if (result) {
    if(doEval(ctx, result, lambda)) {
      return result;
    } else {
      return [];
    }
  }
  return result;
};

var selectMacro = (ctx, result, expr) => {
  if(result !== false && ! result) { return []; }

  var lambda = expr[0].children[0];

  return flatten(arraify(result).map((x)=> {
    return doEval(ctx, x, lambda);
  }));
};

var repeatMacro = (ctx, result, expr) => {
  if(result !== false && ! result) { return []; }

  var lambda = expr[0].children[0];
  var res = [];
  var items = arraify(result);

  var next = null;
  var lres = null;
  while (items.length != 0) {
    next = items.shift();
    lres = flatten(arraify(doEval(ctx, next, lambda)));
    if(lres){
      res = res.concat(lres);
      items = items.concat(lres);
    }
  }
  return res;
};

const macroTable = {
  where: whereMacro,
  select: selectMacro,
  repeat: repeatMacro
};


var existsFn  = (x) => {
  return isSome(x);
};

var emptyFn = (x) => {
  if(x){
    return x.length == 0;
  } else {
    if(isSome(x)){
      return false;
    } else {
      return true;
    }
  }
};

var countFn = (x)=>{
  if (x && x.length) {
    return x.length;
  } else {
    return 0;
  }
};

var traceFn = (x, label)=>{
  console.log("TRACE:[" + (label || "") + "]", JSON.stringify(x, null, " "));
  return x;
};


//TODO: behavior on object?
var singleFn = (x)=>{
  if (x && x.length) {
    if(x.length == 1){
      return x[0];
    } else if (x.length == 0) {
      return [];
    } else {
      return {$status: "error", $error: "Expected single"};
    }
  } else {
    return [];
  }
};


var firstFn = (x)=>{
  if(isSome(x)){
    if(x.length){
      return x[0];
    } else {
      return x;
    }
  } else {
    return [];
  }
};


var skipFn = (x, num)=>{
  if(Array.isArray(x)){
    if(x.length >= num){
      x.splice(0, num);
      return x;
    } else {
      return [];
    }
  } else {
    return [];
  }
};

const fnTable = {
  exists:  existsFn,
  empty: emptyFn,
  count: countFn,
  single: singleFn,
  first: firstFn,
  skip: skipFn,
  trace: traceFn
};

var realizeParams = (ctx, result, args) => {
  if(args && args[0] && args[0].children) {
    return args[0].children.map((x)=>{
      return doEval(ctx, result, x);
    });
  } else {
    return [];
  }
};

var FunctionInvocation = (ctx, result, expr) => {
  var args = doEval(ctx, result, expr.children[0]);
  const fnName = args[0];
  args.shift();
  var macro = macroTable[fnName];
  if(macro){
    return macro.call(this, ctx, result, args);
  } else {
    var fn = fnTable[fnName];
    if(fn){
      var params = realizeParams(ctx, result, args);
      params.unshift(result);
      return fn.apply(ctx, params); 
    } else {
      throw new Error("No function [" + fnName + "] defined ");
    }
  }
};

var ParamList = (ctx, result, expr) => {
  // we do not eval param list because sometimes it should be passed as
  // lambda/macro (for example in case of where(...)
  return expr;
};

function doCompare(x,y){
  // TODO: should be smart to compare list monads :0
  return x == y;
}

var EqualityExpression = (ctx, result, expr) => {
  var left = doEval(ctx, result, expr.children[0]);
  var right = doEval(ctx, result, expr.children[1]);
  return doCompare(left, right);
};

var UnionExpression = (ctx, result, expr) => {
  var left = doEval(ctx, result, expr.children[0]);
  var right = doEval(ctx, result, expr.children[1]);
  return arraify(left).concat(arraify(right));
};

const evalTable = {
  EqualityExpression: EqualityExpression,
  FunctionInvocation: FunctionInvocation,
  Functn: Functn,
  Identifier: Identifier,
  IndexerExpression: IndexerExpression,
  InvocationExpression: InvocationExpression,
  InvocationTerm: InvocationTerm,
  LiteralTerm: LiteralTerm,
  MemberInvocation: MemberInvocation,
  NumberLiteral: NumberLiteral,
  ParamList: ParamList,
  StringLiteral: StringLiteral,
  TermExpression: TermExpression,
  UnionExpression: UnionExpression
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
  const expr = parser.parse(path);
  return doEval({}, resource, expr.children[0]);
};

var compile = (path)=> {
  console.log("Compile " + path);
  return (resource)=>{
    return resource;
  };
};

module.exports = {
  parse: parser.parse,
  compile: compile,
  evaluate: evaluate
};
