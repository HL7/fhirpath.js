grammar FHIRPath;

// Grammar rules
// [FHIRPath](http://hl7.org/fhirpath/N1) Normative Release

//prog: line (line)*;
//line: ID ( '(' expr ')') ':' expr '\r'? '\n';
entireExpression
    : expression EOF
    ;

expression
        : term                                                      #termExpression
        | expression '.' invocation                                 #invocationExpression
        | expression '[' expression ']'                             #indexerExpression
        | ('+' | '-') expression                                    #polarityExpression
        | expression ('*' | '/' | 'div' | 'mod') expression         #multiplicativeExpression
        | expression ('+' | '-' | '&') expression                   #additiveExpression
        | expression '|' expression                                 #unionExpression
        | expression ('<=' | '<' | '>' | '>=') expression           #inequalityExpression
        | expression ('is' | 'as') typeSpecifier                    #typeExpression
        | expression ('=' | '~' | '!=' | '!~') expression           #equalityExpression
        | expression ('in' | 'contains') expression                 #membershipExpression
        | expression 'and' expression                               #andExpression
        | expression ('or' | 'xor') expression                      #orExpression
        | expression 'implies' expression                           #impliesExpression
        //| (IDENTIFIER)? '=>' expression                             #lambdaExpression
        ;

term
        : invocation                                            #invocationTerm
        | literal                                               #literalTerm
        | externalConstant                                      #externalConstantTerm
        | '(' expression ')'                                    #parenthesizedTerm
        ;

literal
        : '{' '}'                                               #nullLiteral
        | ('true' | 'false')                                    #booleanLiteral
        | STRING                                                #stringLiteral
        | NUMBER                                                #numberLiteral
        | DATETIME                                              #dateTimeLiteral
        | TIME                                                  #timeLiteral
        | quantity                                              #quantityLiteral
        ;

externalConstant
        : '%' ( identifier | STRING )
        ;

invocation                          // Terms that can be used after the function/member invocation '.'
        : identifier                                            #memberInvocation
        | functn                                              #functionInvocation
        | '$this'                                               #thisInvocation
        | '$index'                                              #indexInvocation
        | '$total'                                              #totalInvocation
        ;

functn
        : identifier '(' paramList? ')'
        ;

paramList
        : expression (',' expression)*
        ;

quantity
        : NUMBER unit?
        ;

unit
        : dateTimePrecision
        | pluralDateTimePrecision
        | STRING // UCUM syntax for units of measure
        ;

dateTimePrecision
        : 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
        ;

pluralDateTimePrecision
        : 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
        ;

typeSpecifier
        : qualifiedIdentifier
        ;

qualifiedIdentifier
        : identifier ('.' identifier)*
        ;

identifier
        : IDENTIFIER
        | DELIMITEDIDENTIFIER
        | 'as'
        | 'is'
        | 'contains'
        | 'in'
        ;


/****************************************************************
    Lexical rules
*****************************************************************/

/*
NOTE: The goal of these rules in the grammar is to provide a date
token to the parser. As such it is not attempting to validate that
the date is a correct date, that task is for the parser or interpreter.
*/

DATETIME
        : '@'
            [0-9][0-9][0-9][0-9] // year
            (
                '-'[0-9][0-9] // month
                (
                    '-'[0-9][0-9] // day
                    (
                        'T' TIMEFORMAT
                    )?
                 )?
             )?
             'Z'? // UTC specifier
        ;

TIME
        : '@' 'T' TIMEFORMAT
        ;

fragment TIMEFORMAT
        :
            [0-9][0-9] (':'[0-9][0-9] (':'[0-9][0-9] ('.'[0-9]+)?)?)?
            ('Z' | ('+' | '-') [0-9][0-9]':'[0-9][0-9])? // timezone
        ;

IDENTIFIER
        : ([A-Za-z] | '_')([A-Za-z0-9] | '_')*            // Added _ to support CQL (FHIR could constrain it out)
        ;

DELIMITEDIDENTIFIER
        : '`' (ESC | ~[\\`])* '`'
        ;

STRING
        : '\'' (ESC | ~['])* '\''
        ;

// Also allows leading zeroes now (just like CQL and XSD)
NUMBER
        : [0-9]+('.' [0-9]+)?
        ;

// Pipe whitespace to the HIDDEN channel to support retrieving source text through the parser.
WS
        : [ \r\n\t]+ -> channel(HIDDEN)
        ;

COMMENT
        : '/*' .*? '*/' -> channel(HIDDEN)
        ;

LINE_COMMENT
        : '//' ~[\r\n]* -> channel(HIDDEN)
        ;

fragment ESC
        : '\\' ([`'\\/fnrt] | UNICODE)    // allow \`, \', \\, \/, \f, etc. and \uXXX
        ;

fragment UNICODE
        : 'u' HEX HEX HEX HEX
        ;

fragment HEX
        : [0-9a-fA-F]
        ;


