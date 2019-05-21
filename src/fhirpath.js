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
// most of nodes do function or operator invocation at the end
//
// For invocation's and operator's there is one lookup table -
// invocationTable and two helper functions doInvoke and infixInvoke for
// operators
// 1. operator or function is looked up in table
// 2. using signature (in  .arity property) unpack parameters
// 3. check params types
// 4. do call function
// 5. wrap result by util.arraify
//
// if function is nullable
// and one of parameters is empty/null - function will not be invoked and empty
// result returned
//
// Not solved problem is overloading functions by types - for example + operator defined
// for strings and numbers
// we can make dispatching params type dependent - let see

const parser = require("./parser");
const util = require("./utilities");

let engine    = {}; // the object with all FHIRPath functions and operations
let existence = require("./existence");
let filtering = require("./filtering");
let combining = require("./combining");
let misc      = require("./misc");
let equality  = require("./equality");
let collections  = require("./collections");
let math      = require("./math");
let strings   = require("./strings");
let navigation= require("./navigation");
let datetime  = require("./datetime");
let logic  = require("./logic");
let types = require("./types");
let FP_DateTime = types.FP_DateTime;
let FP_Time = types.FP_Time;
let FP_Quantity = types.FP_Quantity;

// * fn: handler
// * arity: is index map with type signature
//   if type is in array (like [Boolean]) - this means
//   function accepts value of this type or empty value {}
// * nullable - means propagate empty result, i.e. instead
//   calling function if one of params is  empty return empty

engine.invocationTable = {
  empty:        {fn: existence.emptyFn},
  not:          {fn: existence.notFn},
  exists:       {fn: existence.existsMacro, arity: {0: [], 1: ["Expr"]}},
  all:          {fn: existence.allMacro, arity: {1: ["Expr"]}},
  allTrue:      {fn: existence.allTrueFn},
  anyTrue:      {fn: existence.anyTrueFn},
  allFalse:     {fn: existence.allFalseFn},
  anyFalse:     {fn: existence.anyFalseFn},
  subsetOf:     {fn: existence.subsetOfFn, arity: {1: ["AnyAtRoot"]}},
  supersetOf:   {fn: existence.supersetOfFn, arity: {1: ["AnyAtRoot"]}},
  isDistinct:   {fn: existence.isDistinctFn},
  distinct:     {fn: existence.distinctFn},
  count:        {fn: existence.countFn},
  where:        {fn: filtering.whereMacro, arity: {1: ["Expr"]}},
  select:       {fn: filtering.selectMacro, arity: {1: ["Expr"]}},
  single:       {fn: filtering.singleFn},
  first:        {fn: filtering.firstFn},
  last:         {fn: filtering.lastFn},
  ofType:       {fn: filtering.ofTypeFn, arity: {1: ["Identifier"]}},
  tail:         {fn: filtering.tailFn},
  take:         {fn: filtering.takeFn, arity: {1: ["Integer"]}},
  skip:         {fn: filtering.skipFn, arity: {1: ["Integer"]}},
  combine:      {fn: combining.combineFn, arity: {1: ["AnyAtRoot"]}},
  iif:          {fn: misc.iifMacro,    arity: {3: ["Expr", "Expr", "Expr"]}},
  trace:        {fn: misc.traceFn,     arity: {0: [], 1: ["String"]}},
  toInteger:    {fn: misc.toInteger},
  toDecimal:    {fn: misc.toDecimal},
  toString:     {fn: misc.toString},
  toDateTime:   {fn: misc.toDateTime},
  toTime:       {fn: misc.toTime},

  indexOf:        {fn: strings.indexOf,          arity: {1: ["String"]}},
  substring:      {fn: strings.substring,        arity: {1: ["Integer"], 2: ["Integer","Integer"]}},
  startsWith:     {fn: strings.startsWith,       arity: {1: ["String"]}},
  endsWith:       {fn: strings.endsWith,         arity: {1: ["String"]}},
  contains:       {fn: strings.containsFn,       arity: {1: ["String"]}},
  replace:        {fn: strings.replace,          arity: {2: ["String", "String"]}},
  matches:        {fn: strings.matches,          arity: {1: ["String"]}},
  replaceMatches: {fn: strings.replaceMatches,   arity: {2: ["String", "String"]}},
  length:         {fn: strings.length },

  ln:             {fn: math.ln},
  log:            {fn: math.log, arity:  {1: ["Number"]}, nullable: true},

  now:            {fn: datetime.now },
  today:          {fn: datetime.today },

  repeat:          {fn: filtering.repeatMacro, arity: {1: ["Expr"]}},
  children:        {fn: navigation.children },
  descendants:     {fn: navigation.descendants },

  "|":          {fn: combining.unionOp,   arity: {2: ["Any", "Any"]}},
  "=":          {fn: equality.equal,   arity: {2: ["Any", "Any"]}, nullable: true},
  "!=":         {fn: equality.unequal,   arity: {2: ["Any", "Any"]}, nullable: true},
  "~":          {fn: equality.equival,   arity: {2: ["Any", "Any"]}},
  "!~":         {fn: equality.unequival,   arity: {2: ["Any", "Any"]}},
  "<":          {fn: equality.lt,   arity: {2: ["Any", "Any"]}, nullable: true},
  ">":          {fn: equality.gt,   arity: {2: ["Any", "Any"]}, nullable: true},
  "<=":         {fn: equality.lte,  arity: {2: ["Any", "Any"]}, nullable: true},
  ">=":         {fn: equality.gte,  arity: {2: ["Any", "Any"]}, nullable: true},
  "containsOp": {fn: collections.contains,   arity: {2: ["Any", "Any"]}},
  "inOp":       {fn: collections.in,  arity: {2: ["Any", "Any"]}},
  "&":          {fn: math.amp,     arity:  {2: ["String", "String"]}},
  "+":          {fn: math.plus,    arity:  {2: ["Any", "Any"]}, nullable: true},
  "-":          {fn: math.minus,   arity:  {2: ["Number", "Number"]}, nullable: true},
  "*":          {fn: math.mul,     arity:  {2: ["Number", "Number"]}, nullable: true},
  "/":          {fn: math.div,     arity:  {2: ["Number", "Number"]}, nullable: true},
  "mod":        {fn: math.mod,     arity:  {2: ["Number", "Number"]}, nullable: true},
  "div":        {fn: math.intdiv,  arity:  {2: ["Number", "Number"]}, nullable: true},

  "or":        {fn: logic.orOp,  arity:       {2: [["Boolean"], ["Boolean"]]}},
  "and":       {fn: logic.andOp,  arity:      {2: [["Boolean"], ["Boolean"]]}},
  "xor":       {fn: logic.xorOp,  arity:      {2: [["Boolean"], ["Boolean"]]}},
  "implies":   {fn: logic.impliesOp,  arity:  {2: [["Boolean"], ["Boolean"]]}},
};

