// Generated from FHIRPath.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('../antlr4-index');

// This class defines a complete listener for a parse tree produced by FHIRPathParser.
function FHIRPathListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

FHIRPathListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
FHIRPathListener.prototype.constructor = FHIRPathListener;

// Enter a parse tree produced by FHIRPathParser#indexerExpression.
FHIRPathListener.prototype.enterIndexerExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#indexerExpression.
FHIRPathListener.prototype.exitIndexerExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#polarityExpression.
FHIRPathListener.prototype.enterPolarityExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#polarityExpression.
FHIRPathListener.prototype.exitPolarityExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#additiveExpression.
FHIRPathListener.prototype.enterAdditiveExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#additiveExpression.
FHIRPathListener.prototype.exitAdditiveExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#multiplicativeExpression.
FHIRPathListener.prototype.enterMultiplicativeExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#multiplicativeExpression.
FHIRPathListener.prototype.exitMultiplicativeExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#unionExpression.
FHIRPathListener.prototype.enterUnionExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#unionExpression.
FHIRPathListener.prototype.exitUnionExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#orExpression.
FHIRPathListener.prototype.enterOrExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#orExpression.
FHIRPathListener.prototype.exitOrExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#andExpression.
FHIRPathListener.prototype.enterAndExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#andExpression.
FHIRPathListener.prototype.exitAndExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#membershipExpression.
FHIRPathListener.prototype.enterMembershipExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#membershipExpression.
FHIRPathListener.prototype.exitMembershipExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#inequalityExpression.
FHIRPathListener.prototype.enterInequalityExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#inequalityExpression.
FHIRPathListener.prototype.exitInequalityExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#invocationExpression.
FHIRPathListener.prototype.enterInvocationExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#invocationExpression.
FHIRPathListener.prototype.exitInvocationExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#equalityExpression.
FHIRPathListener.prototype.enterEqualityExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#equalityExpression.
FHIRPathListener.prototype.exitEqualityExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#impliesExpression.
FHIRPathListener.prototype.enterImpliesExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#impliesExpression.
FHIRPathListener.prototype.exitImpliesExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#termExpression.
FHIRPathListener.prototype.enterTermExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#termExpression.
FHIRPathListener.prototype.exitTermExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#typeExpression.
FHIRPathListener.prototype.enterTypeExpression = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#typeExpression.
FHIRPathListener.prototype.exitTypeExpression = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#invocationTerm.
FHIRPathListener.prototype.enterInvocationTerm = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#invocationTerm.
FHIRPathListener.prototype.exitInvocationTerm = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#literalTerm.
FHIRPathListener.prototype.enterLiteralTerm = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#literalTerm.
FHIRPathListener.prototype.exitLiteralTerm = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#externalConstantTerm.
FHIRPathListener.prototype.enterExternalConstantTerm = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#externalConstantTerm.
FHIRPathListener.prototype.exitExternalConstantTerm = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#parenthesizedTerm.
FHIRPathListener.prototype.enterParenthesizedTerm = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#parenthesizedTerm.
FHIRPathListener.prototype.exitParenthesizedTerm = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#nullLiteral.
FHIRPathListener.prototype.enterNullLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#nullLiteral.
FHIRPathListener.prototype.exitNullLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#booleanLiteral.
FHIRPathListener.prototype.enterBooleanLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#booleanLiteral.
FHIRPathListener.prototype.exitBooleanLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#stringLiteral.
FHIRPathListener.prototype.enterStringLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#stringLiteral.
FHIRPathListener.prototype.exitStringLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#numberLiteral.
FHIRPathListener.prototype.enterNumberLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#numberLiteral.
FHIRPathListener.prototype.exitNumberLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#dateTimeLiteral.
FHIRPathListener.prototype.enterDateTimeLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#dateTimeLiteral.
FHIRPathListener.prototype.exitDateTimeLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#timeLiteral.
FHIRPathListener.prototype.enterTimeLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#timeLiteral.
FHIRPathListener.prototype.exitTimeLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#quantityLiteral.
FHIRPathListener.prototype.enterQuantityLiteral = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#quantityLiteral.
FHIRPathListener.prototype.exitQuantityLiteral = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#externalConstant.
FHIRPathListener.prototype.enterExternalConstant = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#externalConstant.
FHIRPathListener.prototype.exitExternalConstant = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#memberInvocation.
FHIRPathListener.prototype.enterMemberInvocation = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#memberInvocation.
FHIRPathListener.prototype.exitMemberInvocation = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#functionInvocation.
FHIRPathListener.prototype.enterFunctionInvocation = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#functionInvocation.
FHIRPathListener.prototype.exitFunctionInvocation = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#thisInvocation.
FHIRPathListener.prototype.enterThisInvocation = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#thisInvocation.
FHIRPathListener.prototype.exitThisInvocation = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#indexInvocation.
FHIRPathListener.prototype.enterIndexInvocation = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#indexInvocation.
FHIRPathListener.prototype.exitIndexInvocation = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#totalInvocation.
FHIRPathListener.prototype.enterTotalInvocation = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#totalInvocation.
FHIRPathListener.prototype.exitTotalInvocation = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#functn.
FHIRPathListener.prototype.enterFunctn = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#functn.
FHIRPathListener.prototype.exitFunctn = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#paramList.
FHIRPathListener.prototype.enterParamList = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#paramList.
FHIRPathListener.prototype.exitParamList = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#quantity.
FHIRPathListener.prototype.enterQuantity = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#quantity.
FHIRPathListener.prototype.exitQuantity = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#unit.
FHIRPathListener.prototype.enterUnit = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#unit.
FHIRPathListener.prototype.exitUnit = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#dateTimePrecision.
FHIRPathListener.prototype.enterDateTimePrecision = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#dateTimePrecision.
FHIRPathListener.prototype.exitDateTimePrecision = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#pluralDateTimePrecision.
FHIRPathListener.prototype.enterPluralDateTimePrecision = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#pluralDateTimePrecision.
FHIRPathListener.prototype.exitPluralDateTimePrecision = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#typeSpecifier.
FHIRPathListener.prototype.enterTypeSpecifier = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#typeSpecifier.
FHIRPathListener.prototype.exitTypeSpecifier = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#qualifiedIdentifier.
FHIRPathListener.prototype.enterQualifiedIdentifier = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#qualifiedIdentifier.
FHIRPathListener.prototype.exitQualifiedIdentifier = function(ctx) {
};


// Enter a parse tree produced by FHIRPathParser#identifier.
FHIRPathListener.prototype.enterIdentifier = function(ctx) {
};

// Exit a parse tree produced by FHIRPathParser#identifier.
FHIRPathListener.prototype.exitIdentifier = function(ctx) {
};



exports.FHIRPathListener = FHIRPathListener;