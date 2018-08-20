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
var util = require("./utilities");

let engine = {}; // the object with all FHIRPath functions and operations

engine.isEmpty = function(x){
  return Array.isArray(x) && x.length == 0;
};

engine.isSome = function(x){
  return x !== null && x !== undefined && !engine.isEmpty(x);
};

engine.isCapitalized = function(x){
  return x && (x[0] === x[0].toUpperCase());
};

engine.flatten = function(x){
  return x.reduce(function(acc, x) {
    if(Array.isArray(x)){
      // todo replace with array modification
      acc = acc.concat(x);
    } else {
      acc.push(x);
    }
    return acc;
  }, []);
};

engine.arraify = function(x){
  if(Array.isArray(x)){ return x; }
  if(engine.isSome(x)){ return [x]; }
  return [];
};

engine.InvocationExpression = function(ctx, parentData, node) {
  return node.children.reduce(function(acc, ch) {
    return engine.doEval(ctx, acc, ch);
  }, parentData);
};

engine.TermExpression = function(ctx, parentData, node) {
  return engine.doEval(ctx,parentData, node.children[0]);
};

engine.LiteralTerm = function(ctx, parentData, node) {
  var term = node.children[0];
  if(term){
    return engine.doEval(ctx, parentData, term);
  } else {
    return [node.text];
  }
};

