// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");
var deepEqual = require('./deep-equal');

function init(engine) {
  "use strict";

  function equality(x,y){
    if(engine.isEmpty(x) || engine.isEmpty(y)) { return []; }
    return [deepEqual(x, y)];
  }

  function equivalence(x,y){
    if(engine.isEmpty(x) && engine.isEmpty(y)) { return [true]; }
    if(engine.isEmpty(x) || engine.isEmpty(y)) { return []; }
    return [deepEqual(x, y, {fuzzy: true})];
  }

  engine.evalTable.EqualityExpression = function(ctx, parentData, node) {
    var op = node.terminalNodeText[0];
    var left = engine.doEval(ctx, parentData, node.children[0]);
    var right = engine.doEval(ctx, parentData, node.children[1]);
    if(op == '=') {
      return equality(left, right);
    } else if (op == '!=') {
      var eq = equality(left, right);
      return eq.length == 1 ? [!eq[0]] : [];
    } else if (op == '~') {
      return equivalence(left, right);
    } else if (op == '!~') {
      var eqv = equivalence(left, right);
      return eqv.length == 1 ? [!eqv[0]] : [];
    } else {
      throw new Error(op + ' is not impl.');
    }
  };

  engine.evalTable.InequalityExpression = function(ctx, parentData, node) {
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
        util.raiseError('Type of "'+left+'" did not match type of "'+right+'"', 'InequalityExpression');
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
}

module.exports = init;
