// Generated from FHIRPath.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('../antlr4-index');
var FHIRPathListener = require('./FHIRPathListener').FHIRPathListener;
var grammarFileName = "FHIRPath.g4";

var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003A\u0097\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0005\u0002#\n\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002",
    "\u0007\u0002K\n\u0002\f\u0002\u000e\u0002N\u000b\u0002\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005",
    "\u0003W\n\u0003\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0005\u0004a\n\u0004\u0003",
    "\u0005\u0003\u0005\u0003\u0005\u0005\u0005f\n\u0005\u0003\u0006\u0003",
    "\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0005\u0006m\n\u0006\u0003",
    "\u0007\u0003\u0007\u0003\u0007\u0005\u0007r\n\u0007\u0003\u0007\u0003",
    "\u0007\u0003\b\u0003\b\u0003\b\u0007\by\n\b\f\b\u000e\b|\u000b\b\u0003",
    "\t\u0003\t\u0005\t\u0080\n\t\u0003\n\u0003\n\u0003\n\u0005\n\u0085\n",
    "\n\u0003\u000b\u0003\u000b\u0003\f\u0003\f\u0003\r\u0003\r\u0003\u000e",
    "\u0003\u000e\u0003\u000e\u0007\u000e\u0090\n\u000e\f\u000e\u000e\u000e",
    "\u0093\u000b\u000e\u0003\u000f\u0003\u000f\u0003\u000f\u0002\u0003\u0002",
    "\u0010\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a",
    "\u001c\u0002\u000e\u0003\u0002\u0006\u0007\u0003\u0002\b\u000b\u0004",
    "\u0002\u0006\u0007\f\f\u0003\u0002\u000e\u0011\u0003\u0002\u0014\u0017",
    "\u0003\u0002\u0018\u0019\u0003\u0002\u001b\u001c\u0003\u0002\u0012\u0013",
    "\u0003\u0002\"#\u0003\u0002)0\u0003\u000218\u0005\u0002\u0012\u0013",
    "\u0018\u0019;<\u0002\u00a9\u0002\"\u0003\u0002\u0002\u0002\u0004V\u0003",
    "\u0002\u0002\u0002\u0006`\u0003\u0002\u0002\u0002\bb\u0003\u0002\u0002",
    "\u0002\nl\u0003\u0002\u0002\u0002\fn\u0003\u0002\u0002\u0002\u000eu",
    "\u0003\u0002\u0002\u0002\u0010}\u0003\u0002\u0002\u0002\u0012\u0084",
    "\u0003\u0002\u0002\u0002\u0014\u0086\u0003\u0002\u0002\u0002\u0016\u0088",
    "\u0003\u0002\u0002\u0002\u0018\u008a\u0003\u0002\u0002\u0002\u001a\u008c",
    "\u0003\u0002\u0002\u0002\u001c\u0094\u0003\u0002\u0002\u0002\u001e\u001f",
    "\b\u0002\u0001\u0002\u001f#\u0005\u0004\u0003\u0002 !\t\u0002\u0002",
    "\u0002!#\u0005\u0002\u0002\r\"\u001e\u0003\u0002\u0002\u0002\" \u0003",
    "\u0002\u0002\u0002#L\u0003\u0002\u0002\u0002$%\f\f\u0002\u0002%&\t\u0003",
    "\u0002\u0002&K\u0005\u0002\u0002\r\'(\f\u000b\u0002\u0002()\t\u0004",
    "\u0002\u0002)K\u0005\u0002\u0002\f*+\f\n\u0002\u0002+,\u0007\r\u0002",
    "\u0002,K\u0005\u0002\u0002\u000b-.\f\t\u0002\u0002./\t\u0005\u0002\u0002",
    "/K\u0005\u0002\u0002\n01\f\u0007\u0002\u000212\t\u0006\u0002\u00022",
    "K\u0005\u0002\u0002\b34\f\u0006\u0002\u000245\t\u0007\u0002\u00025K",
    "\u0005\u0002\u0002\u000767\f\u0005\u0002\u000278\u0007\u001a\u0002\u0002",
    "8K\u0005\u0002\u0002\u00069:\f\u0004\u0002\u0002:;\t\b\u0002\u0002;",
    "K\u0005\u0002\u0002\u0005<=\f\u0003\u0002\u0002=>\u0007\u001d\u0002",
    "\u0002>K\u0005\u0002\u0002\u0004?@\f\u000f\u0002\u0002@A\u0007\u0003",
    "\u0002\u0002AK\u0005\n\u0006\u0002BC\f\u000e\u0002\u0002CD\u0007\u0004",
    "\u0002\u0002DE\u0005\u0002\u0002\u0002EF\u0007\u0005\u0002\u0002FK\u0003",
    "\u0002\u0002\u0002GH\f\b\u0002\u0002HI\t\t\u0002\u0002IK\u0005\u0018",
    "\r\u0002J$\u0003\u0002\u0002\u0002J\'\u0003\u0002\u0002\u0002J*\u0003",
    "\u0002\u0002\u0002J-\u0003\u0002\u0002\u0002J0\u0003\u0002\u0002\u0002",
    "J3\u0003\u0002\u0002\u0002J6\u0003\u0002\u0002\u0002J9\u0003\u0002\u0002",
    "\u0002J<\u0003\u0002\u0002\u0002J?\u0003\u0002\u0002\u0002JB\u0003\u0002",
    "\u0002\u0002JG\u0003\u0002\u0002\u0002KN\u0003\u0002\u0002\u0002LJ\u0003",
    "\u0002\u0002\u0002LM\u0003\u0002\u0002\u0002M\u0003\u0003\u0002\u0002",
    "\u0002NL\u0003\u0002\u0002\u0002OW\u0005\n\u0006\u0002PW\u0005\u0006",
    "\u0004\u0002QW\u0005\b\u0005\u0002RS\u0007\u001e\u0002\u0002ST\u0005",
    "\u0002\u0002\u0002TU\u0007\u001f\u0002\u0002UW\u0003\u0002\u0002\u0002",
    "VO\u0003\u0002\u0002\u0002VP\u0003\u0002\u0002\u0002VQ\u0003\u0002\u0002",
    "\u0002VR\u0003\u0002\u0002\u0002W\u0005\u0003\u0002\u0002\u0002XY\u0007",
    " \u0002\u0002Ya\u0007!\u0002\u0002Za\t\n\u0002\u0002[a\u0007=\u0002",
    "\u0002\\a\u0007>\u0002\u0002]a\u00079\u0002\u0002^a\u0007:\u0002\u0002",
    "_a\u0005\u0010\t\u0002`X\u0003\u0002\u0002\u0002`Z\u0003\u0002\u0002",
    "\u0002`[\u0003\u0002\u0002\u0002`\\\u0003\u0002\u0002\u0002`]\u0003",
    "\u0002\u0002\u0002`^\u0003\u0002\u0002\u0002`_\u0003\u0002\u0002\u0002",
    "a\u0007\u0003\u0002\u0002\u0002be\u0007$\u0002\u0002cf\u0005\u001c\u000f",
    "\u0002df\u0007=\u0002\u0002ec\u0003\u0002\u0002\u0002ed\u0003\u0002",
    "\u0002\u0002f\t\u0003\u0002\u0002\u0002gm\u0005\u001c\u000f\u0002hm",
    "\u0005\f\u0007\u0002im\u0007%\u0002\u0002jm\u0007&\u0002\u0002km\u0007",
    "\'\u0002\u0002lg\u0003\u0002\u0002\u0002lh\u0003\u0002\u0002\u0002l",
    "i\u0003\u0002\u0002\u0002lj\u0003\u0002\u0002\u0002lk\u0003\u0002\u0002",
    "\u0002m\u000b\u0003\u0002\u0002\u0002no\u0005\u001c\u000f\u0002oq\u0007",
    "\u001e\u0002\u0002pr\u0005\u000e\b\u0002qp\u0003\u0002\u0002\u0002q",
    "r\u0003\u0002\u0002\u0002rs\u0003\u0002\u0002\u0002st\u0007\u001f\u0002",
    "\u0002t\r\u0003\u0002\u0002\u0002uz\u0005\u0002\u0002\u0002vw\u0007",
    "(\u0002\u0002wy\u0005\u0002\u0002\u0002xv\u0003\u0002\u0002\u0002y|",
    "\u0003\u0002\u0002\u0002zx\u0003\u0002\u0002\u0002z{\u0003\u0002\u0002",
    "\u0002{\u000f\u0003\u0002\u0002\u0002|z\u0003\u0002\u0002\u0002}\u007f",
    "\u0007>\u0002\u0002~\u0080\u0005\u0012\n\u0002\u007f~\u0003\u0002\u0002",
    "\u0002\u007f\u0080\u0003\u0002\u0002\u0002\u0080\u0011\u0003\u0002\u0002",
    "\u0002\u0081\u0085\u0005\u0014\u000b\u0002\u0082\u0085\u0005\u0016\f",
    "\u0002\u0083\u0085\u0007=\u0002\u0002\u0084\u0081\u0003\u0002\u0002",
    "\u0002\u0084\u0082\u0003\u0002\u0002\u0002\u0084\u0083\u0003\u0002\u0002",
    "\u0002\u0085\u0013\u0003\u0002\u0002\u0002\u0086\u0087\t\u000b\u0002",
    "\u0002\u0087\u0015\u0003\u0002\u0002\u0002\u0088\u0089\t\f\u0002\u0002",
    "\u0089\u0017\u0003\u0002\u0002\u0002\u008a\u008b\u0005\u001a\u000e\u0002",
    "\u008b\u0019\u0003\u0002\u0002\u0002\u008c\u0091\u0005\u001c\u000f\u0002",
    "\u008d\u008e\u0007\u0003\u0002\u0002\u008e\u0090\u0005\u001c\u000f\u0002",
    "\u008f\u008d\u0003\u0002\u0002\u0002\u0090\u0093\u0003\u0002\u0002\u0002",
    "\u0091\u008f\u0003\u0002\u0002\u0002\u0091\u0092\u0003\u0002\u0002\u0002",
    "\u0092\u001b\u0003\u0002\u0002\u0002\u0093\u0091\u0003\u0002\u0002\u0002",
    "\u0094\u0095\t\r\u0002\u0002\u0095\u001d\u0003\u0002\u0002\u0002\u000e",
    "\"JLV`elqz\u007f\u0084\u0091"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'.'", "'['", "']'", "'+'", "'-'", "'*'", "'/'", 
                     "'div'", "'mod'", "'&'", "'|'", "'<='", "'<'", "'>'", 
                     "'>='", "'is'", "'as'", "'='", "'~'", "'!='", "'!~'", 
                     "'in'", "'contains'", "'and'", "'or'", "'xor'", "'implies'", 
                     "'('", "')'", "'{'", "'}'", "'true'", "'false'", "'%'", 
                     "'$this'", "'$index'", "'$total'", "','", "'year'", 
                     "'month'", "'week'", "'day'", "'hour'", "'minute'", 
                     "'second'", "'millisecond'", "'years'", "'months'", 
                     "'weeks'", "'days'", "'hours'", "'minutes'", "'seconds'", 
                     "'milliseconds'" ];

