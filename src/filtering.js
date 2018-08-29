// Contains the FHIRPath Filtering and Projection functions.  (Section 5.2 of
// the FHIRPath 1.0.0 specification).

/**
 *  Adds the filtering and projection functions to the given FHIRPath engine.
 */
function engineBuilder(engine) {
  "use strict";

  engine.whereMacro = function(ctx, parentData, node) {
    if(parentData !== false && ! parentData) { return []; }
    // lambda means branch of not evaluated AST
    // for example an EqualityExpression.
    var lambda = node[0].children[0];

    return engine.flatten(parentData.filter(function(x) {
      return engine.doEval(ctx, [x], lambda)[0];
    }));
  };

  engine.selectMacro = function(ctx, parentData, node) {
    if(parentData !== false && ! parentData) { return []; }

    var lambda = node[0].children[0];

    return engine.flatten(parentData.map(function(x) {
      return engine.doEval(ctx, [x], lambda);
    }));
  };

  engine.repeatMacro = function(ctx, parentData, node) {
    if(parentData !== false && ! parentData) { return []; }

    var lambda = node[0].children[0];
    var res = [];
    var items = parentData;

    var next = null;
    var lres = null;
    while (items.length != 0) {
      next = items.shift();
      lres = engine.flatten(engine.doEval(ctx, [next], lambda));
      if(lres){
        res = res.concat(lres);
        items = items.concat(lres);
      }
    }
    return res;
  };

  /*
   *  TBD
  engine.ofTypeFn = function(parentData, type) {
    let rtn = [];
    for (let i=0, len=parentData.length; i<len && rtn; ++i) {
      switch(type) {
      }
    }
    return rtn;
  }
  */

  var macros = ['where', 'select', 'repeat'];
  for (let i=0, len=macros.length; i<len; ++i) {
    let name=macros[i];
    engine.macroTable[name] = engine[name+"Macro"];
  }
}

module.exports = engineBuilder;
