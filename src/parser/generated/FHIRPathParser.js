// Generated from FHIRPath.g4 by ANTLR 4.9.3
// jshint ignore: start
const antlr4 = require('../antlr4-index');
const FHIRPathListener = require('./FHIRPathListener');

const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003H\u00cb\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004",
    "\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007",
    "\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f",
    "\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010",
    "\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0003\u0002",
    "\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0005\u0003.\n\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0007\u0003V\n\u0003",
    "\f\u0003\u000e\u0003Y\u000b\u0003\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0005\u0004",
    "c\n\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005",
    "o\n\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0005\u0006t\n\u0006\u0003",
    "\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0005\u0007{",
    "\n\u0007\u0003\b\u0003\b\u0003\b\u0003\b\u0003\b\u0007\b\u0082\n\b\f",
    "\b\u000e\b\u0085\u000b\b\u0005\b\u0087\n\b\u0003\b\u0003\b\u0003\b\u0003",
    "\b\u0005\b\u008d\n\b\u0003\b\u0003\b\u0005\b\u0091\n\b\u0003\t\u0003",
    "\t\u0005\t\u0095\n\t\u0003\n\u0003\n\u0003\n\u0007\n\u009a\n\n\f\n\u000e",
    "\n\u009d\u000b\n\u0003\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0003",
    "\u000b\u0003\u000b\u0007\u000b\u00a5\n\u000b\f\u000b\u000e\u000b\u00a8",
    "\u000b\u000b\u0005\u000b\u00aa\n\u000b\u0003\u000b\u0003\u000b\u0003",
    "\f\u0003\f\u0003\f\u0003\f\u0003\r\u0003\r\u0005\r\u00b4\n\r\u0003\u000e",
    "\u0003\u000e\u0003\u000e\u0005\u000e\u00b9\n\u000e\u0003\u000f\u0003",
    "\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011\u0003\u0012\u0003",
    "\u0012\u0003\u0012\u0007\u0012\u00c4\n\u0012\f\u0012\u000e\u0012\u00c7",
    "\u000b\u0012\u0003\u0013\u0003\u0013\u0003\u0013\u0002\u0003\u0004\u0014",
    "\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c",
    "\u001e \"$\u0002\u0010\u0003\u0002\u0006\u0007\u0003\u0002\b\u000b\u0004",
    "\u0002\u0006\u0007\f\f\u0003\u0002\u0010\u0013\u0003\u0002\u0014\u0017",
    "\u0003\u0002\u0018\u0019\u0003\u0002\u001b\u001c\u0003\u0002\r\u000e",
    "\u0003\u0002\"#\u0003\u0002CD\u0003\u0002*+\u0003\u0002-4\u0003\u0002",
    "5<\u0007\u0002\r\u000e\u0018\u0019((*+@A\u0002\u00e2\u0002&\u0003\u0002",
    "\u0002\u0002\u0004-\u0003\u0002\u0002\u0002\u0006b\u0003\u0002\u0002",
    "\u0002\bn\u0003\u0002\u0002\u0002\np\u0003\u0002\u0002\u0002\fz\u0003",
    "\u0002\u0002\u0002\u000e\u0090\u0003\u0002\u0002\u0002\u0010\u0092\u0003",
    "\u0002\u0002\u0002\u0012\u0096\u0003\u0002\u0002\u0002\u0014\u009e\u0003",
    "\u0002\u0002\u0002\u0016\u00ad\u0003\u0002\u0002\u0002\u0018\u00b1\u0003",
    "\u0002\u0002\u0002\u001a\u00b8\u0003\u0002\u0002\u0002\u001c\u00ba\u0003",
    "\u0002\u0002\u0002\u001e\u00bc\u0003\u0002\u0002\u0002 \u00be\u0003",
    "\u0002\u0002\u0002\"\u00c0\u0003\u0002\u0002\u0002$\u00c8\u0003\u0002",
    "\u0002\u0002&\'\u0005\u0004\u0003\u0002\'(\u0007\u0002\u0002\u0003(",
    "\u0003\u0003\u0002\u0002\u0002)*\b\u0003\u0001\u0002*.\u0005\u0006\u0004",
    "\u0002+,\t\u0002\u0002\u0002,.\u0005\u0004\u0003\r-)\u0003\u0002\u0002",
    "\u0002-+\u0003\u0002\u0002\u0002.W\u0003\u0002\u0002\u0002/0\f\f\u0002",
    "\u000201\t\u0003\u0002\u00021V\u0005\u0004\u0003\r23\f\u000b\u0002\u0002",
    "34\t\u0004\u0002\u00024V\u0005\u0004\u0003\f56\f\t\u0002\u000267\u0007",
    "\u000f\u0002\u00027V\u0005\u0004\u0003\n89\f\b\u0002\u00029:\t\u0005",
    "\u0002\u0002:V\u0005\u0004\u0003\t;<\f\u0007\u0002\u0002<=\t\u0006\u0002",
    "\u0002=V\u0005\u0004\u0003\b>?\f\u0006\u0002\u0002?@\t\u0007\u0002\u0002",
    "@V\u0005\u0004\u0003\u0007AB\f\u0005\u0002\u0002BC\u0007\u001a\u0002",
    "\u0002CV\u0005\u0004\u0003\u0006DE\f\u0004\u0002\u0002EF\t\b\u0002\u0002",
    "FV\u0005\u0004\u0003\u0005GH\f\u0003\u0002\u0002HI\u0007\u001d\u0002",
    "\u0002IV\u0005\u0004\u0003\u0004JK\f\u000f\u0002\u0002KL\u0007\u0003",
    "\u0002\u0002LV\u0005\f\u0007\u0002MN\f\u000e\u0002\u0002NO\u0007\u0004",
    "\u0002\u0002OP\u0005\u0004\u0003\u0002PQ\u0007\u0005\u0002\u0002QV\u0003",
    "\u0002\u0002\u0002RS\f\n\u0002\u0002ST\t\t\u0002\u0002TV\u0005 \u0011",
    "\u0002U/\u0003\u0002\u0002\u0002U2\u0003\u0002\u0002\u0002U5\u0003\u0002",
    "\u0002\u0002U8\u0003\u0002\u0002\u0002U;\u0003\u0002\u0002\u0002U>\u0003",
    "\u0002\u0002\u0002UA\u0003\u0002\u0002\u0002UD\u0003\u0002\u0002\u0002",
    "UG\u0003\u0002\u0002\u0002UJ\u0003\u0002\u0002\u0002UM\u0003\u0002\u0002",
    "\u0002UR\u0003\u0002\u0002\u0002VY\u0003\u0002\u0002\u0002WU\u0003\u0002",
    "\u0002\u0002WX\u0003\u0002\u0002\u0002X\u0005\u0003\u0002\u0002\u0002",
    "YW\u0003\u0002\u0002\u0002Zc\u0005\f\u0007\u0002[c\u0005\b\u0005\u0002",
    "\\c\u0005\n\u0006\u0002]^\u0007\u001e\u0002\u0002^_\u0005\u0004\u0003",
    "\u0002_`\u0007\u001f\u0002\u0002`c\u0003\u0002\u0002\u0002ac\u0005\u0014",
    "\u000b\u0002bZ\u0003\u0002\u0002\u0002b[\u0003\u0002\u0002\u0002b\\",
    "\u0003\u0002\u0002\u0002b]\u0003\u0002\u0002\u0002ba\u0003\u0002\u0002",
    "\u0002c\u0007\u0003\u0002\u0002\u0002de\u0007 \u0002\u0002eo\u0007!",
    "\u0002\u0002fo\t\n\u0002\u0002go\u0007B\u0002\u0002ho\t\u000b\u0002",
    "\u0002io\u0007E\u0002\u0002jo\u0007=\u0002\u0002ko\u0007>\u0002\u0002",
    "lo\u0007?\u0002\u0002mo\u0005\u0018\r\u0002nd\u0003\u0002\u0002\u0002",
    "nf\u0003\u0002\u0002\u0002ng\u0003\u0002\u0002\u0002nh\u0003\u0002\u0002",
    "\u0002ni\u0003\u0002\u0002\u0002nj\u0003\u0002\u0002\u0002nk\u0003\u0002",
    "\u0002\u0002nl\u0003\u0002\u0002\u0002nm\u0003\u0002\u0002\u0002o\t",
    "\u0003\u0002\u0002\u0002ps\u0007$\u0002\u0002qt\u0005$\u0013\u0002r",
    "t\u0007B\u0002\u0002sq\u0003\u0002\u0002\u0002sr\u0003\u0002\u0002\u0002",
    "t\u000b\u0003\u0002\u0002\u0002u{\u0005$\u0013\u0002v{\u0005\u000e\b",
    "\u0002w{\u0007%\u0002\u0002x{\u0007&\u0002\u0002y{\u0007\'\u0002\u0002",
    "zu\u0003\u0002\u0002\u0002zv\u0003\u0002\u0002\u0002zw\u0003\u0002\u0002",
    "\u0002zx\u0003\u0002\u0002\u0002zy\u0003\u0002\u0002\u0002{\r\u0003",
    "\u0002\u0002\u0002|}\u0007(\u0002\u0002}\u0086\u0007\u001e\u0002\u0002",
    "~\u0083\u0005\u0010\t\u0002\u007f\u0080\u0007)\u0002\u0002\u0080\u0082",
    "\u0005\u0010\t\u0002\u0081\u007f\u0003\u0002\u0002\u0002\u0082\u0085",
    "\u0003\u0002\u0002\u0002\u0083\u0081\u0003\u0002\u0002\u0002\u0083\u0084",
    "\u0003\u0002\u0002\u0002\u0084\u0087\u0003\u0002\u0002\u0002\u0085\u0083",
    "\u0003\u0002\u0002\u0002\u0086~\u0003\u0002\u0002\u0002\u0086\u0087",
    "\u0003\u0002\u0002\u0002\u0087\u0088\u0003\u0002\u0002\u0002\u0088\u0091",
    "\u0007\u001f\u0002\u0002\u0089\u008a\u0005$\u0013\u0002\u008a\u008c",
    "\u0007\u001e\u0002\u0002\u008b\u008d\u0005\u0012\n\u0002\u008c\u008b",
    "\u0003\u0002\u0002\u0002\u008c\u008d\u0003\u0002\u0002\u0002\u008d\u008e",
    "\u0003\u0002\u0002\u0002\u008e\u008f\u0007\u001f\u0002\u0002\u008f\u0091",
    "\u0003\u0002\u0002\u0002\u0090|\u0003\u0002\u0002\u0002\u0090\u0089",
    "\u0003\u0002\u0002\u0002\u0091\u000f\u0003\u0002\u0002\u0002\u0092\u0094",
    "\u0005\u0004\u0003\u0002\u0093\u0095\t\f\u0002\u0002\u0094\u0093\u0003",
    "\u0002\u0002\u0002\u0094\u0095\u0003\u0002\u0002\u0002\u0095\u0011\u0003",
    "\u0002\u0002\u0002\u0096\u009b\u0005\u0004\u0003\u0002\u0097\u0098\u0007",
    ")\u0002\u0002\u0098\u009a\u0005\u0004\u0003\u0002\u0099\u0097\u0003",
    "\u0002\u0002\u0002\u009a\u009d\u0003\u0002\u0002\u0002\u009b\u0099\u0003",
    "\u0002\u0002\u0002\u009b\u009c\u0003\u0002\u0002\u0002\u009c\u0013\u0003",
    "\u0002\u0002\u0002\u009d\u009b\u0003\u0002\u0002\u0002\u009e\u009f\u0005",
    "\"\u0012\u0002\u009f\u00a9\u0007 \u0002\u0002\u00a0\u00aa\u0007,\u0002",
    "\u0002\u00a1\u00a6\u0005\u0016\f\u0002\u00a2\u00a3\u0007)\u0002\u0002",
    "\u00a3\u00a5\u0005\u0016\f\u0002\u00a4\u00a2\u0003\u0002\u0002\u0002",
    "\u00a5\u00a8\u0003\u0002\u0002\u0002\u00a6\u00a4\u0003\u0002\u0002\u0002",
    "\u00a6\u00a7\u0003\u0002\u0002\u0002\u00a7\u00aa\u0003\u0002\u0002\u0002",
    "\u00a8\u00a6\u0003\u0002\u0002\u0002\u00a9\u00a0\u0003\u0002\u0002\u0002",
    "\u00a9\u00a1\u0003\u0002\u0002\u0002\u00aa\u00ab\u0003\u0002\u0002\u0002",
    "\u00ab\u00ac\u0007!\u0002\u0002\u00ac\u0015\u0003\u0002\u0002\u0002",
    "\u00ad\u00ae\u0005$\u0013\u0002\u00ae\u00af\u0007,\u0002\u0002\u00af",
    "\u00b0\u0005\u0004\u0003\u0002\u00b0\u0017\u0003\u0002\u0002\u0002\u00b1",
    "\u00b3\t\u000b\u0002\u0002\u00b2\u00b4\u0005\u001a\u000e\u0002\u00b3",
    "\u00b2\u0003\u0002\u0002\u0002\u00b3\u00b4\u0003\u0002\u0002\u0002\u00b4",
    "\u0019\u0003\u0002\u0002\u0002\u00b5\u00b9\u0005\u001c\u000f\u0002\u00b6",
    "\u00b9\u0005\u001e\u0010\u0002\u00b7\u00b9\u0007B\u0002\u0002\u00b8",
    "\u00b5\u0003\u0002\u0002\u0002\u00b8\u00b6\u0003\u0002\u0002\u0002\u00b8",
    "\u00b7\u0003\u0002\u0002\u0002\u00b9\u001b\u0003\u0002\u0002\u0002\u00ba",
    "\u00bb\t\r\u0002\u0002\u00bb\u001d\u0003\u0002\u0002\u0002\u00bc\u00bd",
    "\t\u000e\u0002\u0002\u00bd\u001f\u0003\u0002\u0002\u0002\u00be\u00bf",
    "\u0005\"\u0012\u0002\u00bf!\u0003\u0002\u0002\u0002\u00c0\u00c5\u0005",
    "$\u0013\u0002\u00c1\u00c2\u0007\u0003\u0002\u0002\u00c2\u00c4\u0005",
    "$\u0013\u0002\u00c3\u00c1\u0003\u0002\u0002\u0002\u00c4\u00c7\u0003",
    "\u0002\u0002\u0002\u00c5\u00c3\u0003\u0002\u0002\u0002\u00c5\u00c6\u0003",
    "\u0002\u0002\u0002\u00c6#\u0003\u0002\u0002\u0002\u00c7\u00c5\u0003",
    "\u0002\u0002\u0002\u00c8\u00c9\t\u000f\u0002\u0002\u00c9%\u0003\u0002",
    "\u0002\u0002\u0014-UWbnsz\u0083\u0086\u008c\u0090\u0094\u009b\u00a6",
    "\u00a9\u00b3\u00b8\u00c5"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