var symbolicNames = [ null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, null, null, null, null, null, null, null, null, 
                      null, "DATETIME", "TIME", "IDENTIFIER", "DELIMITEDIDENTIFIER", 
                      "STRING", "NUMBER", "WS", "COMMENT", "LINE_COMMENT" ];

var ruleNames =  [ "expression", "term", "literal", "externalConstant", 
                   "invocation", "functn", "paramList", "quantity", "unit", 
                   "dateTimePrecision", "pluralDateTimePrecision", "typeSpecifier", 
                   "qualifiedIdentifier", "identifier" ];

function FHIRPathParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

FHIRPathParser.prototype = Object.create(antlr4.Parser.prototype);
FHIRPathParser.prototype.constructor = FHIRPathParser;

Object.defineProperty(FHIRPathParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

FHIRPathParser.EOF = antlr4.Token.EOF;
FHIRPathParser.T__0 = 1;
FHIRPathParser.T__1 = 2;
FHIRPathParser.T__2 = 3;
FHIRPathParser.T__3 = 4;
FHIRPathParser.T__4 = 5;
FHIRPathParser.T__5 = 6;
FHIRPathParser.T__6 = 7;
FHIRPathParser.T__7 = 8;
FHIRPathParser.T__8 = 9;
FHIRPathParser.T__9 = 10;
FHIRPathParser.T__10 = 11;
FHIRPathParser.T__11 = 12;
FHIRPathParser.T__12 = 13;
FHIRPathParser.T__13 = 14;
FHIRPathParser.T__14 = 15;
FHIRPathParser.T__15 = 16;
FHIRPathParser.T__16 = 17;
FHIRPathParser.T__17 = 18;
FHIRPathParser.T__18 = 19;
FHIRPathParser.T__19 = 20;
FHIRPathParser.T__20 = 21;
FHIRPathParser.T__21 = 22;
FHIRPathParser.T__22 = 23;
FHIRPathParser.T__23 = 24;
FHIRPathParser.T__24 = 25;
FHIRPathParser.T__25 = 26;
FHIRPathParser.T__26 = 27;
FHIRPathParser.T__27 = 28;
FHIRPathParser.T__28 = 29;
FHIRPathParser.T__29 = 30;
FHIRPathParser.T__30 = 31;
FHIRPathParser.T__31 = 32;
FHIRPathParser.T__32 = 33;
FHIRPathParser.T__33 = 34;
FHIRPathParser.T__34 = 35;
FHIRPathParser.T__35 = 36;
FHIRPathParser.T__36 = 37;
FHIRPathParser.T__37 = 38;
FHIRPathParser.T__38 = 39;
FHIRPathParser.T__39 = 40;
FHIRPathParser.T__40 = 41;
FHIRPathParser.T__41 = 42;
FHIRPathParser.T__42 = 43;
FHIRPathParser.T__43 = 44;
FHIRPathParser.T__44 = 45;
FHIRPathParser.T__45 = 46;
FHIRPathParser.T__46 = 47;
FHIRPathParser.T__47 = 48;
FHIRPathParser.T__48 = 49;
FHIRPathParser.T__49 = 50;
FHIRPathParser.T__50 = 51;
FHIRPathParser.T__51 = 52;
FHIRPathParser.T__52 = 53;
FHIRPathParser.T__53 = 54;
FHIRPathParser.DATETIME = 55;
FHIRPathParser.TIME = 56;
FHIRPathParser.IDENTIFIER = 57;
FHIRPathParser.DELIMITEDIDENTIFIER = 58;
FHIRPathParser.STRING = 59;
FHIRPathParser.NUMBER = 60;
FHIRPathParser.WS = 61;
FHIRPathParser.COMMENT = 62;
FHIRPathParser.LINE_COMMENT = 63;

FHIRPathParser.RULE_expression = 0;
FHIRPathParser.RULE_term = 1;
FHIRPathParser.RULE_literal = 2;
FHIRPathParser.RULE_externalConstant = 3;
FHIRPathParser.RULE_invocation = 4;
FHIRPathParser.RULE_functn = 5;
FHIRPathParser.RULE_paramList = 6;
FHIRPathParser.RULE_quantity = 7;
FHIRPathParser.RULE_unit = 8;
FHIRPathParser.RULE_dateTimePrecision = 9;
FHIRPathParser.RULE_pluralDateTimePrecision = 10;
FHIRPathParser.RULE_typeSpecifier = 11;
FHIRPathParser.RULE_qualifiedIdentifier = 12;
FHIRPathParser.RULE_identifier = 13;

function ExpressionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_expression;
    return this;
}

ExpressionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExpressionContext.prototype.constructor = ExpressionContext;


 
ExpressionContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};

function IndexerExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IndexerExpressionContext.prototype = Object.create(ExpressionContext.prototype);
IndexerExpressionContext.prototype.constructor = IndexerExpressionContext;

FHIRPathParser.IndexerExpressionContext = IndexerExpressionContext;

IndexerExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
IndexerExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterIndexerExpression(this);
	}
};

IndexerExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitIndexerExpression(this);
	}
};


function PolarityExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

PolarityExpressionContext.prototype = Object.create(ExpressionContext.prototype);
PolarityExpressionContext.prototype.constructor = PolarityExpressionContext;

FHIRPathParser.PolarityExpressionContext = PolarityExpressionContext;

PolarityExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};
PolarityExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterPolarityExpression(this);
	}
};

PolarityExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitPolarityExpression(this);
	}
};


function AdditiveExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AdditiveExpressionContext.prototype = Object.create(ExpressionContext.prototype);
AdditiveExpressionContext.prototype.constructor = AdditiveExpressionContext;

FHIRPathParser.AdditiveExpressionContext = AdditiveExpressionContext;

AdditiveExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
AdditiveExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterAdditiveExpression(this);
	}
};

AdditiveExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitAdditiveExpression(this);
	}
};


function MultiplicativeExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MultiplicativeExpressionContext.prototype = Object.create(ExpressionContext.prototype);
MultiplicativeExpressionContext.prototype.constructor = MultiplicativeExpressionContext;

FHIRPathParser.MultiplicativeExpressionContext = MultiplicativeExpressionContext;

MultiplicativeExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
MultiplicativeExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterMultiplicativeExpression(this);
	}
};

MultiplicativeExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitMultiplicativeExpression(this);
	}
};


function UnionExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

UnionExpressionContext.prototype = Object.create(ExpressionContext.prototype);
UnionExpressionContext.prototype.constructor = UnionExpressionContext;

FHIRPathParser.UnionExpressionContext = UnionExpressionContext;

UnionExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
UnionExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterUnionExpression(this);
	}
};

UnionExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitUnionExpression(this);
	}
};


function OrExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

OrExpressionContext.prototype = Object.create(ExpressionContext.prototype);
OrExpressionContext.prototype.constructor = OrExpressionContext;

FHIRPathParser.OrExpressionContext = OrExpressionContext;

OrExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
OrExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterOrExpression(this);
	}
};

OrExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitOrExpression(this);
	}
};


function AndExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AndExpressionContext.prototype = Object.create(ExpressionContext.prototype);
AndExpressionContext.prototype.constructor = AndExpressionContext;

FHIRPathParser.AndExpressionContext = AndExpressionContext;

AndExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
AndExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterAndExpression(this);
	}
};

AndExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitAndExpression(this);
	}
};


function MembershipExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MembershipExpressionContext.prototype = Object.create(ExpressionContext.prototype);
MembershipExpressionContext.prototype.constructor = MembershipExpressionContext;

FHIRPathParser.MembershipExpressionContext = MembershipExpressionContext;

MembershipExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
MembershipExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterMembershipExpression(this);
	}
};

MembershipExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitMembershipExpression(this);
	}
};


function InequalityExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

InequalityExpressionContext.prototype = Object.create(ExpressionContext.prototype);
InequalityExpressionContext.prototype.constructor = InequalityExpressionContext;

FHIRPathParser.InequalityExpressionContext = InequalityExpressionContext;

InequalityExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
InequalityExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterInequalityExpression(this);
	}
};

InequalityExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitInequalityExpression(this);
	}
};


function InvocationExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

InvocationExpressionContext.prototype = Object.create(ExpressionContext.prototype);
InvocationExpressionContext.prototype.constructor = InvocationExpressionContext;

FHIRPathParser.InvocationExpressionContext = InvocationExpressionContext;

InvocationExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

