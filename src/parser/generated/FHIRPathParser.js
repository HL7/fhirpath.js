// Generated from FHIRPath.g4 by ANTLR 4.9.3
// jshint ignore: start
const antlr4 = require('../antlr4-index');
const FHIRPathListener = require('./FHIRPathListener');

const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003A\u009c\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004",
    "\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007",
    "\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f",
    "\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0005\u0003(\n\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0007\u0003",
    "P\n\u0003\f\u0003\u000e\u0003S\u000b\u0003\u0003\u0004\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0005\u0004\\",
    "\n\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005f\n\u0005\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0005\u0006k\n\u0006\u0003\u0007\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0005\u0007r\n\u0007\u0003\b\u0003",
    "\b\u0003\b\u0005\bw\n\b\u0003\b\u0003\b\u0003\t\u0003\t\u0003\t\u0007",
    "\t~\n\t\f\t\u000e\t\u0081\u000b\t\u0003\n\u0003\n\u0005\n\u0085\n\n",
    "\u0003\u000b\u0003\u000b\u0003\u000b\u0005\u000b\u008a\n\u000b\u0003",
    "\f\u0003\f\u0003\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000f\u0003",
    "\u000f\u0003\u000f\u0007\u000f\u0095\n\u000f\f\u000f\u000e\u000f\u0098",
    "\u000b\u000f\u0003\u0010\u0003\u0010\u0003\u0010\u0002\u0003\u0004\u0011",
    "\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c",
    "\u001e\u0002\u000e\u0003\u0002\u0006\u0007\u0003\u0002\b\u000b\u0004",
    "\u0002\u0006\u0007\f\f\u0003\u0002\u000e\u0011\u0003\u0002\u0014\u0017",
    "\u0003\u0002\u0018\u0019\u0003\u0002\u001b\u001c\u0003\u0002\u0012\u0013",
    "\u0003\u0002\"#\u0003\u0002)0\u0003\u000218\u0005\u0002\u0012\u0013",
    "\u0018\u0019;<\u0002\u00ad\u0002 \u0003\u0002\u0002\u0002\u0004\'\u0003",
    "\u0002\u0002\u0002\u0006[\u0003\u0002\u0002\u0002\be\u0003\u0002\u0002",
    "\u0002\ng\u0003\u0002\u0002\u0002\fq\u0003\u0002\u0002\u0002\u000es",
    "\u0003\u0002\u0002\u0002\u0010z\u0003\u0002\u0002\u0002\u0012\u0082",
    "\u0003\u0002\u0002\u0002\u0014\u0089\u0003\u0002\u0002\u0002\u0016\u008b",
    "\u0003\u0002\u0002\u0002\u0018\u008d\u0003\u0002\u0002\u0002\u001a\u008f",
    "\u0003\u0002\u0002\u0002\u001c\u0091\u0003\u0002\u0002\u0002\u001e\u0099",
    "\u0003\u0002\u0002\u0002 !\u0005\u0004\u0003\u0002!\"\u0007\u0002\u0002",
    "\u0003\"\u0003\u0003\u0002\u0002\u0002#$\b\u0003\u0001\u0002$(\u0005",
    "\u0006\u0004\u0002%&\t\u0002\u0002\u0002&(\u0005\u0004\u0003\r\'#\u0003",
    "\u0002\u0002\u0002\'%\u0003\u0002\u0002\u0002(Q\u0003\u0002\u0002\u0002",
    ")*\f\f\u0002\u0002*+\t\u0003\u0002\u0002+P\u0005\u0004\u0003\r,-\f\u000b",
    "\u0002\u0002-.\t\u0004\u0002\u0002.P\u0005\u0004\u0003\f/0\f\n\u0002",
    "\u000201\u0007\r\u0002\u00021P\u0005\u0004\u0003\u000b23\f\t\u0002\u0002",
    "34\t\u0005\u0002\u00024P\u0005\u0004\u0003\n56\f\u0007\u0002\u00026",
    "7\t\u0006\u0002\u00027P\u0005\u0004\u0003\b89\f\u0006\u0002\u00029:",
    "\t\u0007\u0002\u0002:P\u0005\u0004\u0003\u0007;<\f\u0005\u0002\u0002",
    "<=\u0007\u001a\u0002\u0002=P\u0005\u0004\u0003\u0006>?\f\u0004\u0002",
    "\u0002?@\t\b\u0002\u0002@P\u0005\u0004\u0003\u0005AB\f\u0003\u0002\u0002",
    "BC\u0007\u001d\u0002\u0002CP\u0005\u0004\u0003\u0004DE\f\u000f\u0002",
    "\u0002EF\u0007\u0003\u0002\u0002FP\u0005\f\u0007\u0002GH\f\u000e\u0002",
    "\u0002HI\u0007\u0004\u0002\u0002IJ\u0005\u0004\u0003\u0002JK\u0007\u0005",
    "\u0002\u0002KP\u0003\u0002\u0002\u0002LM\f\b\u0002\u0002MN\t\t\u0002",
    "\u0002NP\u0005\u001a\u000e\u0002O)\u0003\u0002\u0002\u0002O,\u0003\u0002",
    "\u0002\u0002O/\u0003\u0002\u0002\u0002O2\u0003\u0002\u0002\u0002O5\u0003",
    "\u0002\u0002\u0002O8\u0003\u0002\u0002\u0002O;\u0003\u0002\u0002\u0002",
    "O>\u0003\u0002\u0002\u0002OA\u0003\u0002\u0002\u0002OD\u0003\u0002\u0002",
    "\u0002OG\u0003\u0002\u0002\u0002OL\u0003\u0002\u0002\u0002PS\u0003\u0002",
    "\u0002\u0002QO\u0003\u0002\u0002\u0002QR\u0003\u0002\u0002\u0002R\u0005",
    "\u0003\u0002\u0002\u0002SQ\u0003\u0002\u0002\u0002T\\\u0005\f\u0007",
    "\u0002U\\\u0005\b\u0005\u0002V\\\u0005\n\u0006\u0002WX\u0007\u001e\u0002",
    "\u0002XY\u0005\u0004\u0003\u0002YZ\u0007\u001f\u0002\u0002Z\\\u0003",
    "\u0002\u0002\u0002[T\u0003\u0002\u0002\u0002[U\u0003\u0002\u0002\u0002",
    "[V\u0003\u0002\u0002\u0002[W\u0003\u0002\u0002\u0002\\\u0007\u0003\u0002",
    "\u0002\u0002]^\u0007 \u0002\u0002^f\u0007!\u0002\u0002_f\t\n\u0002\u0002",
    "`f\u0007=\u0002\u0002af\u0007>\u0002\u0002bf\u00079\u0002\u0002cf\u0007",
    ":\u0002\u0002df\u0005\u0012\n\u0002e]\u0003\u0002\u0002\u0002e_\u0003",
    "\u0002\u0002\u0002e`\u0003\u0002\u0002\u0002ea\u0003\u0002\u0002\u0002",
    "eb\u0003\u0002\u0002\u0002ec\u0003\u0002\u0002\u0002ed\u0003\u0002\u0002",
    "\u0002f\t\u0003\u0002\u0002\u0002gj\u0007$\u0002\u0002hk\u0005\u001e",
    "\u0010\u0002ik\u0007=\u0002\u0002jh\u0003\u0002\u0002\u0002ji\u0003",
    "\u0002\u0002\u0002k\u000b\u0003\u0002\u0002\u0002lr\u0005\u001e\u0010",
    "\u0002mr\u0005\u000e\b\u0002nr\u0007%\u0002\u0002or\u0007&\u0002\u0002",
    "pr\u0007\'\u0002\u0002ql\u0003\u0002\u0002\u0002qm\u0003\u0002\u0002",
    "\u0002qn\u0003\u0002\u0002\u0002qo\u0003\u0002\u0002\u0002qp\u0003\u0002",
    "\u0002\u0002r\r\u0003\u0002\u0002\u0002st\u0005\u001e\u0010\u0002tv",
    "\u0007\u001e\u0002\u0002uw\u0005\u0010\t\u0002vu\u0003\u0002\u0002\u0002",
    "vw\u0003\u0002\u0002\u0002wx\u0003\u0002\u0002\u0002xy\u0007\u001f\u0002",
    "\u0002y\u000f\u0003\u0002\u0002\u0002z\u007f\u0005\u0004\u0003\u0002",
    "{|\u0007(\u0002\u0002|~\u0005\u0004\u0003\u0002}{\u0003\u0002\u0002",
    "\u0002~\u0081\u0003\u0002\u0002\u0002\u007f}\u0003\u0002\u0002\u0002",
    "\u007f\u0080\u0003\u0002\u0002\u0002\u0080\u0011\u0003\u0002\u0002\u0002",
    "\u0081\u007f\u0003\u0002\u0002\u0002\u0082\u0084\u0007>\u0002\u0002",
    "\u0083\u0085\u0005\u0014\u000b\u0002\u0084\u0083\u0003\u0002\u0002\u0002",
    "\u0084\u0085\u0003\u0002\u0002\u0002\u0085\u0013\u0003\u0002\u0002\u0002",
    "\u0086\u008a\u0005\u0016\f\u0002\u0087\u008a\u0005\u0018\r\u0002\u0088",
    "\u008a\u0007=\u0002\u0002\u0089\u0086\u0003\u0002\u0002\u0002\u0089",
    "\u0087\u0003\u0002\u0002\u0002\u0089\u0088\u0003\u0002\u0002\u0002\u008a",
    "\u0015\u0003\u0002\u0002\u0002\u008b\u008c\t\u000b\u0002\u0002\u008c",
    "\u0017\u0003\u0002\u0002\u0002\u008d\u008e\t\f\u0002\u0002\u008e\u0019",
    "\u0003\u0002\u0002\u0002\u008f\u0090\u0005\u001c\u000f\u0002\u0090\u001b",
    "\u0003\u0002\u0002\u0002\u0091\u0096\u0005\u001e\u0010\u0002\u0092\u0093",
    "\u0007\u0003\u0002\u0002\u0093\u0095\u0005\u001e\u0010\u0002\u0094\u0092",
    "\u0003\u0002\u0002\u0002\u0095\u0098\u0003\u0002\u0002\u0002\u0096\u0094",
    "\u0003\u0002\u0002\u0002\u0096\u0097\u0003\u0002\u0002\u0002\u0097\u001d",
    "\u0003\u0002\u0002\u0002\u0098\u0096\u0003\u0002\u0002\u0002\u0099\u009a",
    "\t\r\u0002\u0002\u009a\u001f\u0003\u0002\u0002\u0002\u000e\'OQ[ejqv",
    "\u007f\u0084\u0089\u0096"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