class FHIRPathParser extends antlr4.Parser {

    static grammarFileName = "FHIRPath.g4";
    static literalNames = [ null, "'.'", "'['", "']'", "'+'", "'-'", "'*'", 
                            "'/'", "'div'", "'mod'", "'&'", "'is'", "'as'", 
                            "'|'", "'<='", "'<'", "'>'", "'>='", "'='", 
                            "'~'", "'!='", "'!~'", "'in'", "'contains'", 
                            "'and'", "'or'", "'xor'", "'implies'", "'('", 
                            "')'", "'{'", "'}'", "'true'", "'false'", "'%'", 
                            "'$this'", "'$index'", "'$total'", "'sort'", 
                            "','", "'asc'", "'desc'", "':'", "'year'", "'month'", 
                            "'week'", "'day'", "'hour'", "'minute'", "'second'", 
                            "'millisecond'", "'years'", "'months'", "'weeks'", 
                            "'days'", "'hours'", "'minutes'", "'seconds'", 
                            "'milliseconds'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, null, "DATE", "DATETIME", "TIME", 
                             "IDENTIFIER", "DELIMITEDIDENTIFIER", "STRING", 
                             "INTEGER", "DECIMAL", "LONGNUMBER", "WS", "COMMENT", 
                             "LINE_COMMENT" ];
    static ruleNames = [ "entireExpression", "expression", "term", "literal", 
                         "externalConstant", "invocation", "functn", "sortArgument", 
                         "paramList", "instanceSelector", "instanceElementSelector", 
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
    			return this.precpred(this._ctx, 7);
    		case 3:
    			return this.precpred(this._ctx, 6);
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
    			return this.precpred(this._ctx, 8);
    		default:
    			throw "No predicate with index:" + predIndex;
    	}
    };




	entireExpression() {
	    let localctx = new EntireExpressionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, FHIRPathParser.RULE_entireExpression);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 36;
	        this.expression(0);
	        this.state = 37;
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
	        this.state = 43;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case FHIRPathParser.T__10:
	        case FHIRPathParser.T__11:
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
	        case FHIRPathParser.T__37:
	        case FHIRPathParser.T__39:
	        case FHIRPathParser.T__40:
	        case FHIRPathParser.DATE:
	        case FHIRPathParser.DATETIME:
	        case FHIRPathParser.TIME:
	        case FHIRPathParser.IDENTIFIER:
	        case FHIRPathParser.DELIMITEDIDENTIFIER:
	        case FHIRPathParser.STRING:
	        case FHIRPathParser.INTEGER:
	        case FHIRPathParser.DECIMAL:
	        case FHIRPathParser.LONGNUMBER:
	            localctx = new TermExpressionContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;

	            this.state = 40;
	            this.term();
	            break;
	        case FHIRPathParser.T__3:
	        case FHIRPathParser.T__4:
	            localctx = new PolarityExpressionContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 41;
	            _la = this._input.LA(1);
	            if(!(_la===FHIRPathParser.T__3 || _la===FHIRPathParser.T__4)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 42;
	            this.expression(11);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 85;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 83;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new MultiplicativeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 45;
	                    if (!( this.precpred(this._ctx, 10))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
	                    }
	                    this.state = 46;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__5) | (1 << FHIRPathParser.T__6) | (1 << FHIRPathParser.T__7) | (1 << FHIRPathParser.T__8))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 47;
	                    this.expression(11);
	                    break;

	                case 2:
	                    localctx = new AdditiveExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 48;
	                    if (!( this.precpred(this._ctx, 9))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
	                    }
	                    this.state = 49;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__3) | (1 << FHIRPathParser.T__4) | (1 << FHIRPathParser.T__9))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 50;
	                    this.expression(10);
	                    break;

	                case 3:
	                    localctx = new UnionExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 51;
	                    if (!( this.precpred(this._ctx, 7))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
	                    }
	                    this.state = 52;
	                    this.match(FHIRPathParser.T__12);
	                    this.state = 53;
	                    this.expression(8);
	                    break;

	                case 4:
	                    localctx = new InequalityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 54;
	                    if (!( this.precpred(this._ctx, 6))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
	                    }
	                    this.state = 55;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__13) | (1 << FHIRPathParser.T__14) | (1 << FHIRPathParser.T__15) | (1 << FHIRPathParser.T__16))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 56;
	                    this.expression(7);
	                    break;

	                case 5:
	                    localctx = new EqualityExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 57;
	                    if (!( this.precpred(this._ctx, 5))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
	                    }
	                    this.state = 58;
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__17) | (1 << FHIRPathParser.T__18) | (1 << FHIRPathParser.T__19) | (1 << FHIRPathParser.T__20))) !== 0))) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 59;
	                    this.expression(6);
	                    break;

	                case 6:
	                    localctx = new MembershipExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 60;
	                    if (!( this.precpred(this._ctx, 4))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
	                    }
	                    this.state = 61;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__21 || _la===FHIRPathParser.T__22)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 62;
	                    this.expression(5);
	                    break;

	                case 7:
	                    localctx = new AndExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 63;
	                    if (!( this.precpred(this._ctx, 3))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
	                    }
	                    this.state = 64;
	                    this.match(FHIRPathParser.T__23);
	                    this.state = 65;
	                    this.expression(4);
	                    break;

	                case 8:
	                    localctx = new OrExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 66;
	                    if (!( this.precpred(this._ctx, 2))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
	                    }
	                    this.state = 67;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__24 || _la===FHIRPathParser.T__25)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 68;
	                    this.expression(3);
	                    break;

	                case 9:
	                    localctx = new ImpliesExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 69;
	                    if (!( this.precpred(this._ctx, 1))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 1)");
	                    }
	                    this.state = 70;
	                    this.match(FHIRPathParser.T__26);
	                    this.state = 71;
	                    this.expression(2);
	                    break;

	                case 10:
	                    localctx = new InvocationExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 72;
	                    if (!( this.precpred(this._ctx, 13))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 13)");
	                    }
	                    this.state = 73;
	                    this.match(FHIRPathParser.T__0);
	                    this.state = 74;
	                    this.invocation();
	                    break;

	                case 11:
	                    localctx = new IndexerExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 75;
	                    if (!( this.precpred(this._ctx, 12))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
	                    }
	                    this.state = 76;
	                    this.match(FHIRPathParser.T__1);
	                    this.state = 77;
	                    this.expression(0);
	                    this.state = 78;
	                    this.match(FHIRPathParser.T__2);
	                    break;

	                case 12:
	                    localctx = new TypeExpressionContext(this, new ExpressionContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, FHIRPathParser.RULE_expression);
	                    this.state = 80;
	                    if (!( this.precpred(this._ctx, 8))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
	                    }
	                    this.state = 81;
	                    _la = this._input.LA(1);
	                    if(!(_la===FHIRPathParser.T__10 || _la===FHIRPathParser.T__11)) {
	                    this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 82;
	                    this.typeSpecifier();
	                    break;

	                } 
	            }
	            this.state = 87;
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
	        this.state = 96;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new InvocationTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 88;
	            this.invocation();
	            break;

	        case 2:
	            localctx = new LiteralTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 89;
	            this.literal();
	            break;

	        case 3:
	            localctx = new ExternalConstantTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 90;
	            this.externalConstant();
	            break;

	        case 4:
	            localctx = new ParenthesizedTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 91;
	            this.match(FHIRPathParser.T__27);
	            this.state = 92;
	            this.expression(0);
	            this.state = 93;
	            this.match(FHIRPathParser.T__28);
	            break;

	        case 5:
	            localctx = new InstanceSelectorTermContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 95;
	            this.instanceSelector();
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



	literal() {
	    let localctx = new LiteralContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, FHIRPathParser.RULE_literal);
	    var _la = 0; // Token type
	    try {
	        this.state = 108;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new NullLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 98;
	            this.match(FHIRPathParser.T__29);
	            this.state = 99;
	            this.match(FHIRPathParser.T__30);
	            break;

	        case 2:
	            localctx = new BooleanLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 100;
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
	            this.state = 101;
	            this.match(FHIRPathParser.STRING);
	            break;

	        case 4:
	            localctx = new NumberLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 102;
	            _la = this._input.LA(1);
	            if(!(_la===FHIRPathParser.INTEGER || _la===FHIRPathParser.DECIMAL)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;

	        case 5:
	            localctx = new LongNumberLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 103;
	            this.match(FHIRPathParser.LONGNUMBER);
	            break;

	        case 6:
	            localctx = new DateLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 6);
	            this.state = 104;
	            this.match(FHIRPathParser.DATE);
	            break;

	        case 7:
	            localctx = new DateTimeLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 7);
	            this.state = 105;
	            this.match(FHIRPathParser.DATETIME);
	            break;

	        case 8:
	            localctx = new TimeLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 8);
	            this.state = 106;
	            this.match(FHIRPathParser.TIME);
	            break;

	        case 9:
	            localctx = new QuantityLiteralContext(this, localctx);
	            this.enterOuterAlt(localctx, 9);
	            this.state = 107;
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
	        this.state = 110;
	        this.match(FHIRPathParser.T__33);
	        this.state = 113;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case FHIRPathParser.T__10:
	        case FHIRPathParser.T__11:
	        case FHIRPathParser.T__21:
	        case FHIRPathParser.T__22:
	        case FHIRPathParser.T__37:
	        case FHIRPathParser.T__39:
	        case FHIRPathParser.T__40:
	        case FHIRPathParser.IDENTIFIER:
	        case FHIRPathParser.DELIMITEDIDENTIFIER:
	            this.state = 111;
	            this.identifier();
	            break;
	        case FHIRPathParser.STRING:
	            this.state = 112;
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
	        this.state = 120;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new MemberInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 115;
	            this.identifier();
	            break;

	        case 2:
	            localctx = new FunctionInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 116;
	            this.functn();
	            break;

	        case 3:
	            localctx = new ThisInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 117;
	            this.match(FHIRPathParser.T__34);
	            break;

	        case 4:
	            localctx = new IndexInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 118;
	            this.match(FHIRPathParser.T__35);
	            break;

	        case 5:
	            localctx = new TotalInvocationContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 119;
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
	        this.state = 142;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 122;
	            this.match(FHIRPathParser.T__37);
	            this.state = 123;
	            this.match(FHIRPathParser.T__27);
	            this.state = 132;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(((((_la - 4)) & ~0x1f) == 0 && ((1 << (_la - 4)) & ((1 << (FHIRPathParser.T__3 - 4)) | (1 << (FHIRPathParser.T__4 - 4)) | (1 << (FHIRPathParser.T__10 - 4)) | (1 << (FHIRPathParser.T__11 - 4)) | (1 << (FHIRPathParser.T__21 - 4)) | (1 << (FHIRPathParser.T__22 - 4)) | (1 << (FHIRPathParser.T__27 - 4)) | (1 << (FHIRPathParser.T__29 - 4)) | (1 << (FHIRPathParser.T__31 - 4)) | (1 << (FHIRPathParser.T__32 - 4)) | (1 << (FHIRPathParser.T__33 - 4)) | (1 << (FHIRPathParser.T__34 - 4)))) !== 0) || ((((_la - 36)) & ~0x1f) == 0 && ((1 << (_la - 36)) & ((1 << (FHIRPathParser.T__35 - 36)) | (1 << (FHIRPathParser.T__36 - 36)) | (1 << (FHIRPathParser.T__37 - 36)) | (1 << (FHIRPathParser.T__39 - 36)) | (1 << (FHIRPathParser.T__40 - 36)) | (1 << (FHIRPathParser.DATE - 36)) | (1 << (FHIRPathParser.DATETIME - 36)) | (1 << (FHIRPathParser.TIME - 36)) | (1 << (FHIRPathParser.IDENTIFIER - 36)) | (1 << (FHIRPathParser.DELIMITEDIDENTIFIER - 36)) | (1 << (FHIRPathParser.STRING - 36)) | (1 << (FHIRPathParser.INTEGER - 36)) | (1 << (FHIRPathParser.DECIMAL - 36)) | (1 << (FHIRPathParser.LONGNUMBER - 36)))) !== 0)) {
	                this.state = 124;
	                this.sortArgument();
	                this.state = 129;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                while(_la===FHIRPathParser.T__38) {
	                    this.state = 125;
	                    this.match(FHIRPathParser.T__38);
	                    this.state = 126;
	                    this.sortArgument();
	                    this.state = 131;
	                    this._errHandler.sync(this);
	                    _la = this._input.LA(1);
	                }
	            }

	            this.state = 134;
	            this.match(FHIRPathParser.T__28);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 135;
	            this.identifier();
	            this.state = 136;
	            this.match(FHIRPathParser.T__27);
	            this.state = 138;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(((((_la - 4)) & ~0x1f) == 0 && ((1 << (_la - 4)) & ((1 << (FHIRPathParser.T__3 - 4)) | (1 << (FHIRPathParser.T__4 - 4)) | (1 << (FHIRPathParser.T__10 - 4)) | (1 << (FHIRPathParser.T__11 - 4)) | (1 << (FHIRPathParser.T__21 - 4)) | (1 << (FHIRPathParser.T__22 - 4)) | (1 << (FHIRPathParser.T__27 - 4)) | (1 << (FHIRPathParser.T__29 - 4)) | (1 << (FHIRPathParser.T__31 - 4)) | (1 << (FHIRPathParser.T__32 - 4)) | (1 << (FHIRPathParser.T__33 - 4)) | (1 << (FHIRPathParser.T__34 - 4)))) !== 0) || ((((_la - 36)) & ~0x1f) == 0 && ((1 << (_la - 36)) & ((1 << (FHIRPathParser.T__35 - 36)) | (1 << (FHIRPathParser.T__36 - 36)) | (1 << (FHIRPathParser.T__37 - 36)) | (1 << (FHIRPathParser.T__39 - 36)) | (1 << (FHIRPathParser.T__40 - 36)) | (1 << (FHIRPathParser.DATE - 36)) | (1 << (FHIRPathParser.DATETIME - 36)) | (1 << (FHIRPathParser.TIME - 36)) | (1 << (FHIRPathParser.IDENTIFIER - 36)) | (1 << (FHIRPathParser.DELIMITEDIDENTIFIER - 36)) | (1 << (FHIRPathParser.STRING - 36)) | (1 << (FHIRPathParser.INTEGER - 36)) | (1 << (FHIRPathParser.DECIMAL - 36)) | (1 << (FHIRPathParser.LONGNUMBER - 36)))) !== 0)) {
	                this.state = 137;
	                this.paramList();
	            }

	            this.state = 140;
	            this.match(FHIRPathParser.T__28);
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



	sortArgument() {
	    let localctx = new SortArgumentContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, FHIRPathParser.RULE_sortArgument);
	    var _la = 0; // Token type
	    try {
	        localctx = new SortDirectionArgumentContext(this, localctx);
	        this.enterOuterAlt(localctx, 1);
	        this.state = 144;
	        this.expression(0);
	        this.state = 146;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===FHIRPathParser.T__39 || _la===FHIRPathParser.T__40) {
	            this.state = 145;
	            _la = this._input.LA(1);
	            if(!(_la===FHIRPathParser.T__39 || _la===FHIRPathParser.T__40)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
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



	paramList() {
	    let localctx = new ParamListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, FHIRPathParser.RULE_paramList);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 148;
	        this.expression(0);
	        this.state = 153;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===FHIRPathParser.T__38) {
	            this.state = 149;
	            this.match(FHIRPathParser.T__38);
	            this.state = 150;
	            this.expression(0);
	            this.state = 155;
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



	instanceSelector() {
	    let localctx = new InstanceSelectorContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, FHIRPathParser.RULE_instanceSelector);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 156;
	        this.qualifiedIdentifier();
	        this.state = 157;
	        this.match(FHIRPathParser.T__29);
	        this.state = 167;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case FHIRPathParser.T__41:
	            this.state = 158;
	            this.match(FHIRPathParser.T__41);
	            break;
	        case FHIRPathParser.T__10:
	        case FHIRPathParser.T__11:
	        case FHIRPathParser.T__21:
	        case FHIRPathParser.T__22:
	        case FHIRPathParser.T__37:
	        case FHIRPathParser.T__39:
	        case FHIRPathParser.T__40:
	        case FHIRPathParser.IDENTIFIER:
	        case FHIRPathParser.DELIMITEDIDENTIFIER:
	            this.state = 159;
	            this.instanceElementSelector();
	            this.state = 164;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===FHIRPathParser.T__38) {
	                this.state = 160;
	                this.match(FHIRPathParser.T__38);
	                this.state = 161;
	                this.instanceElementSelector();
	                this.state = 166;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	        this.state = 169;
	        this.match(FHIRPathParser.T__30);
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



	instanceElementSelector() {
	    let localctx = new InstanceElementSelectorContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, FHIRPathParser.RULE_instanceElementSelector);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 171;
	        this.identifier();
	        this.state = 172;
	        this.match(FHIRPathParser.T__41);
	        this.state = 173;
	        this.expression(0);
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
	    this.enterRule(localctx, 22, FHIRPathParser.RULE_quantity);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 175;
	        _la = this._input.LA(1);
	        if(!(_la===FHIRPathParser.INTEGER || _la===FHIRPathParser.DECIMAL)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 177;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
	        if(la_===1) {
	            this.state = 176;
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
	    this.enterRule(localctx, 24, FHIRPathParser.RULE_unit);
	    try {
	        this.state = 182;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case FHIRPathParser.T__42:
	        case FHIRPathParser.T__43:
	        case FHIRPathParser.T__44:
	        case FHIRPathParser.T__45:
	        case FHIRPathParser.T__46:
	        case FHIRPathParser.T__47:
	        case FHIRPathParser.T__48:
	        case FHIRPathParser.T__49:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 179;
	            this.dateTimePrecision();
	            break;
	        case FHIRPathParser.T__50:
	        case FHIRPathParser.T__51:
	        case FHIRPathParser.T__52:
	        case FHIRPathParser.T__53:
	        case FHIRPathParser.T__54:
	        case FHIRPathParser.T__55:
	        case FHIRPathParser.T__56:
	        case FHIRPathParser.T__57:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 180;
	            this.pluralDateTimePrecision();
	            break;
	        case FHIRPathParser.STRING:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 181;
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
	    this.enterRule(localctx, 26, FHIRPathParser.RULE_dateTimePrecision);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 184;
	        _la = this._input.LA(1);
	        if(!(((((_la - 43)) & ~0x1f) == 0 && ((1 << (_la - 43)) & ((1 << (FHIRPathParser.T__42 - 43)) | (1 << (FHIRPathParser.T__43 - 43)) | (1 << (FHIRPathParser.T__44 - 43)) | (1 << (FHIRPathParser.T__45 - 43)) | (1 << (FHIRPathParser.T__46 - 43)) | (1 << (FHIRPathParser.T__47 - 43)) | (1 << (FHIRPathParser.T__48 - 43)) | (1 << (FHIRPathParser.T__49 - 43)))) !== 0))) {
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
	    this.enterRule(localctx, 28, FHIRPathParser.RULE_pluralDateTimePrecision);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 186;
	        _la = this._input.LA(1);
	        if(!(((((_la - 51)) & ~0x1f) == 0 && ((1 << (_la - 51)) & ((1 << (FHIRPathParser.T__50 - 51)) | (1 << (FHIRPathParser.T__51 - 51)) | (1 << (FHIRPathParser.T__52 - 51)) | (1 << (FHIRPathParser.T__53 - 51)) | (1 << (FHIRPathParser.T__54 - 51)) | (1 << (FHIRPathParser.T__55 - 51)) | (1 << (FHIRPathParser.T__56 - 51)) | (1 << (FHIRPathParser.T__57 - 51)))) !== 0))) {
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
	    this.enterRule(localctx, 30, FHIRPathParser.RULE_typeSpecifier);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 188;
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
	    this.enterRule(localctx, 32, FHIRPathParser.RULE_qualifiedIdentifier);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 190;
	        this.identifier();
	        this.state = 195;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,17,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 191;
	                this.match(FHIRPathParser.T__0);
	                this.state = 192;
	                this.identifier(); 
	            }
	            this.state = 197;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,17,this._ctx);
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
	    this.enterRule(localctx, 34, FHIRPathParser.RULE_identifier);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 198;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << FHIRPathParser.T__10) | (1 << FHIRPathParser.T__11) | (1 << FHIRPathParser.T__21) | (1 << FHIRPathParser.T__22))) !== 0) || ((((_la - 38)) & ~0x1f) == 0 && ((1 << (_la - 38)) & ((1 << (FHIRPathParser.T__37 - 38)) | (1 << (FHIRPathParser.T__39 - 38)) | (1 << (FHIRPathParser.T__40 - 38)) | (1 << (FHIRPathParser.IDENTIFIER - 38)) | (1 << (FHIRPathParser.DELIMITEDIDENTIFIER - 38)))) !== 0))) {
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
FHIRPathParser.T__54 = 55;
FHIRPathParser.T__55 = 56;
FHIRPathParser.T__56 = 57;
FHIRPathParser.T__57 = 58;
FHIRPathParser.DATE = 59;
FHIRPathParser.DATETIME = 60;
FHIRPathParser.TIME = 61;
FHIRPathParser.IDENTIFIER = 62;
FHIRPathParser.DELIMITEDIDENTIFIER = 63;
FHIRPathParser.STRING = 64;
FHIRPathParser.INTEGER = 65;
FHIRPathParser.DECIMAL = 66;
FHIRPathParser.LONGNUMBER = 67;
FHIRPathParser.WS = 68;
FHIRPathParser.COMMENT = 69;
FHIRPathParser.LINE_COMMENT = 70;

FHIRPathParser.RULE_entireExpression = 0;
FHIRPathParser.RULE_expression = 1;
FHIRPathParser.RULE_term = 2;
FHIRPathParser.RULE_literal = 3;
FHIRPathParser.RULE_externalConstant = 4;
FHIRPathParser.RULE_invocation = 5;
FHIRPathParser.RULE_functn = 6;
FHIRPathParser.RULE_sortArgument = 7;
FHIRPathParser.RULE_paramList = 8;
FHIRPathParser.RULE_instanceSelector = 9;
FHIRPathParser.RULE_instanceElementSelector = 10;
FHIRPathParser.RULE_quantity = 11;
FHIRPathParser.RULE_unit = 12;
FHIRPathParser.RULE_dateTimePrecision = 13;
FHIRPathParser.RULE_pluralDateTimePrecision = 14;
FHIRPathParser.RULE_typeSpecifier = 15;
FHIRPathParser.RULE_qualifiedIdentifier = 16;
FHIRPathParser.RULE_identifier = 17;

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

class InstanceSelectorTermContext extends TermContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	instanceSelector() {
	    return this.getTypedRuleContext(InstanceSelectorContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInstanceSelectorTerm(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInstanceSelectorTerm(this);
		}
	}


}

FHIRPathParser.InstanceSelectorTermContext = InstanceSelectorTermContext;

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

class DateLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	DATE() {
	    return this.getToken(FHIRPathParser.DATE, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterDateLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitDateLiteral(this);
		}
	}


}