InvocationExpressionContext.prototype.invocation = function() {
    return this.getTypedRuleContext(InvocationContext,0);
};
InvocationExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterInvocationExpression(this);
	}
};

InvocationExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitInvocationExpression(this);
	}
};


function EqualityExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

EqualityExpressionContext.prototype = Object.create(ExpressionContext.prototype);
EqualityExpressionContext.prototype.constructor = EqualityExpressionContext;

FHIRPathParser.EqualityExpressionContext = EqualityExpressionContext;

EqualityExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
EqualityExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterEqualityExpression(this);
	}
};

EqualityExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitEqualityExpression(this);
	}
};


function ImpliesExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ImpliesExpressionContext.prototype = Object.create(ExpressionContext.prototype);
ImpliesExpressionContext.prototype.constructor = ImpliesExpressionContext;

FHIRPathParser.ImpliesExpressionContext = ImpliesExpressionContext;

ImpliesExpressionContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};
ImpliesExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterImpliesExpression(this);
	}
};

ImpliesExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitImpliesExpression(this);
	}
};


function TermExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

TermExpressionContext.prototype = Object.create(ExpressionContext.prototype);
TermExpressionContext.prototype.constructor = TermExpressionContext;

FHIRPathParser.TermExpressionContext = TermExpressionContext;

TermExpressionContext.prototype.term = function() {
    return this.getTypedRuleContext(TermContext,0);
};
TermExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterTermExpression(this);
	}
};

TermExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitTermExpression(this);
	}
};


function TypeExpressionContext(parser, ctx) {
	ExpressionContext.call(this, parser);
    ExpressionContext.prototype.copyFrom.call(this, ctx);
    return this;
}

TypeExpressionContext.prototype = Object.create(ExpressionContext.prototype);
TypeExpressionContext.prototype.constructor = TypeExpressionContext;

FHIRPathParser.TypeExpressionContext = TypeExpressionContext;

TypeExpressionContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};

TypeExpressionContext.prototype.typeSpecifier = function() {
    return this.getTypedRuleContext(TypeSpecifierContext,0);
};
TypeExpressionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterTypeExpression(this);
	}
};

TypeExpressionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitTypeExpression(this);
	}
};



FHIRPathParser.prototype.expression = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExpressionContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 0;
    this.enterRecursionRule(localctx, 0, FHIRPathParser.RULE_expression, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 32;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case FHIRPathParser.T__15:
        case FHIRPathParser.T__16:
        case FHIRPathParser.T__21:
        case FHIRPathParser.T__22:
        case FHIRPathParser.T__27:
        case FHIRPathParser.T__29:
        case FHIRPathParser.T__31:
        case FHIRPathParser.T__32:
        case FHIRPathParser.T__33:
        case FHIRPathParser.T__34:
        case FHIRPathParser.T__35:
        case FHIRPathParser.T__36:
        case FHIRPathParser.DATETIME:
        case FHIRPathParser.TIME:
        case FHIRPathParser.IDENTIFIER:
        case FHIRPathParser.DELIMITEDIDENTIFIER:
        case FHIRPathParser.STRING:
        case FHIRPathParser.NUMBER:
            localctx = new TermExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 29;
            this.term();
            break;
        case FHIRPathParser.T__3:
        case FHIRPathParser.T__4:
            localctx = new PolarityExpressionContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 30;
            _la = this._input.LA(1);
            if(!(_la===FHIRPathParser.T__3 || _la===FHIRPathParser.T__4)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 31;
            this.expression(11);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 74;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 72;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new MultiplicativeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 34;
                    if (!( this.precpred(this._ctx, 10))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
                    }
                    this.state = 35;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__5) | (1 << FHIRPathParser.T__6) | (1 << FHIRPathParser.T__7) | (1 << FHIRPathParser.T__8))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 36;
                    this.expression(11);
                    break;

                case 2:
                    localctx = new AdditiveExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 37;
                    if (!( this.precpred(this._ctx, 9))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
                    }
                    this.state = 38;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__3) | (1 << FHIRPathParser.T__4) | (1 << FHIRPathParser.T__9))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 39;
                    this.expression(10);
                    break;

                case 3:
                    localctx = new UnionExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 40;
                    if (!( this.precpred(this._ctx, 8))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                    }
                    this.state = 41;
                    this.match(FHIRPathParser.T__10);
                    this.state = 42;
                    this.expression(9);
                    break;

                case 4:
                    localctx = new InequalityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 43;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 44;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__11) | (1 << FHIRPathParser.T__12) | (1 << FHIRPathParser.T__13) | (1 << FHIRPathParser.T__14))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 45;
                    this.expression(8);
                    break;

                case 5:
                    localctx = new EqualityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 46;
                    if (!( this.precpred(this._ctx, 5))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                    }
                    this.state = 47;
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__17) | (1 << FHIRPathParser.T__18) | (1 << FHIRPathParser.T__19) | (1 << FHIRPathParser.T__20))) !== 0))) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 48;
                    this.expression(6);
                    break;

                case 6:
                    localctx = new MembershipExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 49;
                    if (!( this.precpred(this._ctx, 4))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                    }
                    this.state = 50;
                    _la = this._input.LA(1);
                    if(!(_la===FHIRPathParser.T__21 || _la===FHIRPathParser.T__22)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 51;
                    this.expression(5);
                    break;

                case 7:
                    localctx = new AndExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 52;
                    if (!( this.precpred(this._ctx, 3))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                    }
                    this.state = 53;
                    this.match(FHIRPathParser.T__23);
                    this.state = 54;
                    this.expression(4);
                    break;

                case 8:
                    localctx = new OrExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 55;
                    if (!( this.precpred(this._ctx, 2))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                    }
                    this.state = 56;
                    _la = this._input.LA(1);
                    if(!(_la===FHIRPathParser.T__24 || _la===FHIRPathParser.T__25)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 57;
                    this.expression(3);
                    break;

                case 9:
                    localctx = new ImpliesExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 58;
                    if (!( this.precpred(this._ctx, 1))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
                    }
                    this.state = 59;
                    this.match(FHIRPathParser.T__26);
                    this.state = 60;
                    this.expression(2);
                    break;

                case 10:
                    localctx = new InvocationExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 61;
                    if (!( this.precpred(this._ctx, 13))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 13)");
                    }
                    this.state = 62;
                    this.match(FHIRPathParser.T__0);
                    this.state = 63;
                    this.invocation();
                    break;

                case 11:
                    localctx = new IndexerExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 64;
                    if (!( this.precpred(this._ctx, 12))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
                    }
                    this.state = 65;
                    this.match(FHIRPathParser.T__1);
                    this.state = 66;
                    this.expression(0);
                    this.state = 67;
                    this.match(FHIRPathParser.T__2);
                    break;

                case 12:
                    localctx = new TypeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
                    this.state = 69;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 70;
                    _la = this._input.LA(1);
                    if(!(_la===FHIRPathParser.T__15 || _la===FHIRPathParser.T__16)) {
                    this._errHandler.recoverInline(this);
                    }
                    else {
                    	this._errHandler.reportMatch(this);
                        this.consume();
                    }
                    this.state = 71;
                    this.typeSpecifier();
                    break;

                } 
            }
            this.state = 76;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,2,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function TermContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_term;
    return this;
}

TermContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TermContext.prototype.constructor = TermContext;


 
TermContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function ExternalConstantTermContext(parser, ctx) {
	TermContext.call(this, parser);
    TermContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ExternalConstantTermContext.prototype = Object.create(TermContext.prototype);
ExternalConstantTermContext.prototype.constructor = ExternalConstantTermContext;

FHIRPathParser.ExternalConstantTermContext = ExternalConstantTermContext;

ExternalConstantTermContext.prototype.externalConstant = function() {
    return this.getTypedRuleContext(ExternalConstantContext,0);
};
ExternalConstantTermContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterExternalConstantTerm(this);
	}
};

ExternalConstantTermContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitExternalConstantTerm(this);
	}
};


function LiteralTermContext(parser, ctx) {
	TermContext.call(this, parser);
    TermContext.prototype.copyFrom.call(this, ctx);
    return this;
}

LiteralTermContext.prototype = Object.create(TermContext.prototype);
LiteralTermContext.prototype.constructor = LiteralTermContext;

FHIRPathParser.LiteralTermContext = LiteralTermContext;

LiteralTermContext.prototype.literal = function() {
    return this.getTypedRuleContext(LiteralContext,0);
};
LiteralTermContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterLiteralTerm(this);
	}
};

LiteralTermContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitLiteralTerm(this);
	}
};


function ParenthesizedTermContext(parser, ctx) {
	TermContext.call(this, parser);
    TermContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ParenthesizedTermContext.prototype = Object.create(TermContext.prototype);
ParenthesizedTermContext.prototype.constructor = ParenthesizedTermContext;

FHIRPathParser.ParenthesizedTermContext = ParenthesizedTermContext;

ParenthesizedTermContext.prototype.expression = function() {
    return this.getTypedRuleContext(ExpressionContext,0);
};
ParenthesizedTermContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterParenthesizedTerm(this);
	}
};

ParenthesizedTermContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitParenthesizedTerm(this);
	}
};


function InvocationTermContext(parser, ctx) {
	TermContext.call(this, parser);
    TermContext.prototype.copyFrom.call(this, ctx);
    return this;
}

InvocationTermContext.prototype = Object.create(TermContext.prototype);
InvocationTermContext.prototype.constructor = InvocationTermContext;

FHIRPathParser.InvocationTermContext = InvocationTermContext;

InvocationTermContext.prototype.invocation = function() {
    return this.getTypedRuleContext(InvocationContext,0);
};
InvocationTermContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterInvocationTerm(this);
	}
};

InvocationTermContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitInvocationTerm(this);
	}
};



FHIRPathParser.TermContext = TermContext;

FHIRPathParser.prototype.term = function() {

    var localctx = new TermContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, FHIRPathParser.RULE_term);
    try {
        this.state = 84;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case FHIRPathParser.T__15:
        case FHIRPathParser.T__16:
        case FHIRPathParser.T__21:
        case FHIRPathParser.T__22:
        case FHIRPathParser.T__34:
        case FHIRPathParser.T__35:
        case FHIRPathParser.T__36:
        case FHIRPathParser.IDENTIFIER:
        case FHIRPathParser.DELIMITEDIDENTIFIER:
            localctx = new InvocationTermContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 77;
            this.invocation();
            break;
        case FHIRPathParser.T__29:
        case FHIRPathParser.T__31:
        case FHIRPathParser.T__32:
        case FHIRPathParser.DATETIME:
        case FHIRPathParser.TIME:
        case FHIRPathParser.STRING:
        case FHIRPathParser.NUMBER:
            localctx = new LiteralTermContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 78;
            this.literal();
            break;
        case FHIRPathParser.T__33:
            localctx = new ExternalConstantTermContext(this, localctx);
            this.enterOuterAlt(localctx, 3);
            this.state = 79;
            this.externalConstant();
            break;
        case FHIRPathParser.T__27:
            localctx = new ParenthesizedTermContext(this, localctx);
            this.enterOuterAlt(localctx, 4);
            this.state = 80;
            this.match(FHIRPathParser.T__27);
            this.state = 81;
            this.expression(0);
            this.state = 82;
            this.match(FHIRPathParser.T__28);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function LiteralContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_literal;
    return this;
}

LiteralContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LiteralContext.prototype.constructor = LiteralContext;


 
LiteralContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function TimeLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

TimeLiteralContext.prototype = Object.create(LiteralContext.prototype);
TimeLiteralContext.prototype.constructor = TimeLiteralContext;

FHIRPathParser.TimeLiteralContext = TimeLiteralContext;

TimeLiteralContext.prototype.TIME = function() {
    return this.getToken(FHIRPathParser.TIME, 0);
};
TimeLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterTimeLiteral(this);
	}
};

TimeLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitTimeLiteral(this);
	}
};


function NullLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NullLiteralContext.prototype = Object.create(LiteralContext.prototype);
NullLiteralContext.prototype.constructor = NullLiteralContext;

FHIRPathParser.NullLiteralContext = NullLiteralContext;

NullLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterNullLiteral(this);
	}
};

NullLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitNullLiteral(this);
	}
};


function DateTimeLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

DateTimeLiteralContext.prototype = Object.create(LiteralContext.prototype);
DateTimeLiteralContext.prototype.constructor = DateTimeLiteralContext;

FHIRPathParser.DateTimeLiteralContext = DateTimeLiteralContext;

DateTimeLiteralContext.prototype.DATETIME = function() {
    return this.getToken(FHIRPathParser.DATETIME, 0);
};
DateTimeLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterDateTimeLiteral(this);
	}
};

DateTimeLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitDateTimeLiteral(this);
	}
};


function StringLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

StringLiteralContext.prototype = Object.create(LiteralContext.prototype);
StringLiteralContext.prototype.constructor = StringLiteralContext;

FHIRPathParser.StringLiteralContext = StringLiteralContext;

StringLiteralContext.prototype.STRING = function() {
    return this.getToken(FHIRPathParser.STRING, 0);
};
StringLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterStringLiteral(this);
	}
};

StringLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitStringLiteral(this);
	}
};


function BooleanLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

BooleanLiteralContext.prototype = Object.create(LiteralContext.prototype);
BooleanLiteralContext.prototype.constructor = BooleanLiteralContext;

FHIRPathParser.BooleanLiteralContext = BooleanLiteralContext;

BooleanLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterBooleanLiteral(this);
	}
};

BooleanLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitBooleanLiteral(this);
	}
};


function NumberLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NumberLiteralContext.prototype = Object.create(LiteralContext.prototype);
NumberLiteralContext.prototype.constructor = NumberLiteralContext;

FHIRPathParser.NumberLiteralContext = NumberLiteralContext;

NumberLiteralContext.prototype.NUMBER = function() {
    return this.getToken(FHIRPathParser.NUMBER, 0);
};
NumberLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterNumberLiteral(this);
	}
};

NumberLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitNumberLiteral(this);
	}
};


function QuantityLiteralContext(parser, ctx) {
	LiteralContext.call(this, parser);
    LiteralContext.prototype.copyFrom.call(this, ctx);
    return this;
}

QuantityLiteralContext.prototype = Object.create(LiteralContext.prototype);
QuantityLiteralContext.prototype.constructor = QuantityLiteralContext;

FHIRPathParser.QuantityLiteralContext = QuantityLiteralContext;

QuantityLiteralContext.prototype.quantity = function() {
    return this.getTypedRuleContext(QuantityContext,0);
};
QuantityLiteralContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterQuantityLiteral(this);
	}
};

QuantityLiteralContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitQuantityLiteral(this);
	}
};



FHIRPathParser.LiteralContext = LiteralContext;

FHIRPathParser.prototype.literal = function() {

    var localctx = new LiteralContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, FHIRPathParser.RULE_literal);
    var _la = 0; // Token type
    try {
        this.state = 94;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
        switch(la_) {
        case 1:
            localctx = new NullLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 86;
            this.match(FHIRPathParser.T__29);
            this.state = 87;
            this.match(FHIRPathParser.T__30);
            break;

        case 2:
            localctx = new BooleanLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 88;
            _la = this._input.LA(1);
            if(!(_la===FHIRPathParser.T__31 || _la===FHIRPathParser.T__32)) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            break;

        case 3:
            localctx = new StringLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 3);
            this.state = 89;
            this.match(FHIRPathParser.STRING);
            break;

        case 4:
            localctx = new NumberLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 4);
            this.state = 90;
            this.match(FHIRPathParser.NUMBER);
            break;

        case 5:
            localctx = new DateTimeLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 5);
            this.state = 91;
            this.match(FHIRPathParser.DATETIME);
            break;

        case 6:
            localctx = new TimeLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 6);
            this.state = 92;
            this.match(FHIRPathParser.TIME);
            break;

        case 7:
            localctx = new QuantityLiteralContext(this, localctx);
            this.enterOuterAlt(localctx, 7);
            this.state = 93;
            this.quantity();
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ExternalConstantContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_externalConstant;
    return this;
}

ExternalConstantContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExternalConstantContext.prototype.constructor = ExternalConstantContext;

ExternalConstantContext.prototype.identifier = function() {
    return this.getTypedRuleContext(IdentifierContext,0);
};

ExternalConstantContext.prototype.STRING = function() {
    return this.getToken(FHIRPathParser.STRING, 0);
};

ExternalConstantContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterExternalConstant(this);
	}
};

ExternalConstantContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitExternalConstant(this);
	}
};




FHIRPathParser.ExternalConstantContext = ExternalConstantContext;

FHIRPathParser.prototype.externalConstant = function() {

    var localctx = new ExternalConstantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, FHIRPathParser.RULE_externalConstant);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 96;
        this.match(FHIRPathParser.T__33);
        this.state = 99;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case FHIRPathParser.T__15:
        case FHIRPathParser.T__16:
        case FHIRPathParser.T__21:
        case FHIRPathParser.T__22:
        case FHIRPathParser.IDENTIFIER:
        case FHIRPathParser.DELIMITEDIDENTIFIER:
            this.state = 97;
            this.identifier();
            break;
        case FHIRPathParser.STRING:
            this.state = 98;
            this.match(FHIRPathParser.STRING);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function InvocationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_invocation;
    return this;
}

InvocationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InvocationContext.prototype.constructor = InvocationContext;


 
InvocationContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function TotalInvocationContext(parser, ctx) {
	InvocationContext.call(this, parser);
    InvocationContext.prototype.copyFrom.call(this, ctx);
    return this;
}

TotalInvocationContext.prototype = Object.create(InvocationContext.prototype);
TotalInvocationContext.prototype.constructor = TotalInvocationContext;

FHIRPathParser.TotalInvocationContext = TotalInvocationContext;

TotalInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterTotalInvocation(this);
	}
};

TotalInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitTotalInvocation(this);
	}
};


function ThisInvocationContext(parser, ctx) {
	InvocationContext.call(this, parser);
    InvocationContext.prototype.copyFrom.call(this, ctx);
    return this;
}

ThisInvocationContext.prototype = Object.create(InvocationContext.prototype);
ThisInvocationContext.prototype.constructor = ThisInvocationContext;

FHIRPathParser.ThisInvocationContext = ThisInvocationContext;

ThisInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterThisInvocation(this);
	}
};

ThisInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitThisInvocation(this);
	}
};


function IndexInvocationContext(parser, ctx) {
	InvocationContext.call(this, parser);
    InvocationContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IndexInvocationContext.prototype = Object.create(InvocationContext.prototype);
IndexInvocationContext.prototype.constructor = IndexInvocationContext;

FHIRPathParser.IndexInvocationContext = IndexInvocationContext;

IndexInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterIndexInvocation(this);
	}
};

IndexInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitIndexInvocation(this);
	}
};


function FunctionInvocationContext(parser, ctx) {
	InvocationContext.call(this, parser);
    InvocationContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FunctionInvocationContext.prototype = Object.create(InvocationContext.prototype);
FunctionInvocationContext.prototype.constructor = FunctionInvocationContext;

FHIRPathParser.FunctionInvocationContext = FunctionInvocationContext;

FunctionInvocationContext.prototype.functn = function() {
    return this.getTypedRuleContext(FunctnContext,0);
};
FunctionInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterFunctionInvocation(this);
	}
};

FunctionInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitFunctionInvocation(this);
	}
};


