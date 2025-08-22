# Authentication to FHIR servers

You may want to use third-party authentication to access FHIR servers
(e.g. for terminology servers). In this case, you can pass in the `httpHeaders`
option.

For example, if in your application you use
[fhirclient npm-package](https://www.npmjs.com/package/fhirclient),
which sets the `Authorization` header for requests to the FHIR server,
you can pass in the same header to fhirpath.js so that it can
access the FHIR server with the same authorization:
```js
FHIR.oauth2.ready().then(client => {
  const res = fhirpath.evaluate(
    {"resourceType": "QuestionnaireResponse", ...},
    '%context.repeat(item).answer.weight().sum()',
    {},
    fhirpath_r4_model,
    {
      async: true,
      terminologyUrl: 'https://some-server',
      httpHeaders: {
        'https://some-server': {
          // Use the same Authorization header as fhirClient
          Authorization: client.getAuthorizationHeader()
        }
      }
    }
  );
});
```
