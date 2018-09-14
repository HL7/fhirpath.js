
var engine = {};

engine.children = function(coll){
  return coll.reduce(function(acc, x){
    if(typeof x === 'object'){
      for (var prop in x) {
        if(x.hasOwnProperty(prop)) {
          var v = x[prop];
          if(Array.isArray(v)){
            acc.push.apply(acc, v);
          } else {
            acc.push(v);
          }
        }
      }
      return acc;
    } else {
      return acc;
    }
  }, []);
};

engine.descendants = function(coll){
  var ch = engine.children(coll);
  var res = [];
  while(ch.length > 0){
    res.push.apply(res, ch);
    ch = engine.children(ch);
  }
  return res;
};

module.exports = engine;
