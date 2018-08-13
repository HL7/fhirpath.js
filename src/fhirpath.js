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

var InvocationExpression = (ctx, parentData, node)=> {
  return node.children.reduce((acc, ch)=>{
    return doEval(ctx, acc, ch);
  }, parentData);
};

var TermExpression = (ctx, parentData, node)=> {
  return doEval(ctx,parentData, node.children[0]);
};

var LiteralTerm = (ctx, parentData, node)=> {
  var term = node.children[0];
  if(term){
    return doEval(ctx, parentData, term);
  } else {
    return [node.text];
  }
};

var StringLiteral = (ctx, parentData, node)=> {
  return [node.text.replace(/(^['"]|['"]$)/g, "")];
};

var BooleanLiteral = (ctx, parentData, node)=> {
  if(node.text  === "true") {
    return [true];
  } else {
    return [false];
  }
};


var NumberLiteral = (ctx, parentData, node)=> {
  return [Number(node.text)];
};

var Identifier = (ctx, parentData, node)=> {
  return [node.text.replace(/(^"|"$)/g, "")];
};

var InvocationTerm = (ctx, parentData, node)=> {
  return doEval(ctx,parentData, node.children[0]);
};

var MemberInvocation = (ctx, parentData ,node )=> {
  const key = doEval(ctx, parentData, node.children[0])[0];

  if (parentData) {
    if(isCapitalized(key)) {
      return parentData.filter((x)=> { return x.resourceType === key; });
    } else {
      return parentData.reduce((acc, res)=> {
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
    }
  } else {
    return [];
  }
};

var IndexerExpression = (ctx, parentData, node) => {
  const coll_node = node.children[0];
  const idx_node = node.children[1];
  var coll = doEval(ctx, parentData, coll_node);
  var idx = doEval(ctx, parentData, idx_node);

  if(isEmpty(idx)) {
    return [];
  }

  var idxNum = parseInt(idx[0]);
  if(coll && isSome(idxNum) && coll.length>idxNum && idxNum>=0) {
    return [coll[idxNum]];
  } else {
    return [];
  }
};

var Functn = (ctx, parentData, node) => {
  return node.children.map((x)=> {
    return doEval(ctx, parentData, x);
  });
};


var whereMacro = (ctx, parentData, node) => {
  if(parentData !== false && ! parentData) { return []; }

  // lambda means branch of not evaluated AST
  // for example an EqualityExpression.
  var lambda = node[0].children[0];

  return flatten(parentData.filter((x)=> {
    return doEval(ctx, [x], lambda)[0];
  }));
};

var selectMacro = (ctx, parentData, node) => {
  if(parentData !== false && ! parentData) { return []; }

  var lambda = node[0].children[0];

  return flatten(parentData.map((x)=> {
    return doEval(ctx, [x], lambda);
  }));
};

var repeatMacro = (ctx, parentData, node) => {
  if(parentData !== false && ! parentData) { return []; }

  var lambda = node[0].children[0];
  var res = [];
  var items = parentData;

  var next = null;
  var lres = null;
  while (items.length != 0) {
    next = items.shift();
    lres = flatten(doEval(ctx, [next], lambda));
    if(lres){
      res = res.concat(lres);
      items = items.concat(lres);
    }
  }
  return res;
};

var iifMacro = (ctx, parentData, node) => {

  var exprs = node[0].children;
  var cond = exprs[0];
  var succ = exprs[1];
  var fail = exprs[2];

  var res = flatten(doEval(ctx, parentData, cond));
  if(res[0]){
    return doEval(ctx, parentData, succ);
  } else {
    return doEval(ctx, parentData, fail);
  }
};


const macroTable = {
  where: whereMacro,
  select: selectMacro,
  repeat: repeatMacro,
  iif: iifMacro
};


var existsFn  = (x) => {
  return [isSome(x)];
};

var emptyFn = (x) => {
  if(x){
    return [x.length == 0];
  } else {
    if(isSome(x)){
      return [false];
    } else {
      return [true];
    }
  }
};

var countFn = (x)=>{
  if (x && x.length) {
    return [x.length];
  } else {
    return [0];
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


var firstFn = (x)=>{
  if(isSome(x)){
    if(x.length){
      return [x[0]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

var lastFn = (x)=>{
  if(isSome(x)){
    if(x.length){
      return [x[x.length - 1]];
    } else {
      return x;
    }
  } else {
    return [];
  }
};

var tailFn = (x)=>{
  if(isSome(x)){
    if(x.length){
      return x.slice(1, x.length);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

var takeFn = (x, n)=>{
  if(isSome(x)){
    if(x.length){
      return x.slice(0, n);
    } else {
      return [x];
    }
  } else {
    return [];
  }
};

var skipFn = (x, num)=>{
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

const fnTable = {
  exists:  existsFn,
  empty: emptyFn,
  count: countFn,
  single: singleFn,
  first: firstFn,
  last: lastFn,
  tail: tailFn,
  take: takeFn,
  skip: skipFn,
  trace: traceFn
};

var realizeParams = (ctx, parentData, args) => {
  if(args && args[0] && args[0].children) {
    return args[0].children.map((x)=>{
      return doEval(ctx, parentData, x);
    });
  } else {
    return [];
  }
};

var FunctionInvocation = (ctx, parentData, node) => {
  var args = doEval(ctx, parentData, node.children[0]);
  const fnName = args[0];
  args.shift();
  var macro = macroTable[fnName];
  if(macro){
    return macro.call(this, ctx, parentData, args);
  } else {
    var fn = fnTable[fnName];
    if(fn){
      var params = realizeParams(ctx, parentData, args);
      params.unshift(parentData);
      return fn.apply(ctx, params);
    } else {
      throw new Error("No function [" + fnName + "] defined ");
    }
  }
};

var ParamList = (ctx, parentData, node) => {
  // we do not eval param list because sometimes it should be passed as
  // lambda/macro (for example in case of where(...)
  return node;
};

function doCompare(x,y){
  let rtn = x.length === y.length;
  for (let i=0, len=x.length; rtn && i<len; ++i)
    rtn = x[i] == y[i];
  return [rtn];
}

var EqualityExpression = (ctx, parentData, node) => {
  var left = doEval(ctx, parentData, node.children[0]);
  var right = doEval(ctx, parentData, node.children[1]);
  return doCompare(left, right);
};

var UnionExpression = (ctx, parentData, node) => {
  var left = doEval(ctx, parentData, node.children[0]);
  var right = doEval(ctx, parentData, node.children[1]);
  return left.concat(right);
};


// Start of Math functions
/**
 *  Throws an exception if the collection contains more than one value.
 * @param collection the collection to be checked.
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
function assertAtMostOne(collection, errorMsgPrefix) {
  errorMsgPrefix = errorMsgPrefix ? errorMsgPrefix + ": " : "";
  if (collection.length > 1) {
    throw errorMsgPrefix + "Was expecting no more than one element but got " +
      JSON.stringify(collection);
  }
}

/**
 *  Throws an exception if the data is not one of the expected types.
 * @param data the value to be checked
 * @param types an array of the permitted types
 * @param errorMsgPrefix An optional prefix for the error message to assist in
 *  debugging.
 */
function assertType(data, types, errorMsgPrefix) {
  errorMsgPrefix = errorMsgPrefix ? errorMsgPrefix + ": " : "";
  if (types.indexOf(typeof data) < 0) {
    let typeList = types.length > 1 ? "one of "+types.join(", ") : types[0];
    throw errorMsgPrefix + "Found type '"+(typeof data)+"' but was expecting " +
      typeList;
  }
}


function AdditiveExpression(ctx, parentData, node) {
  let left = doEval(ctx, parentData, node.children[0]);
  let right = doEval(ctx, parentData, node.children[1]);
  assertAtMostOne(left, "AdditiveExpression");
  assertAtMostOne(right, "AdditiveExpression");
  let operator = node.terminalNodeText[0];
  if (operator === "&") {
    left = left.length > 0 ? left[0] : "";
    right = right.length > 0 ? right[0] : "";
    assertType(left, ["string"], "AdditiveExpression");
    assertType(right, ["string"], "AdditiveExpression");
    return [left + right];
  }
  else { // + or -
    if (left.length === 0 || right.length === 0)
      return [];
    else {
      left = left[0];
      right = right[0];
      if (typeof left !== typeof right)
        throw "AdditiveExpression:  Mismatched types, "+typeof left +" and "+ typeof right;
      if (operator === "+")
        return [left + right];
      else if (operator === "-") {
        assertType(left, ["number"], "AdditiveExpression");
        assertType(right, ["number"], "AdditiveExpression");
        return [left - right];
      }
      else // should never reach here, per the grammar
        throw "AdditiveExpression: Unexpected operator: " +operator;
    }
  }
}

function MultiplicativeExpression(ctx, parentData, node) {
  let left = doEval(ctx, parentData, node.children[0]);
  let right = doEval(ctx, parentData, node.children[1]);
  assertAtMostOne(left, "MultiplicativeExpression");
  assertAtMostOne(right, "MultiplicativeExpression");
  if (left.length == 0 || right.length === 0)
    return [];
  left = left[0];
  right = right[0];
  assertType(left, ["number"], "MultiplicativeExpression");
  assertType(right, ["number"], "MultiplicativeExpression");
  let operator = node.terminalNodeText[0];
  if (operator === "*")
    return [left * right];
  else if (operator === "/")
    return [left / right];
  else if (operator === "mod")
    return [left % right];
  else if (operator === "div")
    return [Math.floor(left / right)];
  else // should never reach here, per grammar
    throw "MultiplicativeExpression: Unexpected operator: " +operator;
}
// End of Math functions


const evalTable = {
  AdditiveExpression: AdditiveExpression,
  BooleanLiteral: BooleanLiteral,
  EqualityExpression: EqualityExpression,
  FunctionInvocation: FunctionInvocation,
  Functn: Functn,
  Identifier: Identifier,
  IndexerExpression: IndexerExpression,
  InvocationExpression: InvocationExpression,
  InvocationTerm: InvocationTerm,
  LiteralTerm: LiteralTerm,
  MemberInvocation: MemberInvocation,
  MultiplicativeExpression: MultiplicativeExpression,
  NumberLiteral: NumberLiteral,
  ParamList: ParamList,
  StringLiteral: StringLiteral,
  TermExpression: TermExpression,
  UnionExpression: UnionExpression,
};

var doEval = (ctx, parentData, node) => {
  const evaluator = evalTable[node.type];
  if(evaluator){
    return evaluator(ctx, parentData, node);
  } else {
    throw new Error("No " + node.type + " evaluator ");
  }
};

/**
 * @param {(object|object[])} resource -  FHIR resource, bundle as js object or array of resources
 * @param {string} path - fhirpath expression, sample 'Patient.name.given'
 */
var evaluate = (resource, path) => {
  const node = parser.parse(path);
  return doEval({}, arraify(resource), node.children[0]);
};

var parse = (path)=> {
  return parser.parse(path);
};


var compile = (path)=> {
  console.log("Compile " + path);
  return (resource)=>{
    return resource;
  };
};

module.exports = {
  parse: parse,
  compile: compile,
  evaluate: evaluate
};
