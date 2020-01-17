const util = require("./utilities");
const {ResourceNode}  = require("./types");
let makeResNode = ResourceNode.makeResNode;

var engine = {};

engine.children = function(coll){
  let model = this.model; // "this" is the context object

  return coll.reduce(function(acc, x){
    let d = util.valData(x);
    x = makeResNode(x);
    if(typeof d === 'object'){
      for (var prop of Object.keys(d)) {
        var v = d[prop];
        var childPath = x.path + '.' + prop;
        if (model) {
          let defPath = model.pathsDefinedElsewhere[childPath];
          if (defPath)
            childPath = defPath;
        }
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
  var ch = engine.children.call(this, coll); // "this" is the context object
  var res = [];
  while(ch.length > 0){
    res.push.apply(res, ch);
    ch = engine.children.call(this, ch);
  }
  return res;
};

module.exports = engine;
