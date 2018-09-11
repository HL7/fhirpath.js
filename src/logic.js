var engine = {};

engine.orOp = function(a, b) {
  if(Array.isArray(b)){
    if(a === true){
      return true;
    } else if (a === false) {
      return [];
    } else if (Array.isArray(a)) {
      return [];
    }
  }
  if(Array.isArray(a)){
    if(b === true ){
      return true;
    } else {
      return [];
    }
  }
  return a || b;
};

engine.andOp = function(a, b) {
  if(Array.isArray(b)){
    if(a === true){
      return [];
    } else if (a === false) {
      return false;
    } else if (Array.isArray(a)) {
      return []; 
    }
  }
  if(Array.isArray(a)){
    if(b === true ){
      return [];
    } else {
      return false;
    }
  }
  return a && b;
};

engine.xorOp = function(a, b) {
  if(Array.isArray(b)){
    if(a === true){
      return true;
    } else if (a === false) {
      return [];
    } else if (Array.isArray(a)) {
      return [];
    }
  }
  if(Array.isArray(a)){
    if(b === true ){
      return true;
    } else {
      return [];
    }
  }
  return ( a && !b ) || ( !a && b );
};

engine.impliesOp = function(a, b) {
  if(Array.isArray(b)){
    if(a === true){
      return [];
    } else if (a === false) {
      return true;
    } else if (Array.isArray(a)) {
      return [];
    }
  }
  if(Array.isArray(a)){
    if(b === true ){
      return true;
    } else {
      return [];
    }
  }
  if(a === false) { return true; }
  return (a && b);
};


module.exports = engine;
