var engine = {};

engine.orOp = function(a, b) {
  return a || b;
};

engine.andOp = function(a, b) {
  return a && b;
};

engine.xorOp = function(a, b) {
  return ( a && !b ) || ( !a && b );
};

engine.impliesOp = function(a, b) {
  return (a && b) || (!a && !b) || (a && !b);
};


module.exports = engine;
