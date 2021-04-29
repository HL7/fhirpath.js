const util = require("./utilities");
const misc = require("./misc");

const engine = {};

engine.indexOf = function(coll, substr){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.indexOf(substr);
};

engine.substring = function(coll, start, length){
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(str) || util.isEmpty(start) || start < 0 || start >= str.length) {
    return  [];
  }
  if (length === undefined || util.isEmpty(length)) {
    return str.substring(start);
  }
  return str.substring(start, start + length);
};

engine.startsWith = function(coll, prefix){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(prefix) || util.isEmpty(str) ? [] : str.startsWith(prefix);
};

engine.endsWith = function(coll, postfix) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(postfix) || util.isEmpty(str) ? [] : str.endsWith(postfix);
};

engine.containsFn = function(coll, substr){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.includes(substr);
};

engine.upper = function(coll){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toUpperCase();
};


engine.lower = function(coll){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toLowerCase();
};


engine.matches = function(coll, regex){
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(regex);
  return reg.test(str);
};

engine.replace = function(coll, pattern, repl){
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(pattern) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(util.escapeStringForRegExp(pattern), 'g');
  return str.replace(reg, repl);
};

engine.replaceMatches = function(coll, regex, repl){
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(regex, 'g');
  return str.replace(reg, repl);
};

engine.length = function(coll){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.length;
};

engine.toChars = function(coll){
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.split('');
};

module.exports = engine;
