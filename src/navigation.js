var util = require("./utilities");
//let makeResNode = util.ResourceNode.makeResNode;

var engine = {};

engine.children = function(coll){
  return coll.reduce(function(acc, x){
    let d = util.valData(x);
    if(typeof d === 'object'){
      for (var prop in d) {
        if(d.hasOwnProperty(prop)) {
          var v = d[prop];
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