engine.StringLiteral = function(ctx, parentData, node) {
  return [node.text.replace(/(^['"]|['"]$)/g, "")];
};

engine.BooleanLiteral = function(ctx, parentData, node) {
  if(node.text  === "true") {
    return [true];
  } else {
    return [false];
  }
};


engine.NumberLiteral = function(ctx, parentData, node) {
  return [Number(node.text)];
};

engine.Identifier = function(ctx, parentData, node) {
  return [node.text.replace(/(^"|"$)/g, "")];
};

engine.InvocationTerm = function(ctx, parentData, node) {
  return engine.doEval(ctx,parentData, node.children[0]);
};

engine.MemberInvocation = function(ctx, parentData ,node ) {
  const key = engine.doEval(ctx, parentData, node.children[0])[0];

  if (parentData) {
    if(engine.isCapitalized(key)) {
      return parentData.filter(function(x) { return x.resourceType === key; });
    } else {
      return parentData.reduce(function(acc, res) {
        var toAdd = res[key];
        if(engine.isSome(toAdd)) {
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
    }
  } else {
    return [];
  }
};

engine.IndexerExpression = function(ctx, parentData, node) {
  const coll_node = node.children[0];
  const idx_node = node.children[1];
  var coll = engine.doEval(ctx, parentData, coll_node);
  var idx = engine.doEval(ctx, parentData, idx_node);

  if(engine.isEmpty(idx)) {
    return [];
  }

  var idxNum = parseInt(idx[0]);
  if(coll && engine.isSome(idxNum) && coll.length>idxNum && idxNum>=0) {
    return [coll[idxNum]];
  } else {
    return [];
  }
};

engine.Functn = function(ctx, parentData, node) {
  return node.children.map(function(x) {
    return engine.doEval(ctx, parentData, x);
  });
};


engine.whereMacro = function(ctx, parentData, node) {
  if(parentData !== false && ! parentData) { return []; }
  // lambda means branch of not evaluated AST
  // for example an EqualityExpression.
  var lambda = node[0].children[0];

  return engine.flatten(parentData.filter(function(x) {
    return engine.doEval(ctx, [x], lambda)[0];
  }));
};

engine.selectMacro = function(ctx, parentData, node) {
  if(parentData !== false && ! parentData) { return []; }

  var lambda = node[0].children[0];

  return engine.flatten(parentData.map(function(x) {
    return engine.doEval(ctx, [x], lambda);
  }));
};

engine.repeatMacro = function(ctx, parentData, node) {
  if(parentData !== false && ! parentData) { return []; }

  var lambda = node[0].children[0];
  var res = [];
  var items = parentData;

  var next = null;
  var lres = null;
  while (items.length != 0) {
    next = items.shift();
    lres = engine.flatten(engine.doEval(ctx, [next], lambda));
    if(lres){
      res = res.concat(lres);
      items = items.concat(lres);
    }
  }
  return res;
};

engine.iifMacro = function(ctx, parentData, node) {

  var exprs = node[0].children;
  var cond = exprs[0];
  var succ = exprs[1];
  var fail = exprs[2];

  var res = engine.flatten(engine.doEval(ctx, parentData, cond));
  if(res[0]){
    return engine.doEval(ctx, parentData, succ);
  } else {
    return engine.doEval(ctx, parentData, fail);
  }
};


engine.macroTable = {
  where: engine.whereMacro,
  select: engine.selectMacro,
  repeat: engine.repeatMacro,
  iif: engine.iifMacro
};


engine.countFn = function(x) {
  if (x && x.length) {
    return [x.length];
  } else {
    return [0];
  }
};

engine.traceFn = function(x, label) {
  console.log("TRACE:[" + (label || "") + "]", JSON.stringify(x, null, " "));
  return x;
};


//TODO: behavior on object?
engine.singleFn = function(x) {
  if (x && x.length) {
    if(x.length == 1){
      return [x[0]];
    } else if (x.length == 0) {
      return [];
    } else {
      return {$status: "error", $error: "Expected single"};
    }
  } else {
    return [];
  }
};


engine.firstFn = function(x) {
  if(engine.isSome(x)){
    if(x.length){
      return [x[0]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

engine.lastFn = function(x) {
  if(engine.isSome(x)){
    if(x.length){
      return [x[x.length - 1]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

engine.tailFn = function(x) {
  if(engine.isSome(x)){
    if(x.length){
      return x.slice(1, x.length);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

engine.takeFn = function(x, n) {
  if(engine.isSome(x)){
    if(x.length){
      return x.slice(0, n);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

engine.skipFn = function(x, num) {
  if(Array.isArray(x)){
    if(x.length >= num){
      return x.slice(num, x.length);
    } else {
      return [];
    }
  } else {
    return [];
  }
};

engine.fnTable = {
  empty: engine.emptyFn,
  count: engine.countFn,
  single: engine.singleFn,
  first: engine.firstFn,
  last: engine.lastFn,
  tail: engine.tailFn,
  take: engine.takeFn,
  skip: engine.skipFn,
  trace: engine.traceFn
};

engine.realizeParams = function(ctx, parentData, args) {
  if(args && args[0] && args[0].children) {
    return args[0].children.map(function(x) {
      return engine.doEval(ctx, parentData, x);
    });
  } else {
    return [];
  }
};

engine.FunctionInvocation = function(ctx, parentData, node) {
  var args = engine.doEval(ctx, parentData, node.children[0]);
  const fnName = args[0];
  args.shift();
  var macro = engine.macroTable[fnName];
  if(macro){
    return macro(ctx, parentData, args);
  } else {
    var fn = engine.fnTable[fnName];
    if(fn){
      var params = engine.realizeParams(ctx, parentData, args);
      params.unshift(parentData);
      return fn.apply(ctx, params);
    } else {
      throw new Error("No function [" + fnName + "] defined ");
    }
  }
};

engine.ParamList = function(ctx, parentData, node) {
  // we do not eval param list because sometimes it should be passed as
  // lambda/macro (for example in case of where(...)
  return node;
};

engine.doCompare = function(x,y){
  let rtn = x.length === y.length;
  for (let i=0, len=x.length; rtn && i<len; ++i)
    rtn = x[i] == y[i];
  return [rtn];
};

engine.EqualityExpression = function(ctx, parentData, node) {
  var left = engine.doEval(ctx, parentData, node.children[0]);
  var right = engine.doEval(ctx, parentData, node.children[1]);
  return engine.doCompare(left, right);
};

engine.InequalityExpression = function(ctx, parentData, node) {
  var left = engine.doEval(ctx, parentData, node.children[0]);
  var right = engine.doEval(ctx, parentData, node.children[1]);
  let rtn;
  if (!left.length || ! right.length)
    rtn = [];
  else  {
    util.assertAtMostOne(left, "InequalityExpression");
    util.assertAtMostOne(right, "InequalityExpression");
    left = left[0];
    right = right[0];
    let lType = typeof left;
    let rType = typeof right;
    if (lType != rType) {
      util.raiseError('Type of "'+left+'" did not match type of "'+right+'"',
        'InequalityExpression');
    }
    // TBD - Check types are "string", "number", or "Date".
    let operator = node.terminalNodeText[0];
    switch (operator) {
    case '<':
      rtn = [left < right];
      break;
    case '>':
      rtn = [left > right];
      break;
    case '<=':
      rtn = [left <= right];
      break;
    case '>=':
      rtn = [left >= right];
      break;
    default:
      util.raiseError('Invalid operator "'+operator+'"', 'InequalityExpression');
    }
  }
  return rtn;
};

engine.UnionExpression = function(ctx, parentData, node) {
  var left = engine.doEval(ctx, parentData, node.children[0]);
  var right = engine.doEval(ctx, parentData, node.children[1]);
  return left.concat(right);
};

engine.ThisInvocation = function(ctx, parentData) {
  // Assumption:  parentData is set to the current node for $this.
  return [parentData[0]];
};

engine.evalTable = {
  BooleanLiteral: engine.BooleanLiteral,
  EqualityExpression: engine.EqualityExpression,
  FunctionInvocation: engine.FunctionInvocation,
  Functn: engine.Functn,
  Identifier: engine.Identifier,
  IndexerExpression: engine.IndexerExpression,
  InequalityExpression: engine.InequalityExpression,
  InvocationExpression: engine.InvocationExpression,
  InvocationTerm: engine.InvocationTerm,
  LiteralTerm: engine.LiteralTerm,
  MemberInvocation: engine.MemberInvocation,
  NumberLiteral: engine.NumberLiteral,
  ParamList: engine.ParamList,
  StringLiteral: engine.StringLiteral,
  TermExpression: engine.TermExpression,
  ThisInvocation: engine.ThisInvocation,
  UnionExpression: engine.UnionExpression,
};

require("./existence")(engine);
require("./math")(engine);

engine.doEval = function(ctx, parentData, node) {
  const evaluator = engine.evalTable[node.type];
  if(evaluator){
    return evaluator.call(engine, ctx, parentData, node);
  } else {
    throw new Error("No " + node.type + " evaluator ");
  }
};

/**
 * @param {(object|object[])} resource -  FHIR resource, bundle as js object or array of resources
 * @param {string} path - fhirpath expression, sample 'Patient.name.given'
 */
var evaluate = function(resource, path) {
  const node = parser.parse(path);
  return engine.doEval({}, engine.arraify(resource), node.children[0]);
};

var parse = function(path) {
  return parser.parse(path);
};


var compile = function(path) {
  console.log("Compile " + path);
  return function(resource) {
    return resource;
  };
};

module.exports = {
  parse: parse,
  compile: compile,
  evaluate: evaluate
};
