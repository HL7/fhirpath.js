This will one day be a FHIRPath processing engine.

Status:  At the moment it is just a parser that can print the parsed tree.  See
bin/parseAndDisplay.js.

The version of the FHIRPath grammar being used is currently the STU1 Release.

Development Notes:
If you need to regenerate the parser from the ANTLR4 grammar (which is in
parser/FHIRPath.g4), first download the
ANTLR4 library from http://www.antlr.org/download/antlr-4.7.1-complete.jar into
the root of the project directory, and then run "npm run generateParser".