class FHIRPathParser extends antlr4.Parser {

    static grammarFileName = "FHIRPath.g4";
    static literalNames = [ null, "'.'", "'['", "']'", "'+'", "'-'", "'*'", 
                            "'/'", "'div'", "'mod'", "'&'", "'|'", "'<='", 
                            "'<'", "'>'", "'>='", "'is'", "'as'", "'='", 
                            "'~'", "'!='", "'!~'", "'in'", "'contains'", 
                            "'and'", "'or'", "'xor'", "'implies'", "'('", 
                            "')'", "'{'", "'}'", "'true'", "'false'", "'%'", 
                            "'$this'", "'$index'", "'$total'", "','", "'year'", 
                            "'month'", "'week'", "'day'", "'hour'", "'minute'", 
                            "'second'", "'millisecond'", "'years'", "'months'", 
                            "'weeks'", "'days'", "'hours'", "'minutes'", 
                            "'seconds'", "'milliseconds'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, "DATETIME", 
                             "TIME", "IDENTIFIER", "DELIMITEDIDENTIFIER", 
                             "STRING", "NUMBER", "WS", "COMMENT", "LINE_COMMENT" ];
    static ruleNames = [ "entireExpression", "expression", "term", "literal", 
                         "externalConstant", "invocation", "functn", "paramList", 
                         "quantity", "unit", "dateTimePrecision", "pluralDateTimePrecision", 
                         "typeSpecifier", "qualifiedIdentifier", "identifier" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = FHIRPathParser.ruleNames;
        this.literalNames = FHIRPathParser.literalNames;
        this.symbolicNames = FHIRPathParser.symbolicNames;
    }

