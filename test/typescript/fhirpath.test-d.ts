// This file contains unit tests for TypeScript type declarations.
import * as fhirpath from '../../src/fhirpath';
import * as modelR4 from '../../fhir-context/r4'
import * as modelR3 from '../../fhir-context/stu3'
import {expectType} from "tsd";

const fhirData = {};
const envVars = {};
const somePath = 'somePath';

// If the async parameter is 'always', the return type should be
// "Promise<any[]>".
expectType<Promise<any[]>>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, {async: 'always'})
);
expectType<Promise<any[]>>(
    fhirpath.compile(somePath, modelR4, {async: 'always'})(fhirData, envVars)
);

// If the async parameter is false, the return type should be "any[]".
expectType<any[]>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, {async: false})
);
expectType<any[]>(
    fhirpath.compile(somePath, modelR4, {async: false})(fhirData, envVars)
);

// If the async parameter is not passed in, the return type should be "any[]".
expectType<any[]>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, {})
);
expectType<any[]>(
    fhirpath.compile(somePath, modelR4, {})(fhirData, envVars)
);

// If the async parameter is true, the return type should be
// "Promise<any[]> | any[]".
expectType<Promise<any[]> | any[]>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, {async: true})
);
expectType<Promise<any[]> | any[]>(
    fhirpath.compile(somePath, modelR4, {async: true})(fhirData, envVars)
);


// If the value of the async parameter is not determined at compile time,
// the return type should be "Promise<any[]> | any[]".
let unfixed: true | false | 'always' = Math.random() > 0.5 ? 'always' : false;
expectType<Promise<any[]> | any[]>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, {async: unfixed})
);
expectType<Promise<any[]> | any[]>(
    fhirpath.compile(somePath, modelR4, {async: unfixed})(fhirData, envVars)
);


// The model may not contain the score property.
expectType<any[]>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR3, {})
);
