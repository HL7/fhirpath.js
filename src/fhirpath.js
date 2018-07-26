const parser = require('./parser');

function isCapitalized(x){
  return x && (x[0] === x[0].toUpperCase());
}

var InvocationExpression = (ctx, result, expr)=> {
  // console.log('InvocationExpression', expr);
  return expr.children.reduce((acc, ch)=>{
    return doEval(ctx, acc, ch);
  }, result);
  // // here we handle special case like Patient.name.given
  // // where first term Patient means filter by resourceType
  // // we can fix grammar to produce more meaningful ast
  // var firstCh = expr.children[0];
  // if(firstCh.type === 'TermExpression') {
  //   var termFilter = firstCh.text;
  //   var next = null;
  //   if(isCapitalized(firstCh.text)) {
  //     if(Array.isArray(result)){
  //       next = result.filter((x)=> { return x.resourceType === termFilter; });
  //     } else {
  //       if(result.resourceType === termFilter){
  //         next = result;
  //       }
  //     }
  //   } else {
  //     // this is case where we start from property name.given
  //     next = MemberInvocation(ctx, result, firstCh);
  //   }

  //   if(next !== null){
  //     // remove filter expr
  //     expr.children.shift();
  //     // call recursive
  //     // console.log(expr.children);
  //     return InvocationExpression(ctx, next, expr);
  //   } else {
  //     return null;
  //   }
  // } else {
  // }
};

var TermExpression = (ctx, result, expr)=> {
  // console.log('TermExpression', expr.text, expr);
  return doEval(ctx,result, expr.children[0]);
};

var LiteralTerm = (ctx, result, expr)=> {
  return expr.text;
};

var Identifier = (ctx, result, expr)=> {
  return expr.text.replace(/(^"|"$)/g, '');
};


var InvocationTerm = (ctx, result, expr)=> {
  // console.log('InvocationTerm', expr.text, expr);
  return doEval(ctx,result, expr.children[0]);
};

var MemberInvocation = (ctx, result ,expr )=> {
  const key = doEval(ctx, result, expr.children[0]);
  // console.log('MemberInvocation', key, expr);

  if (result) {
    if(isCapitalized(key)) {
      if(Array.isArray(result)){
        return result.filter((x)=> { return x.resourceType === key; });
      } else {
        if(result.resourceType === key){
          return result;
        } else {
          return null;
        }
      }
    } else {
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
      } else {
        return null;
      }
    }
  } else {
    return null;
  }
};

var IndexerExpression = (ctx, result, expr) => {
  const coll_expr = expr.children[0];
  const idx_expr = expr.children[1];
  var coll = doEval(ctx, result, coll_expr);
  var idx = doEval(ctx, result, idx_expr);
  var idx = idx && parseInt(idx);
  // console.log('IndexerExpression', expr,"\ncoll\n", coll, "\n", idx);
  if(coll) {
    return coll[idx] || null;
  } else {
    return null; 
  }
};

var Functn = (ctx, result, expr) => {
  // console.log('Funcn', expr);
  return expr.children.map((x)=> {
    return doEval(ctx, result, x);
  });
};

const fnTable = {
  exists:  (x) => {
    // console.log('exits', x, !!x);
    return !!x;
  },
  empty:  (x) => {
    if(x){
      return x.length == 0;
    } else {
      return true;
    }
  }
  
};

var FunctionInvocation = (ctx, result, expr) => {
  var args = doEval(ctx, result, expr.children[0]);
  // console.log('FunctionInvocation', expr, args);
  const fnName = args[0];
  args.shift();
  var fn = fnTable[fnName];
  if(fn){
    return fn.apply(this, result, args); 
  } else {
    throw new Error("No function [" + fnName + "] defined ");
  }
  return null;
};

const evalTable = {
  InvocationExpression: InvocationExpression,
  TermExpression: TermExpression,
  MemberInvocation: MemberInvocation,
  IndexerExpression: IndexerExpression,
  InvocationTerm: InvocationTerm,
  Identifier: Identifier,
  LiteralTerm: LiteralTerm,
  FunctionInvocation: FunctionInvocation,
  Functn: Functn
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
  return (resource)=>{};
};

module.exports = {
  parse: parser.parse,
  compile: compile,
  evaluate: evaluate
};