    get atn() {
        return atn;
    }

    sempred(localctx, ruleIndex, predIndex) {
    	switch(ruleIndex) {
    	case 1:
    	    		return this.expression_sempred(localctx, predIndex);
        default:
            throw "No predicate with index:" + ruleIndex;
       }
    }

    expression_sempred(localctx, predIndex) {
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




	entireExpression() {
	    let localctx = new EntireExpressionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, FHIRPathParser.RULE_entireExpression);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 30;
	        this.expression(0);
	        this.state = 31;
	        this.match(FHIRPathParser.EOF);
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
	}


	expression(_p) {
		if(_p===undefined) {
		    _p = 0;
		}
	    const _parentctx = this._ctx;
	    const _parentState = this.state;
	    let localctx = new ExpressionContext(this, this._ctx, _parentState);
	    let _prevctx = localctx;
	    const _startState = 2;
	    this.enterRecursionRule(localctx, 2, FHIRPathParser.RULE_expression, _p);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 37;
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

	            this.state = 34;
	            this.term();
	            break;
	        case FHIRPathParser.T__3:
	        case FHIRPathParser.T__4:
	            localctx = new PolarityExpressionContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 35;
	            _la = this._input.LA(1);
	            if(!(_la===FHIRPathParser.T__3 || _la===FHIRPathParser.T__4)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 36;
	            this.expression(11);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 79;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 77;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new MultiplicativeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 39;
	                    if (!( this.precpred(this._ctx, 10))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
	                    }
	                    this.state = 40;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__5) | (1 << FHIRPathParser.T__6) | (1 << FHIRPathParser.T__7) | (1 << FHIRPathParser.T__8))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 41;
	                    this.expression(11);
	                    break;

