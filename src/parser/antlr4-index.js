// This is a modified version of antr4's index.js, in which
// the "require" statements of two unused classes are commented out
// to avoid introducing a dependency on Node.js' "fs" package.

/* Copyright (c) 2012-2017 The ANTLR Project. All rights reserved.
 * Use of this file is governed by the BSD 3-clause license that
 * can be found in the LICENSE.txt file in the project root.
 */
exports.atn = require('antlr4/atn/index');
exports.codepointat = require('antlr4/polyfills/codepointat');
exports.dfa = require('antlr4/dfa/index');
exports.fromcodepoint = require('antlr4/polyfills/fromcodepoint');
exports.tree = require('antlr4/tree/index');
exports.error = require('antlr4/error/index');
exports.Token = require('antlr4/Token').Token;
// Commented out to avoid the problem with 'fs' during the webpack build
// exports.CharStreams = require('antlr4/CharStreams').CharStreams;
exports.CommonToken = require('antlr4/Token').CommonToken;
exports.InputStream = require('antlr4/InputStream').InputStream;
// Commented out to avoid the problem with 'fs' during the webpack build
// exports.FileStream = require('antlr4/FileStream').FileStream;
exports.CommonTokenStream = require('antlr4/CommonTokenStream').CommonTokenStream;
exports.Lexer = require('antlr4/Lexer').Lexer;
exports.Parser = require('antlr4/Parser').Parser;
var pc = require('antlr4/PredictionContext');
exports.PredictionContextCache = pc.PredictionContextCache;
exports.ParserRuleContext = require('antlr4/ParserRuleContext').ParserRuleContext;
exports.Interval = require('antlr4/IntervalSet').Interval;
exports.Utils = require('antlr4/Utils');