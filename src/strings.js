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
      // The preceding part of the string without escaped characters: '\', '[' or ']'
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
        (lastIndexOfOpenBracket > lastIndexOfCloseBracket)
        ? '.'
        : '[^]';
    });
  }

  return cachedRegExp[pattern];
}

engine.indexOf = function (coll, substr) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.indexOf(substr);
};

engine.substring = function (coll, start, length) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(str) || util.isEmpty(start) || start < 0 || start >= str.length) {
    return [];
  }
  if (length === undefined || util.isEmpty(length)) {
    return str.substring(start);
  }
  return str.substring(start, start + length);
};

engine.startsWith = function (coll, prefix) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(prefix) || util.isEmpty(str) ? [] : str.startsWith(prefix);
};

engine.endsWith = function (coll, postfix) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(postfix) || util.isEmpty(str) ? [] : str.endsWith(postfix);
};

engine.containsFn = function (coll, substr) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.includes(substr);
};

engine.upper = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toUpperCase();
};

engine.lower = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toLowerCase();
};

// See https://build.fhir.org/ig/HL7/FHIRPath/#joinseparator-string-string
engine.joinFn = function (coll, separator) {
  const stringValues = [];
  coll.forEach((n) => {
    const d = util.valData(n);
    if (typeof d === "string") {
      stringValues.push(d);
    } else if (d != null) {
      throw new Error('Join requires a collection of strings.');
    }
  });
  if (util.isEmpty(stringValues)) {
    return [];
  }
  if (separator === undefined) {
    separator = "";
  }
  return stringValues.join(separator);
};

engine.splitFn = function (coll, separator) {
  const strToSplit = misc.singleton(coll, 'String');
  return util.isEmpty(strToSplit) ? [] : strToSplit.split(separator);
};

engine.trimFn = function (coll) {
  const strToTrim = misc.singleton(coll, 'String');
  return util.isEmpty(strToTrim) ? [] : strToTrim.trim();
};

// encoding/decoding
engine.encodeFn = function (coll, format) {
  const strToEncode = misc.singleton(coll, 'String');
  if (util.isEmpty(strToEncode)){
    return [];
  }
  if (format === 'urlbase64' || format === 'base64url'){
    return btoa(strToEncode).replace(/\+/g, '-').replace(/\//g, '_');
  }
  if (format === 'base64'){
    return btoa(strToEncode);
  }
  if (format === 'hex'){
    return  Array.from(strToEncode).map(c => 
      c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) : 
        encodeURIComponent(c).replace(/%/g,'')
    ).join('');
  }
  return [];
};

engine.decodeFn = function (coll, format) {
  const strDecode = misc.singleton(coll, 'String');
  if (util.isEmpty(strDecode)){
    return [];
  }
  if (format === 'urlbase64' || format === 'base64url'){
    return atob(strDecode.replace(/-/g, '+').replace(/_/g, '/'));
  }
  if (format === 'base64'){
    return atob(strDecode);
  }
  if (format === 'hex'){
    if (strDecode.length % 2 !== 0){
      throw new Error('Decode \'hex\' requires an even number of characters.');
    }
    return decodeURIComponent('%' + strDecode.match(/.{2}/g).join('%'));
  }
  return [];
};

// Check if dotAll is supported.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll for details.
const dotAllIsSupported = (new RegExp('')).dotAll === false;

if (dotAllIsSupported) {
  engine.matches = function (coll, regex) {
    const str = misc.singleton(coll, 'String');
    if (util.isEmpty(regex) || util.isEmpty(str)) {
      return [];
    }
    const reg = new RegExp(regex, 'su');
    return reg.test(str);
  };
} else {
  engine.matches = function (coll, regex) {
    const str = misc.singleton(coll, 'String');
    if (util.isEmpty(regex) || util.isEmpty(str)) {
      return [];
    }
    const reg = new RegExp(rewritePatternForDotAll(regex), 'u');
    return reg.test(str);
  };
}

engine.replace = function (coll, pattern, repl) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(pattern) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(util.escapeStringForRegExp(pattern), 'g');
  return str.replace(reg, repl);
};

engine.replaceMatches = function (coll, regex, repl) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(regex, 'gu');
  return str.replace(reg, repl);
};

engine.length = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.length;
};

engine.toChars = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.split('');
};

module.exports = engine;
