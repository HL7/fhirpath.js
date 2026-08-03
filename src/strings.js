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
 * @param {string} pattern - source RegExp pattern.
 * @returns {string} the rewritten pattern.
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


/**
 * Implements the FHIRPath `indexOf(substring)` function.
 * See https://hl7.org/fhirpath/#indexofsubstring-string-integer.
 * @param {Array} coll - input collection.
 * @param {string} substr - substring to find.
 * @returns {number|[]} the zero-based index of the first match, or an empty
 *   collection.
 */
engine.indexOf = function (coll, substr) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.indexOf(substr);
};


/**
 * Implements the FHIRPath `lastIndexOf(substring)` function.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#lastindexofsubstring--string--integer.
 * @param {Array} coll - input collection.
 * @param {string} substr - substring to find.
 * @returns {number|[]} the zero-based index of the last match, or an empty
 *   collection.
 */
engine.lastIndexOf = function (coll, substr) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.lastIndexOf(substr);
};


/**
 * Implements the FHIRPath `substring(start[, length])` function.
 * See https://hl7.org/fhirpath/#substringstart-integer-length-integer-string.
 * @param {Array} coll - input collection.
 * @param {number} start - zero-based starting index.
 * @param {number} [length] - optional substring length.
 * @returns {string|[]} the extracted substring, or an empty collection.
 */
engine.substring = function (coll, start, length) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(str) || util.isEmpty(start)) {
    return [];
  }
  start = +start; // Convert to number
  if (start < 0 || start >= str.length) {
    return [];
  }
  if (length === undefined || util.isEmpty(length)) {
    return str.substring(start);
  }
  return str.substring(start, start + +length);
};


/**
 * Implements the FHIRPath `startsWith(prefix)` function.
 * See https://hl7.org/fhirpath/#startswithprefix-string-boolean.
 * @param {Array} coll - input collection.
 * @param {string} prefix - prefix to test.
 * @returns {boolean|[]} true if the string starts with `prefix`, or an empty
 *   collection.
 */
engine.startsWith = function (coll, prefix) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(prefix) || util.isEmpty(str) ? [] : str.startsWith(prefix);
};


/**
 * Implements the FHIRPath `endsWith(postfix)` function.
 * See https://hl7.org/fhirpath/#endswithsuffix-string-boolean.
 * @param {Array} coll - input collection.
 * @param {string} postfix - suffix to test.
 * @returns {boolean|[]} true if the string ends with `postfix`, or an empty
 *   collection.
 */
engine.endsWith = function (coll, postfix) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(postfix) || util.isEmpty(str) ? [] : str.endsWith(postfix);
};


/**
 * Implements the FHIRPath `contains(substring)` function.
 * See https://hl7.org/fhirpath/#containssubstring-string-boolean.
 * @param {Array} coll - input collection.
 * @param {string} substr - substring to search for.
 * @returns {boolean|[]} true if the substring is present, or an empty
 *   collection.
 */
engine.containsFn = function (coll, substr) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(substr) || util.isEmpty(str) ? [] : str.includes(substr);
};


/**
 * Implements the FHIRPath `upper()` function.
 * See https://hl7.org/fhirpath/#upper-string.
 * @param {Array} coll - input collection.
 * @returns {string|[]} the uppercased string, or an empty collection.
 */
engine.upper = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toUpperCase();
};


/**
 * Implements the FHIRPath `lower()` function.
 * See https://hl7.org/fhirpath/#lower-string.
 * @param {Array} coll - input collection.
 * @returns {string|[]} the lowercased string, or an empty collection.
 */
engine.lower = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.toLowerCase();
};


/**
 * Implements the FHIRPath `join(separator)` function.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#joinseparator-string-string
 * @param {Array} coll - input collection of string values.
 * @param {string} [separator] - separator inserted between values.
 * @returns {string|[]} the concatenated string, or an empty collection.
 * @throws {Error} if the collection contains non-string non-null values.
 */
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


/**
 * Implements the FHIRPath `split(separator)` function.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#splitseparator-string--collection.
 * @param {Array} coll - input collection.
 * @param {string} separator - separator to split on.
 * @returns {Array|string[]} split string fragments, or an empty collection.
 */
