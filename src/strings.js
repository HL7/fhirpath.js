const util = require("./utilities");
const misc = require("./misc");

const engine = {};

engine.indexOf = function(coll, substr){
  if (util.isEmpty(substr)) {
    return [];
  }
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.indexOf(substr) : [];
};

engine.substring = function(coll, start, length){
  const str = misc.singleton(coll, 'String');
  if (typeof (str) !== 'string' || util.isEmpty(start) || start < 0 || start >= str.length) {
    return  [];
  }
  if (length === undefined || util.isEmpty(length)) {
    return str.substring(start);
  }
  return str.substring(start, start + length);
};

engine.startsWith = function(coll, prefix){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.startsWith(prefix) : [];
};

engine.endsWith = function(coll, postfix) {
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.endsWith(postfix) : [];
};

engine.containsFn = function(coll, substr){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.includes(substr) : [];
};

engine.upper = function(coll){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.toUpperCase() : [];
};


engine.lower = function(coll){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.toLowerCase() : [];
};


engine.matches = function(coll, regex){
  if (util.isEmpty(regex)) {
    return [];
  }
  const str = misc.singleton(coll, 'String');
  if (typeof (str) !== 'string') {
    return [];
  }
  const reg = new RegExp(regex);
  return reg.test(str);
};

engine.replace = function(coll, pattern, repl){
  if (util.isEmpty(pattern) || util.isEmpty(repl)) {
    return [];
  }
  const str = misc.singleton(coll, 'String');
  if (typeof (str) !== 'string') {
    return [];
  }
  return str.replace(pattern, repl);
};

engine.replaceMatches = function(coll, regex, repl){
  if (util.isEmpty(regex) || util.isEmpty(repl)) {
    return [];
  }
  const str = misc.singleton(coll, 'String');
  if (typeof (str) !== 'string') {
    return [];
  }
  const reg = new RegExp(regex);
  return str.replace(reg, repl);
};

engine.length = function(coll){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.length : [];
};

engine.toChars = function(coll){
  const str = misc.singleton(coll, 'String');
  return (typeof (str) === 'string') ? str.split('') : [];
};

module.exports = engine;