function MemberInvocationContext(parser, ctx) {
	InvocationContext.call(this, parser);
    InvocationContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MemberInvocationContext.prototype = Object.create(InvocationContext.prototype);
MemberInvocationContext.prototype.constructor = MemberInvocationContext;

FHIRPathParser.MemberInvocationContext = MemberInvocationContext;

MemberInvocationContext.prototype.identifier = function() {
    return this.getTypedRuleContext(IdentifierContext,0);
};
MemberInvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterMemberInvocation(this);
	}
};

MemberInvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitMemberInvocation(this);
	}
};



FHIRPathParser.InvocationContext = InvocationContext;

FHIRPathParser.prototype.invocation = function() {

    var localctx = new InvocationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, FHIRPathParser.RULE_invocation);
    try {
        this.state = 106;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
        switch(la_) {
        case 1:
            localctx = new MemberInvocationContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 101;
            this.identifier();
            break;

        case 2:
            localctx = new FunctionInvocationContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 102;
            this.functn();
            break;

        case 3:
            localctx = new ThisInvocationContext(this, localctx);
            this.enterOuterAlt(localctx, 3);
            this.state = 103;
            this.match(FHIRPathParser.T__34);
            break;

        case 4:
            localctx = new IndexInvocationContext(this, localctx);
            this.enterOuterAlt(localctx, 4);
            this.state = 104;
            this.match(FHIRPathParser.T__35);
            break;

        case 5:
            localctx = new TotalInvocationContext(this, localctx);
            this.enterOuterAlt(localctx, 5);
            this.state = 105;
            this.match(FHIRPathParser.T__36);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function FunctnContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_functn;
    return this;
}

FunctnContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FunctnContext.prototype.constructor = FunctnContext;

FunctnContext.prototype.identifier = function() {
    return this.getTypedRuleContext(IdentifierContext,0);
};

FunctnContext.prototype.paramList = function() {
    return this.getTypedRuleContext(ParamListContext,0);
};

FunctnContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterFunctn(this);
	}
};

FunctnContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitFunctn(this);
	}
};




FHIRPathParser.FunctnContext = FunctnContext;

FHIRPathParser.prototype.functn = function() {

    var localctx = new FunctnContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, FHIRPathParser.RULE_functn);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 108;
        this.identifier();
        this.state = 109;
        this.match(FHIRPathParser.T__27);
        this.state = 111;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__3) | (1 << FHIRPathParser.T__4) | (1 << FHIRPathParser.T__15) | (1 << FHIRPathParser.T__16) | (1 << FHIRPathParser.T__21) | (1 << FHIRPathParser.T__22) | (1 << FHIRPathParser.T__27) | (1 << FHIRPathParser.T__29))) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & ((1 << (FHIRPathParser.T__31 - 32)) | (1 << (FHIRPathParser.T__32 - 32)) | (1 << (FHIRPathParser.T__33 - 32)) | (1 << (FHIRPathParser.T__34 - 32)) | (1 << (FHIRPathParser.T__35 - 32)) | (1 << (FHIRPathParser.T__36 - 32)) | (1 << (FHIRPathParser.DATETIME - 32)) | (1 << (FHIRPathParser.TIME - 32)) | (1 << (FHIRPathParser.IDENTIFIER - 32)) | (1 << (FHIRPathParser.DELIMITEDIDENTIFIER - 32)) | (1 << (FHIRPathParser.STRING - 32)) | (1 << (FHIRPathParser.NUMBER - 32)))) !== 0)) {
            this.state = 110;
            this.paramList();
        }

        this.state = 113;
        this.match(FHIRPathParser.T__28);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function ParamListContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_paramList;
    return this;
}

ParamListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParamListContext.prototype.constructor = ParamListContext;

ParamListContext.prototype.expression = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExpressionContext);
    } else {
        return this.getTypedRuleContext(ExpressionContext,i);
    }
};

ParamListContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterParamList(this);
	}
};

ParamListContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitParamList(this);
	}
};




FHIRPathParser.ParamListContext = ParamListContext;

FHIRPathParser.prototype.paramList = function() {

    var localctx = new ParamListContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, FHIRPathParser.RULE_paramList);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 115;
        this.expression(0);
        this.state = 120;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===FHIRPathParser.T__37) {
            this.state = 116;
            this.match(FHIRPathParser.T__37);
            this.state = 117;
            this.expression(0);
            this.state = 122;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function QuantityContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_quantity;
    return this;
}

QuantityContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QuantityContext.prototype.constructor = QuantityContext;

QuantityContext.prototype.NUMBER = function() {
    return this.getToken(FHIRPathParser.NUMBER, 0);
};

QuantityContext.prototype.unit = function() {
    return this.getTypedRuleContext(UnitContext,0);
};

QuantityContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterQuantity(this);
	}
};

QuantityContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitQuantity(this);
	}
};




FHIRPathParser.QuantityContext = QuantityContext;

FHIRPathParser.prototype.quantity = function() {

    var localctx = new QuantityContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, FHIRPathParser.RULE_quantity);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 123;
        this.match(FHIRPathParser.NUMBER);
        this.state = 125;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
        if(la_===1) {
            this.state = 124;
            this.unit();

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function UnitContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_unit;
    return this;
}

UnitContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnitContext.prototype.constructor = UnitContext;

UnitContext.prototype.dateTimePrecision = function() {
    return this.getTypedRuleContext(DateTimePrecisionContext,0);
};

UnitContext.prototype.pluralDateTimePrecision = function() {
    return this.getTypedRuleContext(PluralDateTimePrecisionContext,0);
};

UnitContext.prototype.STRING = function() {
    return this.getToken(FHIRPathParser.STRING, 0);
};

UnitContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterUnit(this);
	}
};

UnitContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitUnit(this);
	}
};




FHIRPathParser.UnitContext = UnitContext;

FHIRPathParser.prototype.unit = function() {

    var localctx = new UnitContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, FHIRPathParser.RULE_unit);
    try {
        this.state = 130;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case FHIRPathParser.T__38:
        case FHIRPathParser.T__39:
        case FHIRPathParser.T__40:
        case FHIRPathParser.T__41:
        case FHIRPathParser.T__42:
        case FHIRPathParser.T__43:
        case FHIRPathParser.T__44:
        case FHIRPathParser.T__45:
            this.enterOuterAlt(localctx, 1);
            this.state = 127;
            this.dateTimePrecision();
            break;
        case FHIRPathParser.T__46:
        case FHIRPathParser.T__47:
        case FHIRPathParser.T__48:
        case FHIRPathParser.T__49:
        case FHIRPathParser.T__50:
        case FHIRPathParser.T__51:
        case FHIRPathParser.T__52:
        case FHIRPathParser.T__53:
            this.enterOuterAlt(localctx, 2);
            this.state = 128;
            this.pluralDateTimePrecision();
            break;
        case FHIRPathParser.STRING:
            this.enterOuterAlt(localctx, 3);
            this.state = 129;
            this.match(FHIRPathParser.STRING);
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function DateTimePrecisionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_dateTimePrecision;
    return this;
}

DateTimePrecisionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DateTimePrecisionContext.prototype.constructor = DateTimePrecisionContext;


DateTimePrecisionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterDateTimePrecision(this);
	}
};

DateTimePrecisionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitDateTimePrecision(this);
	}
};




FHIRPathParser.DateTimePrecisionContext = DateTimePrecisionContext;

FHIRPathParser.prototype.dateTimePrecision = function() {

    var localctx = new DateTimePrecisionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, FHIRPathParser.RULE_dateTimePrecision);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 132;
        _la = this._input.LA(1);
        if(!(((((_la - 39)) & ~0x1f) == 0 && ((1 << (_la - 39)) & ((1 << (FHIRPathParser.T__38 - 39)) | (1 << (FHIRPathParser.T__39 - 39)) | (1 << (FHIRPathParser.T__40 - 39)) | (1 << (FHIRPathParser.T__41 - 39)) | (1 << (FHIRPathParser.T__42 - 39)) | (1 << (FHIRPathParser.T__43 - 39)) | (1 << (FHIRPathParser.T__44 - 39)) | (1 << (FHIRPathParser.T__45 - 39)))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function PluralDateTimePrecisionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_pluralDateTimePrecision;
    return this;
}

PluralDateTimePrecisionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
PluralDateTimePrecisionContext.prototype.constructor = PluralDateTimePrecisionContext;


PluralDateTimePrecisionContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterPluralDateTimePrecision(this);
	}
};

PluralDateTimePrecisionContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitPluralDateTimePrecision(this);
	}
};




FHIRPathParser.PluralDateTimePrecisionContext = PluralDateTimePrecisionContext;

FHIRPathParser.prototype.pluralDateTimePrecision = function() {

    var localctx = new PluralDateTimePrecisionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, FHIRPathParser.RULE_pluralDateTimePrecision);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 134;
        _la = this._input.LA(1);
        if(!(((((_la - 47)) & ~0x1f) == 0 && ((1 << (_la - 47)) & ((1 << (FHIRPathParser.T__46 - 47)) | (1 << (FHIRPathParser.T__47 - 47)) | (1 << (FHIRPathParser.T__48 - 47)) | (1 << (FHIRPathParser.T__49 - 47)) | (1 << (FHIRPathParser.T__50 - 47)) | (1 << (FHIRPathParser.T__51 - 47)) | (1 << (FHIRPathParser.T__52 - 47)) | (1 << (FHIRPathParser.T__53 - 47)))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function TypeSpecifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_typeSpecifier;
    return this;
}

TypeSpecifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeSpecifierContext.prototype.constructor = TypeSpecifierContext;

TypeSpecifierContext.prototype.qualifiedIdentifier = function() {
    return this.getTypedRuleContext(QualifiedIdentifierContext,0);
};

TypeSpecifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterTypeSpecifier(this);
	}
};

TypeSpecifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitTypeSpecifier(this);
	}
};




FHIRPathParser.TypeSpecifierContext = TypeSpecifierContext;

FHIRPathParser.prototype.typeSpecifier = function() {

    var localctx = new TypeSpecifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, FHIRPathParser.RULE_typeSpecifier);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 136;
        this.qualifiedIdentifier();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function QualifiedIdentifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_qualifiedIdentifier;
    return this;
}

QualifiedIdentifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
QualifiedIdentifierContext.prototype.constructor = QualifiedIdentifierContext;

QualifiedIdentifierContext.prototype.identifier = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(IdentifierContext);
    } else {
        return this.getTypedRuleContext(IdentifierContext,i);
    }
};

QualifiedIdentifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterQualifiedIdentifier(this);
	}
};

QualifiedIdentifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitQualifiedIdentifier(this);
	}
};




FHIRPathParser.QualifiedIdentifierContext = QualifiedIdentifierContext;

FHIRPathParser.prototype.qualifiedIdentifier = function() {

    var localctx = new QualifiedIdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, FHIRPathParser.RULE_qualifiedIdentifier);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 138;
        this.identifier();
        this.state = 143;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,11,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 139;
                this.match(FHIRPathParser.T__0);
                this.state = 140;
                this.identifier(); 
            }
            this.state = 145;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,11,this._ctx);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function IdentifierContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = FHIRPathParser.RULE_identifier;
    return this;
}

IdentifierContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
IdentifierContext.prototype.constructor = IdentifierContext;

IdentifierContext.prototype.IDENTIFIER = function() {
    return this.getToken(FHIRPathParser.IDENTIFIER, 0);
};

IdentifierContext.prototype.DELIMITEDIDENTIFIER = function() {
    return this.getToken(FHIRPathParser.DELIMITEDIDENTIFIER, 0);
};

IdentifierContext.prototype.enterRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.enterIdentifier(this);
	}
};

IdentifierContext.prototype.exitRule = function(listener) {
    if(listener instanceof FHIRPathListener ) {
        listener.exitIdentifier(this);
	}
};




FHIRPathParser.IdentifierContext = IdentifierContext;

FHIRPathParser.prototype.identifier = function() {

    var localctx = new IdentifierContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, FHIRPathParser.RULE_identifier);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 146;
        _la = this._input.LA(1);
        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__15) | (1 << FHIRPathParser.T__16) | (1 << FHIRPathParser.T__21) | (1 << FHIRPathParser.T__22))) !== 0) || _la===FHIRPathParser.IDENTIFIER || _la===FHIRPathParser.DELIMITEDIDENTIFIER)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


FHIRPathParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 0:
			return this.expression_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

FHIRPathParser.prototype.expression_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 10);
		case 1:
			return this.precpred(this._ctx, 9);
		case 2:
			return this.precpred(this._ctx, 8);
		case 3:
			return this.precpred(this._ctx, 7);
		case 4:
			return this.precpred(this._ctx, 5);
		case 5:
			return this.precpred(this._ctx, 4);
		case 6:
			return this.precpred(this._ctx, 3);
		case 7:
			return this.precpred(this._ctx, 2);
		case 8:
			return this.precpred(this._ctx, 1);
		case 9:
			return this.precpred(this._ctx, 13);
		case 10:
			return this.precpred(this._ctx, 12);
		case 11:
			return this.precpred(this._ctx, 6);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.FHIRPathParser = FHIRPathParser;
