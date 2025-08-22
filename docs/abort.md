# Aborting the asynchronous FHIRPath expression evaluation

If you are using the `async` option, you may also pass in the `signal` option
to allow for aborting the asynchronous evaluation of the FHIRPath expression.
Note that passing the `signal` option to `compile()` whose result is used more
than once will cause abortion problems. If you need to abort the evaluation of
the compiled expression, you should pass the signal option to the function that
is returned by compile():

```js
const evalExpr = fhirpath.compile(
  expression, model, {async: true}
);
const abortController = new AbortController();
const signal = abortController.signal;
let res = evalExpr(resource, environment, {signal});
// Abort the evaluation of the compiled expression
abortController.abort();
```
