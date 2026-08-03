# Aborting the asynchronous FHIRPath expression evaluation

If you are using the `async` option, you may also pass in the `signal` option
to allow for aborting the asynchronous evaluation of the FHIRPath expression.
Note that passing the `signal` option to `compile()` whose result is used more
than once is not allowed. If you need to abort the evaluation of the compiled
expression, you should pass the signal option to the function that is returned
by compile():

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

Identical in-flight server requests are shared across evaluations. Aborting one
evaluation rejects only that evaluation's request consumer; the shared network
request continues while at least one other consumer is still active. The
network request itself is aborted only after all of its consumers have
cancelled, when the runtime supports `AbortController`.

A shared request that remains pending for one hour, including while reading its
response body, is removed from the cache. All active consumers reject with a
`TimeoutError`, and the underlying network request is aborted when supported by
the runtime. A later evaluation can retry the request. This timeout is distinct
from user cancellation, which rejects with an `AbortError`.
