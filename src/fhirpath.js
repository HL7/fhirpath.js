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
const util = require("./utilities");

let engine = {}; // the object with all FHIRPath functions and operations
let existence = require("./existence");
let filtering = require("./filtering");
let misc = require("./misc");

engine.invocationTable = {
  empty:        {fn: existence.emptyFn},
  not:          {fn: existence.notFn},
  exists:       {fn: existence.existsMacro, arity: {0: [], 1: ["Expr"]}},
  all:          {fn: existence.allMacro, arity: {1: ["Expr"]}},
  allTrue:      {fn: existence.allTrueFn},
  anyTrue:      {fn: existence.anyTrueFn},
  allFalse:     {fn: existence.allFalseFn},
  anyFalse:     {fn: existence.anyFalseFn},
  subsetOf:     {fn: existence.subsetOfFn, arity: {1: ["Any"]}},
  supersetOf:   {fn: existence.supersetOfFn, arity: {1: ["Any"]}},
  isDistinct:   {fn: existence.isDistinctFn},
  distinct:     {fn: existence.distinctFn},
  count:        {fn: existence.countFn},
  where:        {fn: filtering.whereMacro, arity: {1: ["Expr"]}},
  select:       {fn: filtering.selectMacro, arity: {1: ["Expr"]}},
  repeat:       {fn: filtering.repeatMacro, arity: {1: ["Expr"]}},
  single:       {fn: filtering.singleFn},
  first:        {fn: filtering.firstFn},
  last:         {fn: filtering.lastFn},
  tail:         {fn: filtering.tailFn},
  take:         {fn: filtering.takeFn, arity: {1: ["Integer"]}},
  skip:         {fn: filtering.skipFn, arity: {1: ["Integer"]}},
  iif:          {fn: misc.iifMacro,    arity: {3: ["Expr", "Expr", "Expr"]}},
  trace:        {fn: misc.traceFn,     arity: {0: [], 1: ["String"]}}
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
    if(util.isCapitalized(key)) {
      return parentData.filter(function(x) { return x.resourceType === key; });
    } else {
      return parentData.reduce(function(acc, res) {
        var toAdd = res[key];
        if(util.isSome(toAdd)) {
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

  if(util.isEmpty(idx)) {
    return [];
  }

  var idxNum = parseInt(idx[0]);
  if(coll && util.isSome(idxNum) && coll.length>idxNum && idxNum>=0) {
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


engine.macroTable = {};
engine.fnTable = {};

// TODO: this is new table

engine.realizeParams = function(ctx, parentData, args) {
  if(args && args[0] && args[0].children) {
    return args[0].children.map(function(x) {
      return engine.doEval(ctx, parentData, x);
    });
  } else {
    return [];
  }
};

const paramTable = {
  "Any": function(ctx, parentData, type, param){
    return engine.doEval(ctx, ctx.dataRoot, param);
  },
  "Integer": function(ctx, parentData, type, param){
    var res = engine.doEval(ctx, ctx.dataRoot, param);
    // TODO: check type
    return res[0];
  },
  "String": function(ctx, parentData, type, param){
    var res = engine.doEval(ctx, ctx.dataRoot, param);
    // TODO: check type
    return res[0];
  },
  "Expr": function(ctx, parentData, type, param){
    return function(data) {
      return engine.doEval(ctx, util.arraify(data), param); 
    };
  }
};

function makeParam(ctx, parentData, type, param) {
  var maker = paramTable[type];
  if(maker){
    return maker(ctx, parentData, type, param);
  } else {
    console.error(type, param);
    throw new Error("IMPL me for " + type);
  }
}

engine.FunctionInvocation = function(ctx, parentData, node) {
  var args = engine.doEval(ctx, parentData, node.children[0]);

  const fnName = args[0];
  args.shift();
  var invoc = engine.invocationTable[fnName];
  if(invoc) {
    var rawParams = args && args[0] && args[0].children;
    if(!invoc.arity){
      if(!rawParams){
        if(invoc.propogateEmpty && parentData.length == 0){
          return [];
        } else {
          return invoc.fn.call(ctx, util.arraify(parentData));
        }
      } else {
        throw new Error(fnName + " expects no params");
      }
    } else {
      var paramsNumber = rawParams ? rawParams.length : 0;
      var argTypes = invoc.arity[paramsNumber];
      if(argTypes){
        var params = [];
        for(var i = 0; i < paramsNumber; i++){
          var tp = argTypes[i];
          var pr = rawParams[i];
          params.push(makeParam(ctx, parentData, tp, pr));
        }
        params.unshift(parentData);
        return invoc.fn.apply(ctx, params);
      } else {
        console.log(fnName + " wrong arity");
        return [];
      }
    }
  } else {
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
  }
};

engine.ParamList = function(ctx, parentData, node) {
  // we do not eval param list because sometimes it should be passed as
  // lambda/macro (for example in case of where(...)
  return node;
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

require("./math")(engine);
require("./equality")(engine);

engine.doEval = function(ctx, parentData, node) {
  const evaluator = engine.evalTable[node.type];
  if(evaluator){
    return evaluator.call(engine, ctx, parentData, node);
  } else {
    throw new Error("No " + node.type + " evaluator ");
  }
};

var parse = function(path) {
  return parser.parse(path);
};


/**
 *  Applies the given parsed FHIRPath expression to the given resource,
 *  returning the result of doEval.
 */
function applyParsedPath(resource, parsedPath) {
  let dataRoot = util.arraify(resource);
  return engine.doEval({dataRoot: dataRoot}, dataRoot, parsedPath.children[0]);
}

/**
 * @param {(object|object[])} resource -  FHIR resource, bundle as js object or array of resources
 * @param {string} path - fhirpath expression, sample 'Patient.name.given'
 */
var evaluate = function(resource, path) {
  const node = parser.parse(path);
  return applyParsedPath(resource, node);
};

/**
 *  Returns a function that takes a resource and returns the result of
 *  evaluating the given FHIRPath expression on that resource.  The advantage
 *  of this function over "evaluate" is that if you have multiple resources,
 *  the given FHIRPath expression will only be parsed once.
 * @param path the FHIRPath expression to be parsed.
 */
var compile = function(path) {
  const node = parse(path);
  return function(resource) {
    return applyParsedPath(resource, node);
  };
};

module.exports = {
  parse: parse,
  compile: compile,
  evaluate: evaluate
};
