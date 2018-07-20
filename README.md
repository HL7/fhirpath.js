This will one day be a FHIRPath processing engine.

Status:  At the moment it is just a parser that can print the parsed tree.  See
bin/parseAndDisplay.js.

Development Notes:
If you need to regenerate the parser from the ANTLR4 grammar, first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm script build".