	                case 2:
	                    localctx = new AdditiveExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 42;
	                    if (!( this.precpred(this._ctx, 9))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
	                    }
	                    this.state = 43;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__3) | (1 << FHIRPathParser.T__4) | (1 << FHIRPathParser.T__9))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 44;
	                    this.expression(10);
	                    break;

	                case 3:
	                    localctx = new UnionExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 45;
	                    if (!( this.precpred(this._ctx, 8))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
	                    }
	                    this.state = 46;
	                    this.match(FHIRPathParser.T__10);
	                    this.state = 47;
	                    this.expression(9);
	                    break;

	                case 4:
	                    localctx = new InequalityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 48;
	                    if (!( this.precpred(this._ctx, 7))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
	                    }
	                    this.state = 49;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__11) | (1 << FHIRPathParser.T__12) | (1 << FHIRPathParser.T__13) | (1 << FHIRPathParser.T__14))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 50;
	                    this.expression(8);
	                    break;

	                case 5:
	                    localctx = new EqualityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 51;
	                    if (!( this.precpred(this._ctx, 5))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
	                    }
	                    this.state = 52;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__17) | (1 << FHIRPathParser.T__18) | (1 << FHIRPathParser.T__19) | (1 << FHIRPathParser.T__20))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 53;
	                    this.expression(6);
	                    break;

	                case 6:
	                    localctx = new MembershipExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 54;
	                    if (!( this.precpred(this._ctx, 4))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
	                    }
	                    this.state = 55;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__21 || _la===FHIRPathParser.T__22)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 56;
	                    this.expression(5);
	                    break;

	                case 7:
	                    localctx = new AndExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 57;
	                    if (!( this.precpred(this._ctx, 3))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
	                    }
	                    this.state = 58;
	                    this.match(FHIRPathParser.T__23);
	                    this.state = 59;
	                    this.expression(4);
	                    break;

	                case 8:
	                    localctx = new OrExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 60;
	                    if (!( this.precpred(this._ctx, 2))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
	                    }
	                    this.state = 61;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__24 || _la===FHIRPathParser.T__25)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 62;
	                    this.expression(3);
	                    break;

	                case 9:
	                    localctx = new ImpliesExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 63;
	                    if (!( this.precpred(this._ctx, 1))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
	                    }
	                    this.state = 64;
	                    this.match(FHIRPathParser.T__26);
	                    this.state = 65;
	                    this.expression(2);
	                    break;

	                case 10:
	                    localctx = new InvocationExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 66;
	                    if (!( this.precpred(this._ctx, 13))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 13)");
	                    }
	                    this.state = 67;
	                    this.match(FHIRPathParser.T__0);
	                    this.state = 68;
	                    this.invocation();
	                    break;

	                case 11:
	                    localctx = new IndexerExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 69;
	                    if (!( this.precpred(this._ctx, 12))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
	                    }
	                    this.state = 70;
	                    this.match(FHIRPathParser.T__1);
	                    this.state = 71;
	                    this.expression(0);
	                    this.state = 72;
	                    this.match(FHIRPathParser.T__2);
	                    break;

	                case 12:
	                    localctx = new TypeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 74;
	                    if (!( this.precpred(this._ctx, 6))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
	                    }
	                    this.state = 75;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__15 || _la===FHIRPathParser.T__16)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 76;
	                    this.typeSpecifier();
	                    break;

	                } 
	            }
	            this.state = 81;
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
	}



	term() {
	    let localctx = new TermContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, FHIRPathParser.RULE_term);
	    try {
	        this.state = 89;
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
	            this.state = 82;
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
	            this.state = 83;
	            this.literal();
	            break;
	        case FHIRPathParser.T__33:
	            localctx = new ExternalConstantTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 84;
	            this.externalConstant();
	            break;
	        case FHIRPathParser.T__27:
	            localctx = new ParenthesizedTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 85;
	            this.match(FHIRPathParser.T__27);
	            this.state = 86;
	            this.expression(0);
	            this.state = 87;
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
	}



	literal() {
	    let localctx = new LiteralContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, FHIRPathParser.RULE_literal);
	    var _la = 0; // Token type
	    try {
	        this.state = 99;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new NullLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 91;
	            this.match(FHIRPathParser.T__29);
	            this.state = 92;
	            this.match(FHIRPathParser.T__30);
	            break;

	        case 2:
	            localctx = new BooleanLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 93;
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
	            this.state = 94;
	            this.match(FHIRPathParser.STRING);
	            break;

	        case 4:
	            localctx = new NumberLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 95;
	            this.match(FHIRPathParser.NUMBER);
	            break;

	        case 5:
	            localctx = new DateTimeLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 96;
	            this.match(FHIRPathParser.DATETIME);
	            break;

	        case 6:
	            localctx = new TimeLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 6);
	            this.state = 97;
	            this.match(FHIRPathParser.TIME);
	            break;

	        case 7:
	            localctx = new QuantityLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 7);
	            this.state = 98;
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
	}



	externalConstant() {
	    let localctx = new ExternalConstantContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, FHIRPathParser.RULE_externalConstant);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 101;
	        this.match(FHIRPathParser.T__33);
	        this.state = 104;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case FHIRPathParser.T__15:
	        case FHIRPathParser.T__16:
	        case FHIRPathParser.T__21:
	        case FHIRPathParser.T__22:
	        case FHIRPathParser.IDENTIFIER:
	        case FHIRPathParser.DELIMITEDIDENTIFIER:
	            this.state = 102;
	            this.identifier();
	            break;
	        case FHIRPathParser.STRING:
	            this.state = 103;
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
	}



	invocation() {
	    let localctx = new InvocationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, FHIRPathParser.RULE_invocation);
	    try {
	        this.state = 111;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new MemberInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 106;
	            this.identifier();
	            break;

	        case 2:
	            localctx = new FunctionInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 107;
	            this.functn();
	            break;

	        case 3:
	            localctx = new ThisInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 108;
	            this.match(FHIRPathParser.T__34);
	            break;

	        case 4:
	            localctx = new IndexInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 109;
	            this.match(FHIRPathParser.T__35);
	            break;

	        case 5:
	            localctx = new TotalInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 110;
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
	}



	functn() {
	    let localctx = new FunctnContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, FHIRPathParser.RULE_functn);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 113;
	        this.identifier();
	        this.state = 114;
	        this.match(FHIRPathParser.T__27);
	        this.state = 116;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__3) | (1 << FHIRPathParser.T__4) | (1 << FHIRPathParser.T__15) | (1 << FHIRPathParser.T__16) | (1 << FHIRPathParser.T__21) | (1 << FHIRPathParser.T__22) | (1 << FHIRPathParser.T__27) | (1 << FHIRPathParser.T__29))) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & ((1 << (FHIRPathParser.T__31 - 32)) | (1 << (FHIRPathParser.T__32 - 32)) | (1 << (FHIRPathParser.T__33 - 32)) | (1 << (FHIRPathParser.T__34 - 32)) | (1 << (FHIRPathParser.T__35 - 32)) | (1 << (FHIRPathParser.T__36 - 32)) | (1 << (FHIRPathParser.DATETIME - 32)) | (1 << (FHIRPathParser.TIME - 32)) | (1 << (FHIRPathParser.IDENTIFIER - 32)) | (1 << (FHIRPathParser.DELIMITEDIDENTIFIER - 32)) | (1 << (FHIRPathParser.STRING - 32)) | (1 << (FHIRPathParser.NUMBER - 32)))) !== 0)) {
	            this.state = 115;
	            this.paramList();
	        }

	        this.state = 118;
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
	}



	paramList() {
	    let localctx = new ParamListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, FHIRPathParser.RULE_paramList);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 120;
	        this.expression(0);
	        this.state = 125;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===FHIRPathParser.T__37) {
	            this.state = 121;
	            this.match(FHIRPathParser.T__37);
	            this.state = 122;
	            this.expression(0);
	            this.state = 127;
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
	}



	quantity() {
	    let localctx = new QuantityContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, FHIRPathParser.RULE_quantity);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 128;
	        this.match(FHIRPathParser.NUMBER);
	        this.state = 130;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	        if(la_===1) {
	            this.state = 129;
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
	}



	unit() {
	    let localctx = new UnitContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, FHIRPathParser.RULE_unit);
	    try {
	        this.state = 135;
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
	            this.state = 132;
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
	            this.state = 133;
	            this.pluralDateTimePrecision();
	            break;
	        case FHIRPathParser.STRING:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 134;
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
	}



	dateTimePrecision() {
	    let localctx = new DateTimePrecisionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, FHIRPathParser.RULE_dateTimePrecision);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 137;
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
	}



	pluralDateTimePrecision() {
	    let localctx = new PluralDateTimePrecisionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, FHIRPathParser.RULE_pluralDateTimePrecision);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 139;
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
	}



	typeSpecifier() {
	    let localctx = new TypeSpecifierContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, FHIRPathParser.RULE_typeSpecifier);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 141;
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
	}



	qualifiedIdentifier() {
	    let localctx = new QualifiedIdentifierContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, FHIRPathParser.RULE_qualifiedIdentifier);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 143;
	        this.identifier();
	        this.state = 148;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,11,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 144;
	                this.match(FHIRPathParser.T__0);
	                this.state = 145;
	                this.identifier(); 
	            }
	            this.state = 150;
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
	}



	identifier() {
	    let localctx = new IdentifierContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, FHIRPathParser.RULE_identifier);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 151;
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
	}


}

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

