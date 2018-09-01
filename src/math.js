// This file holds code to hande the FHIRPath Math functions.

var util = require("./utilities");

/**
 *  Adds the math functions to the given FHIRPath engine.
 */

var engine = {};

engine.amp = function(x, y){
  return (x || "") + (y || "");
};

engine.plus = function(x, y){
  return x + y;
};

engine.minus = function(x, y){
  return x - y;
};


engine.mul = function(x, y){
  return x * y;
};

engine.div = function(x, y){
  return x / y;
};

engine.intdiv = function(x, y){
  return Math.floor(x / y);
};

engine.mod = function(x, y){
  return x % y;
};


module.exports = engine;