engine.splitFn = function (coll, separator) {
  const strToSplit = misc.singleton(coll, 'String');
  return util.isEmpty(strToSplit) ? [] : strToSplit.split(separator);
};


/**
 * Implements the FHIRPath `trim()` function.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#trim--string.
 * @param {Array} coll - input collection.
 * @returns {string|[]} the trimmed string, or an empty collection.
 */
engine.trimFn = function (coll) {
  const strToTrim = misc.singleton(coll, 'String');
  return util.isEmpty(strToTrim) ? [] : strToTrim.trim();
};


/**
 * Implements the FHIRPath `encode(format)` function.
 * Supports `urlbase64`/`base64url`, `base64`, and `hex`.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#encodeformat--string--string.
 * @param {Array} coll - input collection.
 * @param {string} format - encoding format.
 * @returns {string|[]} the encoded string, or an empty collection.
 */
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


/**
 * Implements the FHIRPath `decode(format)` function.
 * Supports `urlbase64`/`base64url`, `base64`, and `hex`.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#decodeformat--string--string.
 * @param {Array} coll - input collection.
 * @param {string} format - encoding format.
 * @returns {string|[]} the decoded string, or an empty collection.
 * @throws {Error} for invalid hex input length.
 */
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

/**
 * Converts FHIRPath regex flags to JavaScript RegExp flags.
 * FHIRPath flags: i (case-insensitive), m (multiline).
 * The regex is always evaluated in single-line mode (dotAll).
 * Any other flag character results in an exception.
 * The 'u' (unicode) flag is always applied.
 * @param {string|undefined} flags - FHIRPath regex flags.
 * @returns {string} JavaScript RegExp flags.
 * @throws {Error} if flags contain unsupported characters.
 */
function resolveRegexFlags(flags) {
  let jsFlags = 'u';
  let hasI = false;
  let hasM = false;

  if (flags !== undefined) {
    for (const ch of flags) {
      if (ch === 'i') {
        hasI = true;
      } else if (ch === 'm') {
        hasM = true;
      } else {
        throw new Error('matches/matchesFull flags must only contain i and/or m');
      }
    }
  }

  if (hasI) { jsFlags += 'i'; }
  if (hasM) { jsFlags += 'm'; }
  jsFlags += 's';

  return jsFlags;
}


/**
 * Implements the FHIRPath `matches(regex[, flags])` function.
 * See https://hl7.org/fhirpath/#matchesregex-string-boolean.
 * @param {Array} coll - input collection.
 * @param {string} regex - regular expression pattern.
 * @param {string} [flags] - FHIRPath regex flags (`i`, `m`).
 * @returns {boolean|[]} true if the pattern matches, or an empty collection.
 */
engine.matches = function (coll, regex, flags) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(str)) {
    return [];
  }
  const jsFlags = resolveRegexFlags(flags);
  if (!dotAllIsSupported) {
    return new RegExp(rewritePatternForDotAll(regex), jsFlags.replace('s', '')).test(str);
  }
  return new RegExp(regex, jsFlags).test(str);
};


/**
 * Implements the FHIRPath `matchesFull(regex[, flags])` function.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#matchesfullregex--string-flags--string--boolean.
 * Note: The implementation wraps `regex` in `^(?: ... )$`. If `flags`
 * contains `m`, these anchors become line anchors and may match a single line
 * within a multi-line string.
 * @param {Array} coll - input collection.
 * @param {string} regex - regular expression pattern.
 * @param {string} [flags] - FHIRPath regex flags (`i`, `m`).
 * @returns {boolean|[]} true if the full string matches, or an empty
 *   collection.
 */
engine.matchesFull = function (coll, regex, flags) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(str)) {
    return [];
  }
  const fullRegex = '^(?:' + regex + ')$';
  const jsFlags = resolveRegexFlags(flags);
  if (!dotAllIsSupported) {
    return new RegExp(rewritePatternForDotAll(fullRegex), jsFlags.replace('s', '')).test(str);
  }
  return new RegExp(fullRegex, jsFlags).test(str);
};