FHIRPathParser.RULE_entireExpression = 0;
FHIRPathParser.RULE_expression = 1;
FHIRPathParser.RULE_term = 2;
FHIRPathParser.RULE_literal = 3;
FHIRPathParser.RULE_externalConstant = 4;
FHIRPathParser.RULE_invocation = 5;
FHIRPathParser.RULE_functn = 6;
FHIRPathParser.RULE_paramList = 7;
FHIRPathParser.RULE_quantity = 8;
FHIRPathParser.RULE_unit = 9;
FHIRPathParser.RULE_dateTimePrecision = 10;
FHIRPathParser.RULE_pluralDateTimePrecision = 11;
FHIRPathParser.RULE_typeSpecifier = 12;
FHIRPathParser.RULE_qualifiedIdentifier = 13;
FHIRPathParser.RULE_identifier = 14;

class EntireExpressionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_entireExpression;
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	EOF() {
	    return this.getToken(FHIRPathParser.EOF, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterEntireExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitEntireExpression(this);
		}
	}


}



class ExpressionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_expression;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class IndexerExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterIndexerExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitIndexerExpression(this);
		}
	}


}

FHIRPathParser.IndexerExpressionContext = IndexerExpressionContext;

class PolarityExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterPolarityExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitPolarityExpression(this);
		}
	}


}