engine.InvocationExpression = function(ctx, parentData, node) {
  return node.children.reduce(function(acc, ch) {
    return engine.doEval(ctx, acc, ch);
  }, parentData);
};

engine.TermExpression = function(ctx, parentData, node) {
  return engine.doEval(ctx,parentData, node.children[0]);
};

engine.ExternalConstantTerm = function(ctx, parentData, node) {
  var extConstant = node.children[0];
  var identifier = extConstant.children[0];
  var varName = engine.Identifier(ctx, parentData, identifier)[0];
  var value = ctx.vars[varName];
  // For convenience, we all variable values to be passed in without their array
  // wrapper.  However, when evaluating, we need to put the array back in.
  return value === undefined ? [] : value instanceof Array ? value : [value];
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
  // Remove the beginning and ending quotes.
  var rtn = node.text.replace(/(^['"]|['"]$)/g, "");
  rtn = rtn.replace(/\\(u\d{4}|.)/g, function(match, submatch) {
    switch(match) {
      case "\\'":
        return "'";
      case '\\"':
        return '"';
      case '\\r':
        return '\r';
      case '\\n':
        return "\n";
      case '\\t':
        return '\t';
      case '\\f':
        return '\f';
      case '\\\\':
        return '\\';
      default:
        if (submatch.length > 1)
          return String.fromCharCode('0x'+submatch.slice(1));
        else
          return submatch;
    }
  });
  return [rtn];
};

engine.BooleanLiteral = function(ctx, parentData, node) {
  if(node.text  === "true") {
    return [true];
  } else {
    return [false];
  }
};

engine.QuantityLiteral = function(ctx, parentData, node) {
  var valueNode = node.children[0];
  var value = valueNode.terminalNodeText
  var unit = valueNode.children[0].terminalNodeText
  return [new FP_Quantity(value, unit)];
};

engine.DateTimeLiteral = function(ctx, parentData, node) {
  var dateStr = node.text.slice(1); // Remove the @
  return [new FP_DateTime(dateStr)];
};

engine.TimeLiteral = function(ctx, parentData, node) {
  var timeStr = node.text.slice(1); // Remove the @
  return [new FP_Time(timeStr)];
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
  "Integer": function(val){
    if(typeof val !== "number" || !Number.isInteger(val)){
      throw new Error("Expected integer, got: " + JSON.stringify(val));
    }
    return val;
  },
  "Boolean": function(val){
    if(val === true || val === false){
      return val;
    }
    throw new Error("Expected boolean, got: " + JSON.stringify(val));
  },
  "Number": function(val){
    if(typeof val !== "number"){
      throw new Error("Expected number, got: " + JSON.stringify(val));
    }
    return val;
  },
  "String": function(val){
    if(typeof val !== "string"){
      throw new Error("Expected string, got: " + JSON.stringify(val));
    }
    return val;
  }
};

function makeParam(ctx, parentData, type, param) {
  // this is hack for $this
  ctx.currentData = parentData;
  if(type === "Expr"){
    return function(data) {
      return engine.doEval(ctx, util.arraify(data), param);
    };
  }
  if(type === "AnyAtRoot"){
    return engine.doEval(ctx, ctx.dataRoot, param);
  }
  if(type === "Identifier"){
    if(param.type == "TermExpression"){
      return param.text;
    } else {
      throw new Error("Expected identifier node, got ", JSON.stringify(param));
    }
  }
  var res = engine.doEval(ctx, parentData, param);
  if(type === "Any") {
    return res;
  }
  if(Array.isArray(type)){
    if(res.length == 0){
      return [];
    } else {
      type = type[0];
    }
  }
  var maker = paramTable[type];
  if(res.length > 1){
    throw new Error("Unexpected collection" + JSON.stringify(res) +
      "; expected singleton of type " + type);
  }
  if(res.length == 0){
    return [];
  } else  if(maker){
    return maker(res[0]);
  } else {
    console.error(type, param);
    throw new Error("IMPL me for " + type);
  }
}

function doInvoke(ctx, fnName, data, rawParams){
  var invoc = engine.invocationTable[fnName];
  var res;
  if(invoc) {
    if(!invoc.arity){
      if(!rawParams){
        res = invoc.fn.call(ctx, util.arraify(data));
        return util.arraify(res);
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
          params.push(makeParam(ctx, data, tp, pr));
        }
        params.unshift(data);
        if(invoc.nullable) {
          if(params.some(isNullable)){
            return [];
          }
        }
        res = invoc.fn.apply(ctx, params);
        return util.arraify(res);
      } else {
        console.log(fnName + " wrong arity: got " + paramsNumber );
        return [];
      }
    }
  } else {
    throw new Error("Not implemented: " + fnName);
  }
}
function isNullable(x) {
  var res = x=== null || x=== undefined || util.isEmpty(x);
  return res;
}

function infixInvoke(ctx, fnName, data, rawParams){
  var invoc = engine.invocationTable[fnName];
  if(invoc && invoc.fn) {
    var paramsNumber = rawParams ? rawParams.length : 0;
    if(paramsNumber != 2) { throw new Error("Infix invoke should have arity 2"); }
    var argTypes = invoc.arity[paramsNumber];
    if(argTypes){
      var params = [];
      for(var i = 0; i < paramsNumber; i++){
        var tp = argTypes[i];
        var pr = rawParams[i];
        params.push(makeParam(ctx, data, tp, pr));
      }
      if(invoc.nullable) {
        if(params.some(isNullable)){
          return [];
        }
      }
      var res = invoc.fn.apply(ctx, params);
      return util.arraify(res);
    } else {
      console.log(fnName + " wrong arity: got " + paramsNumber );
      return [];
    }
  } else {
    throw new Error("Not impl " + fnName);
  }
}

engine.FunctionInvocation = function(ctx, parentData, node) {
  var args = engine.doEval(ctx, parentData, node.children[0]);
  const fnName = args[0];
  args.shift();
  var rawParams = args && args[0] && args[0].children;
  return doInvoke(ctx, fnName, parentData, rawParams);
};

engine.ParamList = function(ctx, parentData, node) {
  // we do not eval param list because sometimes it should be passed as
  // lambda/macro (for example in case of where(...)
  return node;
};


engine.UnionExpression = function(ctx, parentData, node) {
  return infixInvoke(ctx, '|', parentData, node.children);
};

engine.ThisInvocation = function(ctx) {
  return util.arraify(ctx.currentData);
};

engine.OpExpression = function(ctx, parentData, node) {
  var op = node.terminalNodeText[0];
  return infixInvoke(ctx, op, parentData, node.children);
};

engine.AliasOpExpression = function(map){
  return function(ctx, parentData, node) {
    var op = node.terminalNodeText[0];
    var alias = map[op];
    if(!alias) { throw new Error("Do not know how to alias " + op + " by " + JSON.stringify(map)); }
    return infixInvoke(ctx, alias, parentData, node.children);
  };
};

engine.NullLiteral = function() {
  return [];
};

engine.ParenthesizedTerm = function(ctx, parentData, node) {
  return engine.doEval(ctx, parentData, node.children[0]);
};


engine.evalTable = { // not every evaluator is listed if they are defined on engine
  BooleanLiteral: engine.BooleanLiteral,
  EqualityExpression: engine.OpExpression,
  FunctionInvocation: engine.FunctionInvocation,
  Functn: engine.Functn,
  Identifier: engine.Identifier,
  IndexerExpression: engine.IndexerExpression,
  InequalityExpression: engine.OpExpression,
  InvocationExpression: engine.InvocationExpression,
  AdditiveExpression: engine.OpExpression,
  MultiplicativeExpression: engine.OpExpression,
  MembershipExpression: engine.AliasOpExpression({"contains": "containsOp", "in": "inOp"}),
  NullLiteral: engine.NullLiteral,
  InvocationTerm: engine.InvocationTerm,
  LiteralTerm: engine.LiteralTerm,
  MemberInvocation: engine.MemberInvocation,
  NumberLiteral: engine.NumberLiteral,
  ParamList: engine.ParamList,
  ParenthesizedTerm: engine.ParenthesizedTerm,
  StringLiteral: engine.StringLiteral,
  TermExpression: engine.TermExpression,
  ThisInvocation: engine.ThisInvocation,
  UnionExpression: engine.UnionExpression,
  OrExpression: engine.OpExpression,
  ImpliesExpression: engine.OpExpression,
  AndExpression: engine.OpExpression,
  XorExpression: engine.OpExpression
};


engine.doEval = function(ctx, parentData, node) {
  const evaluator = engine.evalTable[node.type] || engine[node.type];
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
 * @param {(object|object[])} resource -  FHIR resource, bundle as js object or array of resources
 *  This resource will be modified by this function to add type information.
 * @param {string} parsedPath - fhirpath expression, sample 'Patient.name.given'
 * @param {object} context - a hash of variable name/value pairs.
 */
function applyParsedPath(resource, parsedPath, context) {
  let dataRoot = util.arraify(resource);
  // doEval takes a "ctx" object, and we store things in that as we parse, so we
  // need to put user-provided variable data in a sub-object, ctx.vars.
  // Set up default standard variables, and allow override from the variables.
  // However, we'll keep our own copy of dataRoot for internal processing.
  let vars = {context: resource, ucum: 'http://unitsofmeasure.org'};
  let ctx = {dataRoot, vars: Object.assign(vars, context)};
  return engine.doEval(ctx, dataRoot, parsedPath.children[0]);
}

/**
 *  Evaluates the "path" FHIRPath expression on the given resource, using data
 *  from "context" for variables mentioned in the "path" expression.
 * @param {(object|object[])} resource -  FHIR resource, bundle as js object or array of resources
 *  This resource will be modified by this function to add type information.
 * @param {string} path - fhirpath expression, sample 'Patient.name.given'
 * @param {object} context - a hash of variable name/value pairs.
 */
var evaluate = function(resource, path, context) {
  const node = parser.parse(path);
  return applyParsedPath(resource, node, context);
};

/**
 *  Returns a function that takes a resource and returns the result of
 *  evaluating the given FHIRPath expression on that resource.  The advantage
 *  of this function over "evaluate" is that if you have multiple resources,
 *  the given FHIRPath expression will only be parsed once.
 * @param path the FHIRPath expression to be parsed.
 * @param {object} context - a hash of variable name/value pairs.
 */
var compile = function(path, context) {
  const node = parse(path);
  return function(resource) {
    return applyParsedPath(resource, node, context);
  };
};

module.exports = {
  parse: parse,
  compile: compile,
  evaluate: evaluate
};
