// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */
function mathFunctionInit(engine) {
  "use strict";

  engine.AdditiveExpression = function(ctx, parentData, node) {
    let left = engine.doEval(ctx, parentData, node.children[0]);
    let right = engine.doEval(ctx, parentData, node.children[1]);
    util.assertAtMostOne(left, "AdditiveExpression");
    util.assertAtMostOne(right, "AdditiveExpression");
    let operator = node.terminalNodeText[0];
    if (operator === "&") {
      left = left.length > 0 ? left[0] : "";
      right = right.length > 0 ? right[0] : "";
      util.assertType(left, ["string"], "AdditiveExpression");
      util.assertType(right, ["string"], "AdditiveExpression");
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
          util.assertType(left, ["number"], "AdditiveExpression");
          util.assertType(right, ["number"], "AdditiveExpression");
          return [left - right];
        }
        else // should never reach here, per the grammar
          throw "AdditiveExpression: Unexpected operator: " +operator;
      }
    }
  }

  engine.MultiplicativeExpression = function(ctx, parentData, node) {
    let left = engine.doEval(ctx, parentData, node.children[0]);
    let right = engine.doEval(ctx, parentData, node.children[1]);
    util.assertAtMostOne(left, "MultiplicativeExpression");
    util.assertAtMostOne(right, "MultiplicativeExpression");
    if (left.length == 0 || right.length === 0)
      return [];
    left = left[0];
    right = right[0];
    util.assertType(left, ["number"], "MultiplicativeExpression");
    util.assertType(right, ["number"], "MultiplicativeExpression");
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

  var evalTable = engine.evalTable;
  evalTable.AdditiveExpression = engine.AdditiveExpression;
  evalTable.MultiplicativeExpression = engine.MultiplicativeExpression;
}

module.exports = mathFunctionInit