FHIRPathParser.PolarityExpressionContext = PolarityExpressionContext;

class AdditiveExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterAdditiveExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitAdditiveExpression(this);
		}
	}


}

FHIRPathParser.AdditiveExpressionContext = AdditiveExpressionContext;

class MultiplicativeExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterMultiplicativeExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitMultiplicativeExpression(this);
		}
	}


}

FHIRPathParser.MultiplicativeExpressionContext = MultiplicativeExpressionContext;

class UnionExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterUnionExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitUnionExpression(this);
		}
	}


}

FHIRPathParser.UnionExpressionContext = UnionExpressionContext;

class OrExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterOrExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitOrExpression(this);
		}
	}


}

FHIRPathParser.OrExpressionContext = OrExpressionContext;

class AndExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterAndExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitAndExpression(this);
		}
	}


}

FHIRPathParser.AndExpressionContext = AndExpressionContext;

class MembershipExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterMembershipExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitMembershipExpression(this);
		}
	}


}

FHIRPathParser.MembershipExpressionContext = MembershipExpressionContext;

class InequalityExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInequalityExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInequalityExpression(this);
		}
	}


}

FHIRPathParser.InequalityExpressionContext = InequalityExpressionContext;

class InvocationExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	invocation() {
	    return this.getTypedRuleContext(InvocationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInvocationExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInvocationExpression(this);
		}
	}


}