/**
 * Implements the FHIRPath `replace(pattern, substitution)` function.
 * See https://hl7.org/fhirpath/#replacepattern-string-substitution-string-string.
 * @param {Array} coll - input collection.
 * @param {string} pattern - literal text pattern to replace.
 * @param {string} repl - replacement text.
 * @returns {string|[]} string with replacements applied, or an empty
 *   collection.
 */
engine.replace = function (coll, pattern, repl) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(pattern) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(util.escapeStringForRegExp(pattern), 'g');
  return str.replace(reg, repl);
};


/**
 * Implements the FHIRPath `replaceMatches(regex, substitution)` function.
 * See https://hl7.org/fhirpath/#replacematchesregex-string-substitution-string-string.
 * @param {Array} coll - input collection.
 * @param {string} regex - regular expression pattern to replace.
 * @param {string} repl - replacement text.
 * @returns {string|[]} string with regex replacements applied, or an empty
 *   collection.
 */
engine.replaceMatches = function (coll, regex, repl) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(regex) || util.isEmpty(repl) || util.isEmpty(str)) {
    return [];
  }
  const reg = new RegExp(regex, 'gu');
  return str.replace(reg, repl);
};


/**
 * Implements the FHIRPath `length()` function.
 * See https://hl7.org/fhirpath/#length-integer.
 * @param {Array} coll - input collection.
 * @returns {number|[]} string length, or an empty collection.
 */
engine.length = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.length;
};


/**
 * Implements the FHIRPath `toChars()` function.
 * See https://hl7.org/fhirpath/#tochars-collection.
 * @param {Array} coll - input collection.
 * @returns {string[]} character array, or an empty collection.
 */
engine.toChars = function (coll) {
  const str = misc.singleton(coll, 'String');
  return util.isEmpty(str) ? [] : str.split('');
};

const htmlEscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const htmlUnescapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
};

const htmlEscapeRegex = /[&<>"']/g;
const htmlUnescapeRegex = /&(?:amp|lt|gt|quot|#39);/g;


/**
 * Implements the FHIRPath `escape(format)` function.
 * Supports `html` and `json`.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#escapetarget--string--string.
 * @param {Array} coll - input collection.
 * @param {string} format - escaping format.
 * @returns {string|[]} escaped string, or an empty collection.
 */
engine.escapeFn = function (coll, format) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(str)) {
    return [];
  }
  if (format === 'html') {
    return str.replace(htmlEscapeRegex, ch => htmlEscapeMap[ch]);
  }
  if (format === 'json') {
    // json encode using the built-in JSON.stringify and remove the surrounding quotes
    return JSON.stringify(str).slice(1, -1);
  }
  return [];
};

// we're undoing the escaping done by JSON.stringify, so we need to handle the same escape sequences
// see https://tc39.es/ecma262/multipage/structured-data.html#sec-json.stringify for details on JSON string escaping
// particularly Note 3. going from the text "\n" (2 string characters) to an actual single newline character in the string
const jsonEscapeRegex = /\\(["\\/bfnrt]|u[0-9a-fA-F]{4})/g;
const jsonEscapeMap = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t'
};


/**
 * Implements the FHIRPath `unescape(format)` function.
 * Supports `html` and `json`.
 * See https://build.fhir.org/ig/HL7/FHIRPath/#unescapetarget--string--string.
 * @param {Array} coll - input collection.
 * @param {string} format - unescaping format.
 * @returns {string|[]} unescaped string, or an empty collection.
 */
engine.unescapeFn = function (coll, format) {
  const str = misc.singleton(coll, 'String');
  if (util.isEmpty(str)) {
    return [];
  }
  if (format === 'html') {
    return str.replace(htmlUnescapeRegex, entity => htmlUnescapeMap[entity]);
  }
  if (format === 'json') {
    return str.replace(jsonEscapeRegex, (_, capture) => {
      // single-character escape sequences like \" or \n (replacing with their single-character equivalents)
      if (capture.length === 1) {
        return jsonEscapeMap[capture];
      }
      // unicode processing \uXXXX (also a single character, but represented by 6 characters in the input string)
      return String.fromCharCode(parseInt(capture.substring(1), 16));
    });
  }
  return [];
};

module.exports = engine;
