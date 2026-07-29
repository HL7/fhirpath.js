// This file contains unit tests for TypeScript type declarations.
import * as fhirpath from '../../src/fhirpath';
import fhirpathDefault from '../../src/fhirpath.mjs';
import * as modelR4 from '../../fhir-context/r4'
import * as modelR3 from '../../fhir-context/stu3'
import {expectType, expectAssignable} from "tsd";
// Newly exported, consumer-facing types (guarded at the end of this file).
import type {
    Model,
    ResourceNode,
    Options,
    OptionVariants,
    Path,
    UserInvocationTable
} from '../../src/fhirpath';

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


// The ES module default export exposes the same API surface as the namespace
// import, so both `import * as fhirpath` and `import fhirpath from` work.
expectType<string>(fhirpathDefault.version);
expectType<Promise<any[]>>(
    fhirpathDefault.evaluate(fhirData, somePath, envVars, modelR4, {async: 'always'})
);
expectType<any[]>(
    fhirpathDefault.compile(somePath, modelR4, {async: false})(fhirData, envVars)
);


// The README-documented `util` helpers keep precise signatures; other helpers
// (e.g. `arraify`) and the `ucumUtils` instance are exposed as `any` via the
// index signature. Both named and default-export access are typed.
expectType<void>(fhirpath.util.checkAllowAsync({}, 'customFn'));
expectType<any>(fhirpath.util.valData(fhirData));
expectType<any>(fhirpath.util.arraify(fhirData));
expectType<void>(fhirpathDefault.util.checkAllowAsync({}, 'customFn'));
expectType<any>(fhirpath.ucumUtils);


// The consumer-facing types are exported and usable by name. Because the
// library ships hand-written .d.ts files, TypeScript does not error on
// importing a non-exported type from them, so these assertions mainly guard
// the existence and shape of each type rather than the `export` keyword itself.

// Model: `version` is the known FHIR-version union.
expectAssignable<Model['version']>('r4');

// Options is the base (async-free) options interface; OptionVariants adds the
// async mode and is the type evaluate/compile accept.
expectAssignable<Options>({resolveInternalTypes: false, preciseMath: true});
expectAssignable<OptionVariants>({async: 'always'});
const evalOpts: OptionVariants = {async: 'always'};
expectType<Promise<any[]>>(
    fhirpath.evaluate(fhirData, somePath, envVars, modelR4, evalOpts)
);

// UserInvocationTable: shape accepted by `options.userInvocationTable`.
const uit: UserInvocationTable = {
    myFn: {fn: () => [], arity: {1: ['String']}, nullable: true}
};
expectAssignable<Options>({userInvocationTable: uit});

// Path: `{base, expression}` is accepted as the expression argument.
const partialPath: Path = {base: 'Patient', expression: 'name.given'};
expectType<any[]>(
    fhirpath.evaluate(fhirData, partialPath, envVars, modelR4, {})
);

// ResourceNode: shape exposed with `resolveInternalTypes: false`, the debugger
// callback, and `internalStructures: true` custom functions.
declare const node: ResourceNode;
expectType<string | null>(node.path);
expectType<Model>(node.model);
expectType<any>(node.convertData());