FHIRPathParser.InvocationExpressionContext = InvocationExpressionContext;

class EqualityExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterEqualityExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitEqualityExpression(this);
		}
	}


}

FHIRPathParser.EqualityExpressionContext = EqualityExpressionContext;

class ImpliesExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterImpliesExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitImpliesExpression(this);
		}
	}


}

FHIRPathParser.ImpliesExpressionContext = ImpliesExpressionContext;

class TermExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	term() {
	    return this.getTypedRuleContext(TermContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterTermExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitTermExpression(this);
		}
	}


}

FHIRPathParser.TermExpressionContext = TermExpressionContext;

class TypeExpressionContext extends ExpressionContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	typeSpecifier() {
	    return this.getTypedRuleContext(TypeSpecifierContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterTypeExpression(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitTypeExpression(this);
		}
	}


}

FHIRPathParser.TypeExpressionContext = TypeExpressionContext;

class TermContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_term;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class ExternalConstantTermContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	externalConstant() {
	    return this.getTypedRuleContext(ExternalConstantContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterExternalConstantTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitExternalConstantTerm(this);
		}
	}


}

FHIRPathParser.ExternalConstantTermContext = ExternalConstantTermContext;

class LiteralTermContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	literal() {
	    return this.getTypedRuleContext(LiteralContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterLiteralTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitLiteralTerm(this);
		}
	}


}

FHIRPathParser.LiteralTermContext = LiteralTermContext;

class ParenthesizedTermContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterParenthesizedTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitParenthesizedTerm(this);
		}
	}


}

FHIRPathParser.ParenthesizedTermContext = ParenthesizedTermContext;

class InvocationTermContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	invocation() {
	    return this.getTypedRuleContext(InvocationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInvocationTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInvocationTerm(this);
		}
	}


}

FHIRPathParser.InvocationTermContext = InvocationTermContext;

class LiteralContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_literal;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class TimeLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	TIME() {
	    return this.getToken(FHIRPathParser.TIME, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterTimeLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitTimeLiteral(this);
		}
	}


}

FHIRPathParser.TimeLiteralContext = TimeLiteralContext;

class NullLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterNullLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitNullLiteral(this);
		}
	}


}

FHIRPathParser.NullLiteralContext = NullLiteralContext;

class DateTimeLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	DATETIME() {
	    return this.getToken(FHIRPathParser.DATETIME, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterDateTimeLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitDateTimeLiteral(this);
		}
	}


}

FHIRPathParser.DateTimeLiteralContext = DateTimeLiteralContext;

class StringLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	STRING() {
	    return this.getToken(FHIRPathParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterStringLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitStringLiteral(this);
		}
	}


}

FHIRPathParser.StringLiteralContext = StringLiteralContext;

class BooleanLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterBooleanLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitBooleanLiteral(this);
		}
	}


}

FHIRPathParser.BooleanLiteralContext = BooleanLiteralContext;

class NumberLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	NUMBER() {
	    return this.getToken(FHIRPathParser.NUMBER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterNumberLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitNumberLiteral(this);
		}
	}


}

FHIRPathParser.NumberLiteralContext = NumberLiteralContext;

class QuantityLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	quantity() {
	    return this.getTypedRuleContext(QuantityContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterQuantityLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitQuantityLiteral(this);
		}
	}


}

FHIRPathParser.QuantityLiteralContext = QuantityLiteralContext;

class ExternalConstantContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_externalConstant;
    }

	identifier() {
	    return this.getTypedRuleContext(IdentifierContext,0);
	};

	STRING() {
	    return this.getToken(FHIRPathParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterExternalConstant(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitExternalConstant(this);
		}
	}


}



class InvocationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_invocation;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class TotalInvocationContext extends InvocationContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterTotalInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitTotalInvocation(this);
		}
	}


}

FHIRPathParser.TotalInvocationContext = TotalInvocationContext;

