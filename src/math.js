// This file holds code to hande the FHIRPath Math functions.

/**
 *  Adds the math functions to the given FHIRPath engine.
 */
function mathFunctionInit(engine) {
  "use strict";

  /**
   *  Throws an exception if the collection contains more than one value.
   * @param collection the collection to be checked.
   * @param errorMsgPrefix An optional prefix for the error message to assist in
   *  debugging.
   */
  engine.assertAtMostOne = function (collection, errorMsgPrefix) {
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
  engine.assertType = function(data, types, errorMsgPrefix) {
    errorMsgPrefix = errorMsgPrefix ? errorMsgPrefix + ": " : "";
    if (types.indexOf(typeof data) < 0) {
      let typeList = types.length > 1 ? "one of "+types.join(", ") : types[0];
      throw errorMsgPrefix + "Found type '"+(typeof data)+"' but was expecting " +
        typeList;
    }
  }


  engine.AdditiveExpression = function(ctx, parentData, node) {
    let left = engine.doEval(ctx, parentData, node.children[0]);
    let right = engine.doEval(ctx, parentData, node.children[1]);
    engine.assertAtMostOne(left, "AdditiveExpression");
    engine.assertAtMostOne(right, "AdditiveExpression");
    let operator = node.terminalNodeText[0];
    if (operator === "&") {
      left = left.length > 0 ? left[0] : "";
      right = right.length > 0 ? right[0] : "";
      engine.assertType(left, ["string"], "AdditiveExpression");
      engine.assertType(right, ["string"], "AdditiveExpression");
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
          engine.assertType(left, ["number"], "AdditiveExpression");
          engine.assertType(right, ["number"], "AdditiveExpression");
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
    engine.assertAtMostOne(left, "MultiplicativeExpression");
    engine.assertAtMostOne(right, "MultiplicativeExpression");
    if (left.length == 0 || right.length === 0)
      return [];
    left = left[0];
    right = right[0];
    engine.assertType(left, ["number"], "MultiplicativeExpression");
    engine.assertType(right, ["number"], "MultiplicativeExpression");
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
}

module.exports = mathFunctionInit
