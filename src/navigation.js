const util = require("./utilities");
const {ResourceNode}  = require("./types");
let makeResNode = ResourceNode.makeResNode;

var engine = {};

engine.children = function(coll){
  return coll.reduce(function(acc, x){
    let d = util.valData(x);
//    console.log("%%% x is ResourceNode? = "+(x instanceof ResourceNode));
    x = makeResNode(x);
    if(typeof d === 'object'){
      for (var prop of Object.keys(d)) {
        var v = d[prop];
        var childPath = x.path + '.' + prop;
        if(Array.isArray(v)){
          acc.push.apply(acc, v.map((n)=>makeResNode(n, childPath)));
        } else {
          acc.push(makeResNode(v, childPath));
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
