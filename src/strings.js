var engine = {};

function ensureStringSingleton(x){
  let d;
  if(x.length == 1 && typeof (d=valData(x[0]) === "string") {
    return d;
  }
  throw new Error('Expected string, but got ' + JSON.stringify(x));
}

engine.indexOf = function(coll, substr){
  var str = ensureStringSingleton(coll);
  return str.indexOf(substr);
};

engine.substring = function(coll, start, length){
  var str = ensureStringSingleton(coll);
  return str.substring(start, start + length);
};

engine.startsWith = function(coll, prefix){
  var str = ensureStringSingleton(coll);
  return str.startsWith(prefix);
};

engine.endsWith = function(coll, postfix){
  var str = ensureStringSingleton(coll);
  return str.endsWith(postfix);
};

engine.containsFn = function(coll, substr){
  var str = ensureStringSingleton(coll);
  return str.includes(substr);
};


engine.matches = function(coll, regex){
  var str = ensureStringSingleton(coll);
  var reg = new RegExp(regex);
  return reg.test(str);

};

engine.replace = function(coll, regex, repl){
  var str = ensureStringSingleton(coll);
  return str.replace(regex, repl);
};

engine.replaceMatches = function(coll, regex, repl){
  var str = ensureStringSingleton(coll);
  var reg = new RegExp(regex);
  return str.replace(reg, repl);
};

engine.length = function(coll){
  var str = ensureStringSingleton(coll);
  return str.length;
};

module.exports = engine;
