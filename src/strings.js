const util = require("./utilities");
const misc = require("./misc");

const engine = {};

// Cache for rewritten RegExp patterns
const cachedRegExp = {};

/**
 * Rewrites RegExp pattern to support single-line mode (dotAll) in IE11:
 * To do that we replace "." with "[^]" in source RegExp pattern,
 * except where "." is escaped or is inside unescaped [].
 * Another way to do the same is using package regexpu-core
 * or packages regjsparser/regjsgen.
 * @param {string} pattern - source RegExp pattern
 * @return {string}
 */
function rewritePatternForDotAll(pattern) {
  if (!cachedRegExp[pattern]) {
    cachedRegExp[pattern] = pattern.replace(/\./g, (_, offset, entirePattern) => {
      // The preceding part of the string
      const precedingPart = entirePattern.substr(0, offset);
      // The preceding part of the string without escaped characters
      const cleanPrecedingPart = precedingPart
        .replace(/\\\\/g, '')
        .replace(/\\[\][]/g, '');
      // Check if '.' is escaped
      const escaped = cleanPrecedingPart[cleanPrecedingPart.length - 1] === '\\';
      // The last index of unescaped '['
      const lastIndexOfOpenBracket = cleanPrecedingPart.lastIndexOf('[');
      // The last index of unescaped ']'
      const lastIndexOfCloseBracket = cleanPrecedingPart.lastIndexOf(']');
      return escaped ||
      (lastIndexOfOpenBracket !== -1 &&
        lastIndexOfOpenBracket > lastIndexOfCloseBracket)
        ? '.'
        : '[^]';
    });
  }

  return cachedRegExp[pattern];
}

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


const dotAllIsSupported = (new RegExp('')).dotAll === false;

if (dotAllIsSupported) {
  engine.matches = function(coll, regex) {
    const str = misc.singleton(coll, 'String');
    if (util.isEmpty(regex) || util.isEmpty(str)) {
      return [];
    }
    const reg = new RegExp(regex, 's');
    return reg.test(str);
  };
} else {
  engine.matches = function(coll, regex) {
    const str = misc.singleton(coll, 'String');
    if (util.isEmpty(regex) || util.isEmpty(str)) {
      return [];
    }
    const reg = new RegExp(rewritePatternForDotAll(regex));
    return reg.test(str);
  };
}

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