class ThisInvocationContext extends InvocationContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterThisInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitThisInvocation(this);
		}
	}


}

FHIRPathParser.ThisInvocationContext = ThisInvocationContext;

class IndexInvocationContext extends InvocationContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterIndexInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitIndexInvocation(this);
		}
	}


}

FHIRPathParser.IndexInvocationContext = IndexInvocationContext;

class FunctionInvocationContext extends InvocationContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	functn() {
	    return this.getTypedRuleContext(FunctnContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterFunctionInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitFunctionInvocation(this);
		}
	}


}

FHIRPathParser.FunctionInvocationContext = FunctionInvocationContext;

class MemberInvocationContext extends InvocationContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	identifier() {
	    return this.getTypedRuleContext(IdentifierContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterMemberInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitMemberInvocation(this);
		}
	}


}

FHIRPathParser.MemberInvocationContext = MemberInvocationContext;

class FunctnContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_functn;
    }

	identifier() {
	    return this.getTypedRuleContext(IdentifierContext,0);
	};

	paramList() {
	    return this.getTypedRuleContext(ParamListContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterFunctn(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitFunctn(this);
		}
	}


}



class ParamListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_paramList;
    }

	expression = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExpressionContext);
	    } else {
	        return this.getTypedRuleContext(ExpressionContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterParamList(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitParamList(this);
		}
	}


}



class QuantityContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_quantity;
    }

	NUMBER() {
	    return this.getToken(FHIRPathParser.NUMBER, 0);
	};

	unit() {
	    return this.getTypedRuleContext(UnitContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterQuantity(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitQuantity(this);
		}
	}


}



class UnitContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_unit;
    }

	dateTimePrecision() {
	    return this.getTypedRuleContext(DateTimePrecisionContext,0);
	};

	pluralDateTimePrecision() {
	    return this.getTypedRuleContext(PluralDateTimePrecisionContext,0);
	};

	STRING() {
	    return this.getToken(FHIRPathParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterUnit(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitUnit(this);
		}
	}


}



class DateTimePrecisionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_dateTimePrecision;
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterDateTimePrecision(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitDateTimePrecision(this);
		}
	}


}



class PluralDateTimePrecisionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_pluralDateTimePrecision;
    }


	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterPluralDateTimePrecision(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitPluralDateTimePrecision(this);
		}
	}


}



class TypeSpecifierContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_typeSpecifier;
    }

	qualifiedIdentifier() {
	    return this.getTypedRuleContext(QualifiedIdentifierContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterTypeSpecifier(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitTypeSpecifier(this);
		}
	}


}



class QualifiedIdentifierContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_qualifiedIdentifier;
    }

	identifier = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(IdentifierContext);
	    } else {
	        return this.getTypedRuleContext(IdentifierContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterQualifiedIdentifier(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitQualifiedIdentifier(this);
		}
	}


}



class IdentifierContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_identifier;
    }

	IDENTIFIER() {
	    return this.getToken(FHIRPathParser.IDENTIFIER, 0);
	};

	DELIMITEDIDENTIFIER() {
	    return this.getToken(FHIRPathParser.DELIMITEDIDENTIFIER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterIdentifier(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitIdentifier(this);
		}
	}


}




FHIRPathParser.EntireExpressionContext = EntireExpressionContext; 
FHIRPathParser.ExpressionContext = ExpressionContext; 
FHIRPathParser.TermContext = TermContext; 
FHIRPathParser.LiteralContext = LiteralContext; 
FHIRPathParser.ExternalConstantContext = ExternalConstantContext; 
FHIRPathParser.InvocationContext = InvocationContext; 
FHIRPathParser.FunctnContext = FunctnContext; 
FHIRPathParser.ParamListContext = ParamListContext; 
FHIRPathParser.QuantityContext = QuantityContext; 
FHIRPathParser.UnitContext = UnitContext; 
FHIRPathParser.DateTimePrecisionContext = DateTimePrecisionContext; 
FHIRPathParser.PluralDateTimePrecisionContext = PluralDateTimePrecisionContext; 
FHIRPathParser.TypeSpecifierContext = TypeSpecifierContext; 
FHIRPathParser.QualifiedIdentifierContext = QualifiedIdentifierContext; 
FHIRPathParser.IdentifierContext = IdentifierContext; 

module.exports = FHIRPathParser;