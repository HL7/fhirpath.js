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
  if(a === false) { return true; };
  return (a && b);
};


module.exports = engine;