FHIRPathParser.DateLiteralContext = DateLiteralContext;

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

	INTEGER() {
	    return this.getToken(FHIRPathParser.INTEGER, 0);
	};

	DECIMAL() {
	    return this.getToken(FHIRPathParser.DECIMAL, 0);
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

class LongNumberLiteralContext extends LiteralContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	LONGNUMBER() {
	    return this.getToken(FHIRPathParser.LONGNUMBER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterLongNumberLiteral(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitLongNumberLiteral(this);
		}
	}


}

FHIRPathParser.LongNumberLiteralContext = LongNumberLiteralContext;

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

	sortArgument = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SortArgumentContext);
	    } else {
	        return this.getTypedRuleContext(SortArgumentContext,i);
	    }
	};

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



class SortArgumentContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_sortArgument;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class SortDirectionArgumentContext extends SortArgumentContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterSortDirectionArgument(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitSortDirectionArgument(this);
		}
	}


}

FHIRPathParser.SortDirectionArgumentContext = SortDirectionArgumentContext;

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



class InstanceSelectorContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_instanceSelector;
    }

	qualifiedIdentifier() {
	    return this.getTypedRuleContext(QualifiedIdentifierContext,0);
	};

	instanceElementSelector = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(InstanceElementSelectorContext);
	    } else {
	        return this.getTypedRuleContext(InstanceElementSelectorContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInstanceSelector(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInstanceSelector(this);
		}
	}


}



class InstanceElementSelectorContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = FHIRPathParser.RULE_instanceElementSelector;
    }

	identifier() {
	    return this.getTypedRuleContext(IdentifierContext,0);
	};

	expression() {
	    return this.getTypedRuleContext(ExpressionContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.enterInstanceElementSelector(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof FHIRPathListener ) {
	        listener.exitInstanceElementSelector(this);
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

	INTEGER() {
	    return this.getToken(FHIRPathParser.INTEGER, 0);
	};

	DECIMAL() {
	    return this.getToken(FHIRPathParser.DECIMAL, 0);
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
FHIRPathParser.SortArgumentContext = SortArgumentContext; 
FHIRPathParser.ParamListContext = ParamListContext; 
FHIRPathParser.InstanceSelectorContext = InstanceSelectorContext; 
FHIRPathParser.InstanceElementSelectorContext = InstanceElementSelectorContext; 
FHIRPathParser.QuantityContext = QuantityContext; 
FHIRPathParser.UnitContext = UnitContext; 
FHIRPathParser.DateTimePrecisionContext = DateTimePrecisionContext; 
FHIRPathParser.PluralDateTimePrecisionContext = PluralDateTimePrecisionContext; 
FHIRPathParser.TypeSpecifierContext = TypeSpecifierContext; 
FHIRPathParser.QualifiedIdentifierContext = QualifiedIdentifierContext; 
FHIRPathParser.IdentifierContext = IdentifierContext; 

module.exports = FHIRPathParser;
