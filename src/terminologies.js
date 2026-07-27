// This file contains a class that implements the Terminology Service API.
// See https://hl7.org/fhir/fhirpath.html#txapi for details.


const util = require("./utilities");
const {ResourceNode, TypeInfo} = require('./types');


// Module-level cache of preferred terminology servers. When an operation on a
// ValueSet/CodeSystem/ConceptMap succeeds against one of the configured
// terminology servers, that server is remembered here and tried first for
// subsequent operations on the same artifact (across evaluations). The cache is
// a bounded LRU: a Map keeps entries in access order so the least-recently-used
// entry is evicted once the cache exceeds "preferredServerCacheMaxSize". A stale
// preference (a server that no longer has the artifact) is self-correcting:
// fetchFromServers() falls back to the other servers and re-records whichever
// now resolves it. The keys are strings of the form
// "<resourceType>|<canonical URL>" (see "preferredServerKey"); the values are
// terminology server base URLs.
const preferredServerCache = new Map();
// Maximum number of preferred-server entries to retain before evicting the
// least-recently-used one.
const preferredServerCacheMaxSize = 500;


/**
 * Builds a key for the preferred terminology server cache.
 * @param {string} resourceType - the artifact resource type (e.g. "ValueSet",
 *  "CodeSystem", "ConceptMap").
 * @param {string|undefined|null} url - the canonical URL of the artifact.
 * @return {string|null} - the cache key, or null when there is no URL to key on
 *  (e.g. an inline resource without a URL), in which case no preference is
 *  recorded or applied.
 */
function preferredServerKey(resourceType, url) {
  return url ? resourceType + '|' + url : null;
}


/**
 * Returns the first resource of the requested type from a FHIR search Bundle.
 * Search Bundles can also contain informational resources, such as an
 * OperationOutcome with "search.mode" set to "outcome", so callers must not
 * assume that the first entry is a search match.
 *
 * @param {Object|null|undefined} bundle - a FHIR search Bundle.
 * @param {string} resourceType - the resource type to find.
 * @return {Object|undefined} - the first resource with the requested type.
 */
function findBundleResource(bundle, resourceType) {
  return bundle?.entry?.find(
    entry => entry?.resource?.resourceType === resourceType
  )?.resource;
}


/**
 * Returns the preferred server for the given cache key, or undefined if there
 * is no such preference. Accessing a preference marks it as most-recently-used.
 * @param {string} key - the cache key (see "preferredServerKey").
 * @return {string|undefined}
 */
function getPreferredServer(key) {
  const server = preferredServerCache.get(key);
  if (server !== undefined) {
    // Mark the entry as most-recently-used by re-inserting it.
    preferredServerCache.delete(key);
    preferredServerCache.set(key, server);
  }
  return server;
}


/**
 * Remembers, as the most-recently-used entry, the server that successfully
 * resolved the artifact identified by the given cache key, evicting the
 * least-recently-used entry if the cache exceeds its maximum size.
 * @param {string} key - the cache key (see "preferredServerKey").
 * @param {string} server - the terminology server base URL.
 */
function rememberPreferredServer(key, server) {
  // (Re)insert as the most-recently-used entry.
  preferredServerCache.delete(key);
  preferredServerCache.set(key, server);
  // Evict the least-recently-used entry (the first key in insertion order) when
  // the cache has grown beyond its maximum size.
  if (preferredServerCache.size > preferredServerCacheMaxSize) {
    preferredServerCache.delete(preferredServerCache.keys().next().value);
  }
}


/**
 * Rejects the current terminology operation as cancelled by throwing an
 * AbortError. Used by "fetchFromServers" so that every cancellation path
 * surfaces the same standardized error (matching the abort handling in
 * "applyParsedPath") instead of a leftover network/OperationOutcome rejection.
 * @throws {DOMException} - always throws an "AbortError" DOMException.
 */
function throwAbortError() {
  throw new DOMException(
    'Evaluation of the expression was aborted.', 'AbortError');
}


class Terminologies {
  /**
   * Creates a terminology service client.
   * @param {string[]} terminologyUrls - terminology server base URLs, in the
   *  order in which servers should be tried when no preferred server is known.
   */
  constructor(terminologyUrls) {
    // The ordered list of terminology server base URLs.
    this.terminologyUrls = terminologyUrls;
    this.invocationTable = Terminologies.invocationTable;
  }


  /**
   * Returns the configured terminology servers ordered so that the preferred
   * server for the given cache key (if any and if configured) comes first.
   * @param {string|null} key - the preferred-server cache key, or null.
   * @return {string[]}
   */
  orderServers(key) {
    const urls = this.terminologyUrls;
    if (key && urls.length > 1) {
      const preferred = getPreferredServer(key);
      if (preferred && urls.indexOf(preferred) > 0) {
        return [preferred, ...urls.filter(u => u !== preferred)];
      }
    }
    return urls;
  }


  /**
   * Performs a terminology request against the configured servers, trying them
   * in order (preferred server first, see "orderServers") until one returns an
   * acceptable response. The first server that succeeds for the given cache key
   * is remembered as preferred for subsequent operations on the same artifact.
   *
   * Any failed request (a rejected promise - e.g. a network error, a non-OK
   * HTTP status, or an OperationOutcome response) is treated as "the artifact is
   * absent on that server", so the next server is tried. When no server returns
   * an acceptable response, the returned promise rejects; callers treat that
   * rejection as an empty result.
   *
   * Cancellation is the exception: when a request rejects with an AbortError or
   * "ctx.signal" is already aborted, the returned promise rejects immediately
   * with an AbortError instead of falling back to the remaining servers, so
   * aborting the evaluation does not dispatch further requests.
   *
   * @param {Object} ctx - object describing the context of expression
   *  evaluation (see the "applyParsedPath" function).
   * @param {string|null} key - the preferred-server cache key (see
   *  "preferredServerKey"), or null to disable server preference tracking.
   * @param {string|function} isFound - either the expected "resourceType" of a
   *  successful response, or a predicate "(response) => boolean" that returns
   *  true when the response indicates the artifact was found on the server.
   * @param {function} buildRequest - a function
   *  "(baseUrl) => Promise|null|undefined" that returns a promise of the
   *  response fetched from the given server, or null/undefined if the request
   *  cannot be built (in which case the returned promise rejects and callers
   *  treat it as an empty result). Whether a request can be built should not
   *  depend on "baseUrl": the null/undefined decision is expected to be the
   *  same for every server.
   * @return {Promise<Object>} - a promise resolving to the successful response.
   *  The promise rejects when "buildRequest" yields no request, or when no
   *  server produces an acceptable response (indicating the artifact is absent
   *  from every configured server); callers treat either rejection as an empty
   *  result.
   */
  fetchFromServers(ctx, key, isFound, buildRequest) {
    const servers = this.orderServers(key);
    const accepts = typeof isFound === 'function'
      ? isFound
      : (obj) => obj?.resourceType === isFound;
    const attempt = (i) => {
      if (i >= servers.length) {
        // No server returned an acceptable response: every request either
        // failed or did not contain the artifact. Callers treat this rejection
        // as an empty result.
        return Promise.reject(
          new Error('No terminology server could satisfy the request.')
        );
      }
      const baseUrl = servers[i];
      const built = buildRequest(baseUrl);
      if (built == null) {
        // The request cannot be built (e.g. insufficient data); trying other
        // servers would not help. Reject (rather than returning null) so this
        // method always returns a promise; callers treat the rejection as an
        // empty result.
        return Promise.reject(
          new Error('The terminology request could not be built.')
        );
      }
      return Promise.resolve(built).then(
        (obj) => {
          if (accepts(obj)) {
            // Only track a preferred server when there is more than one server
            // to choose between; with a single server orderServers() never
            // consults the cache, so recording would only churn the global LRU.
            if (key && servers.length > 1) {
              rememberPreferredServer(key, baseUrl);
            }
            return obj;
          }
          // A response that resolved unusably (not "accepted") normally falls
          // through to the next server; but if the evaluation was aborted while
          // it was in flight, stop here instead of dispatching more requests.
          if (ctx.signal?.aborted) {
            throwAbortError();
          }
          return attempt(i + 1);
        },
        // A rejection normally means the artifact is absent on this server (a
        // network error, non-OK status, or an OperationOutcome), so try the
        // next one. Cancellation is different: on an AbortError, or when
        // ctx.signal is already aborted, reject with an AbortError instead of
        // falling back, so aborting does not dispatch requests to more servers.
        (err) => {
          if (err?.name === 'AbortError' || ctx.signal?.aborted) {
            throwAbortError();
          }
          return attempt(i + 1);
        }
      );
    };
    return attempt(0);
  }


  /**
   * Locates the configured terminology server that holds the artifact with the
   * given canonical URL by searching each server (in preferred-then-configured
   * order, see "orderServers") for "<searchType>?url=<url>". The first server
   * whose search returns a matching resource is recorded as the preferred
   * server (see "fetchFromServers") and its base URL is captured, so the caller
   * can send the follow-up operation to that same server without an additional
   * lookup. Intended for the multi-server case; the caller decides when to use
   * it (e.g. only when more than one server is configured).
   *
   * @param {Object} ctx - object describing the context of expression
   *  evaluation (see the "applyParsedPath" function).
   * @param {string|null} key - the preferred-server cache key (see
   *  "preferredServerKey").
   * @param {string} searchType - the resource type to search for (e.g.
   *  "ValueSet", "CodeSystem", "ConceptMap").
   * @param {string|CanonicalOperationInfo} canonical - either the canonical URL
   *  of the artifact to locate, optionally suffixed with "|version", or
   *  normalized canonical operation information. The effective version is sent
   *  as a separate "version" search parameter.
   * @return {Promise<{baseUrl: string, resource: Object}>} - a promise
   *  resolving to the base URL of the holding server and the located resource.
   *  When no server holds the artifact, the promise rejects (see
   *  "fetchFromServers").
   */
  locateServer(ctx, key, searchType, canonical) {
    // Normalize "url|version" so the version is matched by the FHIR "version"
    // search parameter instead of being appended to the "url" value (which the
    // server would not match against an unversioned canonical).
    const query = new URLSearchParams(
      getCanonicalSearchParams(canonical)
    ).toString();
    return this.fetchFromServers(
      ctx, key,
      (located) => !!located.resource,
      (baseUrl) => util.fetchWithCache(
        `${baseUrl}/${searchType}?${query}`, ctx
      ).then((bundle) => {
        return {
          baseUrl,
          resource: findBundleResource(bundle, searchType)
        };
      })
    );
  }

  // Same as fhirpath.invocationTable, but for %terminologies methods
  static invocationTable = {
    expand: { fn: Terminologies.expand, arity: {
      1: ['AnyAtRoot'],
      2: ['AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    lookup: { fn: Terminologies.lookup, arity: {
      1: ['AnyAtRoot'],
      2: ['AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    validateVS: { fn: Terminologies.validateVS, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    validateCS: { fn: Terminologies.validateCS, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    subsumes: { fn: Terminologies.subsumes, arity: {
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnyAtRoot'],
      4: ['AnyAtRoot', 'AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    },
    translate: { fn: Terminologies.translate, arity: {
      2: ['AnyAtRoot', 'AnyAtRoot'],
      3: ['AnyAtRoot', 'AnyAtRoot', 'AnySingletonAtRoot'] }
    }
  };


  /**
   * This calls the Terminology Service $expand operation.
   * https://hl7.org/fhir/terminology-service.html#expand
   * https://hl7.org/fhir/valueset-operation-expand.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} valueSetColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ValueSet, or
   *  a ResourceNode with a canonical URL reference to a value set, or
   *  a string with a canonical URL reference to a value set.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the expand operation (e.g. 'displayLanguage=en&activeOnly=true').
   * @return {Promise<ResourceNode|null>|null} - a ValueSet resource
   *  (https://hl7.org/fhir/valueset.html) with an expansion, or an empty
   *  value if an error occurs.
   */
  static expand(self, valueSetColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'expand');

    if (valueSetColl.length === 1 && checkParams(params)) {
      const typeInfo = TypeInfo.fromValue(valueSetColl[0]);
      const valueSet = util.valData(valueSetColl[0]);

      if (typeInfo.is(TypeInfo.FhirUri, ctx.model) || typeInfo.is(TypeInfo.SystemString, ctx.model)) {
        const canonical = splitCanonicalForOperation(
          valueSet, 'valueSetVersion', params);
        const query = new URLSearchParams({
          url: canonical.url,
          ...(canonical.operationVersion
            ? {valueSetVersion: canonical.operationVersion}
            : {})
        }).toString();
        response = self[0].fetchFromServers(
          ctx, preferredServerKey(
            'ValueSet', getCanonicalPreferenceUrl(canonical)
          ), 'ValueSet',
          (baseUrl) => util.fetchWithCache(
            `${baseUrl}/ValueSet/$expand?${query}${
              params ? '&' + params : ''
            }`,
            ctx
          )
        );
      } else if (typeInfo.is(TypeInfo.FhirValueSet, ctx.model)) {
        const parameters = [{
          "name": "valueSet",
          "resource": valueSet
        }, ...toFhirParameters(params)];

        response = self[0].fetchFromServers(
          ctx, preferredServerKey('ValueSet', valueSet?.url), 'ValueSet',
          (baseUrl) => util.fetchWithCache(`${baseUrl}/ValueSet/$expand`, ctx, {
            method: 'POST',
            body: util.toJSON({
              "resourceType": "Parameters",
              "parameter": parameters
            })
          })
        );
      }
    }

    return transformResponseToResource(ctx, response, 'ValueSet');
  }


  /**
   * This calls the Terminology Service $lookup operation.
   * https://hl7.org/fhir/terminology-service.html#lookup
   * https://hl7.org/fhir/codesystem-operation-lookup.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a Coding, a CodeableConcept, or a resource
   *  element that is a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the lookup operation (e.g. 'date=2011-03-04&displayLanguage=en').
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the lookup operation.
   */
  static lookup(self, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'lookup');

    if (codedColl.length === 1 && checkParams(params)) {
      const {isCodeableConcept, isCoding, isCode} = getCodedType(ctx, codedColl);
      if (isCodeableConcept || isCoding || isCode) {
        const coded = util.valData(codedColl[0]);
        const codedParamName = isCodeableConcept || isCoding ? 'coding' : 'code';
        // Identify the CodeSystem by the coding's system (when available) so
        // that the server that resolves it can be preferred later.
        const system = isCoding ? coded?.system
          : isCodeableConcept ? coded?.coding?.[0]?.system
            : undefined;
        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            {
              name: codedParamName,
              [paramName2valueXName[codedParamName]]: isCodeableConcept ? coded?.coding : coded
            },
            ...toFhirParameters(params)
          ]
        };
        response = self[0].fetchFromServers(
          ctx, preferredServerKey('CodeSystem', system), 'Parameters',
          (baseUrl) => util.fetchWithCache(
            `${baseUrl}/CodeSystem/$lookup`, ctx, {
              method: "POST",
              body: util.toJSON(parameters)
            }
          )
        );
      }
    }

    return transformResponseToResource(ctx, response, 'Parameters');
  }


  /**
   * This calls the Terminology Service $validate-code operation on a value set.
   * https://hl7.org/fhir/terminology-service.html#validation
   * https://hl7.org/fhir/valueset-operation-validate-code.html
   * The source code of this function is based on this script:
   * https://gist.github.com/brianpos/97e1237470d76835ea9a35bf8e021ca6#file-fhirpath-async-ts
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} valueSetColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ValueSet, or
   *  a ResourceNode with a canonical URL reference to a value set, or
   *  a string with a canonical URL reference to a value set.
   * @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a Coding, a CodeableConcept, or a resource
   *  element that is a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en').
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the validation operation.
   */
  static validateVS(self, valueSetColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'validateVS');

    const valueSet = valueSetColl.length === 1 && util.valData(valueSetColl[0]);
    const coded = codedColl.length === 1 && util.valData(codedColl[0]);

    // If valueSet or coded are empty, we can predict that the $validate-code
    // operation will return an error.
    if(valueSet && coded && checkParams(params)) {
      const vsTypeInfo = TypeInfo.fromValue(valueSetColl[0]);
      const isActualValueSet = vsTypeInfo.is(TypeInfo.FhirValueSet, ctx.model);
      const isValueSetUrl = vsTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        vsTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualValueSet || isValueSetUrl) {
        const {isCodeableConcept, isCoding, isCode} = getCodedType(ctx, codedColl);
        if (isCodeableConcept || isCoding || isCode) {
          const canonical = isValueSetUrl
            ? splitCanonicalForOperation(
              valueSet, 'valueSetVersion', params)
            : null;
          const vsKeyUrl = isValueSetUrl
            ? getCanonicalPreferenceUrl(canonical)
            : valueSet?.url;
          const key = preferredServerKey('ValueSet', vsKeyUrl);
          const operationValueSet = canonical?.url ?? valueSet;

          // Builds and sends the $validate-code request to "baseUrl". "foundVs"
          // is the ValueSet resource located on that server (see "locateServer")
          // and lets us derive the system for a bare code without an extra
          // request; when it is not provided, getSystemFromVS() is used instead.
          const operate = (baseUrl, foundVs) => {
            const requestUrl = `${baseUrl}/ValueSet/$validate-code`;
            // getSystemFromVS()/getSystemFromValueSetResource() are a workaround
            // for the case where we don't have a system. See discussion here:
            //  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
            const resolveSystem = () => foundVs
              ? Promise.resolve(foundVs).then(getSystemFromValueSetResource)
              : getSystemFromVS(ctx, baseUrl, valueSet, canonical);

            // Use a POST request if the passed valueSet is an actual ValueSet or
            // the passed coded value is a CodeableConcept with more than one
            // coding or no coding.
            if (isActualValueSet || isCodeableConcept && coded.coding?.length !== 1) {
              return (isCode ? resolveSystem() : Promise.resolve()).then(system => {
                const codedParamName = isCodeableConcept ?
                  'codeableConcept' : isCoding ? 'coding' : 'code';
                const parameters = {
                  resourceType: 'Parameters',
                  parameter: [
                    {
                      name: isActualValueSet ? 'valueSet' : 'url',
                      [isActualValueSet ? 'resource' : 'valueUri']:
                        operationValueSet
                    },
                    ...makeVersionParameter(
                      'valueSetVersion', canonical?.operationVersion),
                    {
                      name: codedParamName,
                      [paramName2valueXName[codedParamName]]: coded
                    },
                    ...(system ? [{name: 'system', valueUri: system}] : []),
                    ...toFhirParameters(params)
                  ]
                };
                return util.fetchWithCache(
                  requestUrl, ctx, {
                    method: "POST",
                    body: util.toJSON(parameters)
                  }
                );
              });
            } else { // Otherwise use a GET request.
              if (isCode) {
                return resolveSystem().then((system) => {
                  const queryParams2 = new URLSearchParams({
                    url: operationValueSet,
                    ...(canonical?.operationVersion
                      ? {valueSetVersion: canonical.operationVersion}
                      : {}),
                    code: coded,
                    system
                  });
                  return util.fetchWithCache(
                    `${requestUrl}?${queryParams2.toString() + (params ? '&' + params : '')}`,
                    ctx
                  );
                });
              } else {
                // If the coded value is a CodeableConcept with only one Coding
                const codedForReq = isCodeableConcept ? coded.coding[0] : coded;
                // If the coded value is Coding and has system and code, we can
                // use it in the request URL; otherwise, the $validate-code
                // operation will return an error.
                if (codedForReq?.system && codedForReq?.code) {
                  const queryParams = new URLSearchParams({
                    url: operationValueSet,
                    ...(canonical?.operationVersion
                      ? {valueSetVersion: canonical.operationVersion}
                      : {}),
                    system: codedForReq.system,
                    code: codedForReq.code
                  });
                  return util.fetchWithCache(
                    `${requestUrl}?${queryParams.toString() + (params ? '&' + params : '')}`,
                    ctx
                  );
                }
                return null;
              }
            }
          };

          if (isValueSetUrl && self[0].terminologyUrls.length > 1) {
            // Multiple servers and a canonical URL reference: find the server
            // that holds the ValueSet first, then validate only against it
            // (trusting its result), instead of inspecting each response for
            // "not resolved" issues.
            response = self[0].locateServer(ctx, key, 'ValueSet', canonical)
              .then(located => operate(located.baseUrl, located.resource));
          } else {
            // A single server, or an inline ValueSet that every server can
            // process: send the operation directly (trying servers in order).
            response = self[0].fetchFromServers(
              ctx, key, 'Parameters', (baseUrl) => operate(baseUrl)
            );
          }
        }
      }
    }

    return transformResponseToResource(ctx, response, 'Parameters');
  }


  /**
   * This calls the Terminology Service $validate-code operation on a code
   * system.
   * https://hl7.org/fhir/terminology-service.html#validation
   * https://hl7.org/fhir/codesystem-operation-validate-code.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} codeSystemColl - an array that should have
   *  one element, which is either a ResourceNode with an actual CodeSystem, or
   *  a ResourceNode with a canonical URL reference to a code system, or
   *  a string with a canonical URL reference to a code system.
   * @param {(ResourceNode|string)[]} codedColl - an array that should have
   *  one element, which is either a ResourceNode with a Coding,
   *  a CodeableConcept, or a code, or a string with a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the validate-code operation (e.g. 'date=2011-03-04&displayLanguage=en')
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the validation operation.
   */
  static validateCS(self, codeSystemColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'validateCS');

    if(codeSystemColl.length === 1 && codedColl.length === 1 &&
      checkParams(params)) {
      const csTypeInfo = TypeInfo.fromValue(codeSystemColl[0]);
      const isActualCodeSystem =
        csTypeInfo.is(TypeInfo.FhirCodeSystem, ctx.model);
      const isCodeSystemUrl = csTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        csTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualCodeSystem || isCodeSystemUrl) {
        const {isCodeableConcept, isCoding, isCode} = getCodedType(ctx, codedColl);
        if (isCodeableConcept || isCoding || isCode) {
          const codeSystem = util.valData(codeSystemColl[0]);
          const coded = util.valData(codedColl[0]);
          const canonical = isCodeSystemUrl
            ? splitCanonicalForOperation(codeSystem, 'version', params)
            : null;
          const csKeyUrl = isCodeSystemUrl
            ? getCanonicalPreferenceUrl(canonical)
            : codeSystem?.url;
          const key = preferredServerKey('CodeSystem', csKeyUrl);
          const operationCodeSystem = canonical?.url ?? codeSystem;
          const codedParamName = isCodeableConcept ?
            'codeableConcept' : isCoding ? 'coding' : 'code';
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: isActualCodeSystem ? 'codeSystem' : 'url',
                [isActualCodeSystem ? 'resource' : 'valueUri']:
                  operationCodeSystem
              },
              ...makeVersionParameter(
                'version', canonical?.operationVersion),
              {
                name: codedParamName,
                [paramName2valueXName[codedParamName]]: coded
              },
              ...toFhirParameters(params)
            ]
          };
          const operate = (baseUrl) => util.fetchWithCache(
            `${baseUrl}/CodeSystem/$validate-code`, ctx, {
              method: "POST",
              body: util.toJSON(parameters)
            }
          );

          if (isCodeSystemUrl && self[0].terminologyUrls.length > 1) {
            // Multiple servers and a canonical URL reference: find the server
            // that holds the CodeSystem first, then validate only against it
            // (trusting its result).
            response = self[0].locateServer(
              ctx, key, 'CodeSystem', canonical
            )
              .then(located => operate(located.baseUrl));
          } else {
            // A single server, or an inline CodeSystem that every server can
            // process: send the operation directly (trying servers in order).
            response = self[0].fetchFromServers(ctx, key, 'Parameters', operate);
          }
        }
      }
    }

    return transformResponseToResource(ctx, response, 'Parameters');
  }


  /**
   * This calls the Terminology Service $subsumes operation.
   * https://build.fhir.org/terminology-service.html#subsumes
   * https://build.fhir.org/codesystem-operation-subsumes.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} systemColl - an array that should have
   *  one element, which is either a ResourceNode with a canonical URL reference
   *  to a code system, or a string with a canonical URL reference to a code
   *  system.
   * @param {(ResourceNode|string)[]} coded1Coll - an array that should have one
   *  element, which is either a ResourceNode with a Coding, or a code, or
   *  a string with a code.
   * @param {(ResourceNode|string)[]} coded2Coll - an array that should have one
   *  element, which is either a ResourceNode with a Coding, or a code, or
   *  a string with a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the subsumes operation (e.g. 'version=2014-05-06').
   * @return {Promise<ResourceNode|null>|null} - a ResourceNode with a code as
   *  specified for the subsumes operation.
   */
  static subsumes(self, systemColl, coded1Coll, coded2Coll, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'subsumes');

    if(systemColl.length === 1 && coded1Coll.length === 1 &&
      coded2Coll.length === 1 && checkParams(params)) {
      const csTypeInfo = TypeInfo.fromValue(systemColl[0]);
      const isCodeSystemUrl = csTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        csTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isCodeSystemUrl) {
        const coded1TypeInfo = TypeInfo.fromValue(coded1Coll[0]);
        const coded2TypeInfo = TypeInfo.fromValue(coded2Coll[0]);
        const isCoding1 = coded1TypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode1 = coded1TypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          coded1TypeInfo.is(TypeInfo.SystemString, ctx.model);
        const isCoding2 = coded2TypeInfo.is(TypeInfo.FhirCoding, ctx.model);
        const isCode2 = coded2TypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
          coded2TypeInfo.is(TypeInfo.SystemString, ctx.model);
        if ((isCoding1 || isCode1) && (isCoding2 || isCode2)) {
          const system = util.valData(systemColl[0]);
          const canonical = splitCanonicalForOperation(
            system, 'version', params);
          const coded1 = util.valData(coded1Coll[0]);
          const coded2 = util.valData(coded2Coll[0]);
          const coded1ParamName = isCoding1 ? 'codingA' : 'codeA';
          const coded2ParamName = isCoding1 ? 'codingB' : 'codeB';
          const coded1ValueName = isCoding2 ? 'valueCoding' : 'valueCode';
          const coded2ValueName = isCoding2 ? 'valueCoding' : 'valueCode';
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: 'system',
                valueUri: canonical.url
              },
              ...makeVersionParameter('version', canonical.operationVersion),
              {
                name: coded1ParamName,
                [coded1ValueName]: coded1
              },
              {
                name: coded2ParamName,
                [coded2ValueName]: coded2
              },
              ...toFhirParameters(params)
            ]
          };
          response = self[0].fetchFromServers(
            ctx, preferredServerKey(
              'CodeSystem', getCanonicalPreferenceUrl(canonical)
            ), 'Parameters',
            (baseUrl) => util.fetchWithCache(
              `${baseUrl}/CodeSystem/$subsumes`, ctx, {
                method: "POST",
                body: util.toJSON(parameters),
              }
            )
          );
        }
      }
    }

    return response && response.then(obj => {
      // "fetchFromServers" only resolves with an accepted Parameters response
      // (otherwise it rejects), so the outcome can be read directly here.
      const code = obj.parameter?.find(p => p.name === 'outcome')?.valueCode;
      return ResourceNode.makeResNode(
        ctx, code, null, 'code', null, 'code');
    }).catch(() => null);

  }


  /**
   * This calls the Terminology Service $translate operation.
   * https://build.fhir.org/terminology-service.html#translate
   * https://build.fhir.org/conceptmap-operation-translate.html
   *
   * @param {Terminologies[]} self - an array with one element that refers to
   *  the current Terminology instance.
   * @param {(ResourceNode|string)[]} conceptMapColl - an array that should have
   *  one element, which is either a ResourceNode with an actual ConceptMap, or
   *  a canonical URL reference to a ConceptMap, or a string with a canonical
   *  URL reference to a ConceptMap.
   * @param {(ResourceNode|string)[]} codedColl - the source to translate: an
   *  array that should have one element, which is either a ResourceNode with a
   *  CodeableConcept, a Coding, or a code, or a string with a code.
   * @param {string} [params] - a URL encoded string with other parameters for
   *  the translate operation (e.g.
   *  'source=http://acme.org/valueset/23&target=http://acme.org/valueset/23').
   * @return {Promise<ResourceNode|null>|null} - a Parameters resource
   *  (https://build.fhir.org/parameters.html) with the results of
   *  the translation operation.
   */
  static translate(self, conceptMapColl, codedColl, params = '') {
    let response = null;
    const ctx = this;
    util.checkAllowAsync(ctx, 'translate');

    if(conceptMapColl.length === 1 && codedColl.length === 1 &&
      checkParams(params)) {
      const cmTypeInfo = TypeInfo.fromValue(conceptMapColl[0]);
      const isActualConceptMap = cmTypeInfo.is(TypeInfo.FhirConceptMap,
        ctx.model);
      const isConceptMapUrl = cmTypeInfo.is(TypeInfo.FhirUri, ctx.model) ||
        cmTypeInfo.is(TypeInfo.SystemString, ctx.model);
      if (isActualConceptMap || isConceptMapUrl) {
        const {isCodeableConcept, isCoding, isCode} = getCodedType(ctx, codedColl);
        if (isCoding || isCode) {
          const conceptMap = util.valData(conceptMapColl[0]);
          const coded = util.valData(codedColl[0]);
          const canonical = isConceptMapUrl
            ? splitCanonicalForOperation(
              conceptMap, 'conceptMapVersion', params)
            : null;
          const cmKeyUrl = isConceptMapUrl
            ? getCanonicalPreferenceUrl(canonical)
            : conceptMap?.url;
          const key = preferredServerKey('ConceptMap', cmKeyUrl);
          const operationConceptMap = canonical?.url ?? conceptMap;
          const m = modelToTranslateSourceParamName[ctx.model.version];
          const codedParamName = isCodeableConcept ?
            m.sourceCodeableConcept : isCoding ? m.sourceCoding : m.sourceCode;
          const parameters = {
            resourceType: 'Parameters',
            parameter: [
              {
                name: isActualConceptMap ? 'conceptMap' : 'url',
                [isActualConceptMap ? 'resource' : 'valueUri']:
                  operationConceptMap
              },
              ...makeVersionParameter(
                'conceptMapVersion', canonical?.operationVersion),
              {
                name: codedParamName,
                [paramName2valueXName[codedParamName]]: coded
              },
              ...toFhirParameters(params)
            ]
          };
          const operate = (baseUrl) => util.fetchWithCache(
            `${baseUrl}/CodeSystem/$translate`, ctx, {
              method: "POST",
              body: util.toJSON(parameters)
            }
          );

          if (isConceptMapUrl && self[0].terminologyUrls.length > 1) {
            // Multiple servers and a canonical URL reference: find the server
            // that holds the ConceptMap first, then translate only against it
            // (trusting its result).
            response = self[0].locateServer(
              ctx, key, 'ConceptMap', canonical
            )
              .then(located => operate(located.baseUrl));
          } else {
            // A single server, or an inline ConceptMap that every server can
            // process: send the operation directly (trying servers in order).
            response = self[0].fetchFromServers(ctx, key, 'Parameters', operate);
          }
        }
      }
    }

    return transformResponseToResource(ctx, response, 'Parameters');
  }

}


/**
 * Returns false if the params parameter is not empty and is not a valid
 * URL-encoded string, true otherwise.
 * @param {string|undefined} params - a URL encoded string with parameters
 *  (e.g. 'date=2011-03-04&displayLanguage=en').
 *  @returns {boolean} - true if the params parameter is empty or a valid.
 */
function checkParams(params) {
  return !params?.split('&').find(
    p => {
      if (p[0] === '=') {
        return true;
      } else {
        const v = p.split('=');
        return v.length <= 2 && v.find(x =>
          v && encodeURIComponent(decodeURIComponent(x)) !== x);
      }
    }
  );
}


/**
 * Normalized canonical information for a terminology operation.
 * "effectiveVersion" identifies the artifact version used for server discovery
 * and preference tracking. "operationVersion" is present only when the version
 * must be added separately to the operation request; an explicit version that
 * is already present in the raw operation parameters is not duplicated.
 *
 * @typedef {Object} CanonicalOperationInfo
 * @property {string} url - canonical URL without a version suffix.
 * @property {string|undefined} effectiveVersion - version selected by the
 *  explicit operation parameter or, when absent, by the canonical suffix.
 * @property {string|undefined} operationVersion - canonical suffix to add to
 *  the operation request when no explicit version parameter was supplied.
 */


/**
 * Normalizes a versioned canonical for use in a terminology operation. A
 * version supplied explicitly in the operation parameters takes precedence
 * over the canonical suffix, including when the explicit value is empty. Raw
 * operation parameters are left unchanged.
 *
 * @param {string} canonical - canonical URL, optionally suffixed with a version.
 * @param {string} versionParamName - operation-specific version parameter name.
 * @param {string} params - URL-encoded additional operation parameters.
 * @returns {CanonicalOperationInfo}
 */
function splitCanonicalForOperation(canonical, versionParamName, params) {
  const parts = util.splitCanonicalUrl(canonical);
  const operationParams = new URLSearchParams(params);
  const hasExplicitVersion = operationParams.has(versionParamName);
  return {
    url: parts.url,
    effectiveVersion: hasExplicitVersion
      ? operationParams.get(versionParamName)
      : parts.version,
    operationVersion: hasExplicitVersion ? undefined : parts.version
  };
}


/**
 * Converts a canonical URL or normalized operation information to FHIR search
 * parameters. The effective version is included whenever it is defined,
 * including an explicitly empty version.
 *
 * @param {string|CanonicalOperationInfo} canonical - canonical URL or normalized
 *  operation information.
 * @returns {{url: string, version?: string}}
 */
function getCanonicalSearchParams(canonical) {
  if (typeof canonical === 'string') {
    return util.splitCanonicalUrl(canonical);
  }
  return {
    url: canonical.url,
    ...(canonical.effectiveVersion !== undefined
      ? {version: canonical.effectiveVersion}
      : {})
  };
}


/**
 * Reassembles the effective canonical used for preferred-server cache keys.
 *
 * @param {CanonicalOperationInfo} canonical - normalized operation information.
 * @returns {string} canonical URL, optionally suffixed with its effective
 *  version.
 */
function getCanonicalPreferenceUrl(canonical) {
  return canonical.effectiveVersion === undefined
    ? canonical.url
    : canonical.url + '|' + canonical.effectiveVersion;
}


/**
 * Builds a FHIR Parameters entry for an operation-specific canonical version.
 * @param {string} name - operation parameter name.
 * @param {string|undefined} version - canonical version.
 * @returns {Object[]} an empty array when no version is present, otherwise a
 *  singleton array containing the version parameter.
 */
function makeVersionParameter(name, version) {
  return version ? [{name, valueString: version}] : [];
}


/**
 * Returns the code system URI from the value set if it is the same for all items.
 * Workaround for the case where we don't have a system. See discussion here:
 *  https://chat.fhir.org/#narrow/stream/179266-fhirpath/topic/Problem.20with.20the.20.22memberOf.22.20function.20and.20R4.20servers
 *
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {string} baseUrl - the base URL of the terminology server to query.
 * @param {Object|string} valueSet - either an actual ValueSet, or a canonical
 *  URL reference to a value set.
 * @param {CanonicalOperationInfo|null} canonical - normalized canonical
 *  information when "valueSet" is a canonical URL.
 * @return {Promise<string>} - a promise that resolves to the code system.
 */
function getSystemFromVS(ctx, baseUrl, valueSet, canonical) {
  return (
    typeof valueSet === 'string' ?
      util.fetchWithCache(
        `${baseUrl}/ValueSet?${
          new URLSearchParams(
            getCanonicalSearchParams(canonical || valueSet)
          ).toString()
        }`,
        ctx
      ).then(
        bundle => findBundleResource(bundle, 'ValueSet') ?? null
      )
      : Promise.resolve(valueSet)
  )
    .then(getSystemFromValueSetResource);
}


/**
 * Returns the single code system URI shared by all items of the given ValueSet
 * resource. Throws if the value set does not resolve to a single code system.
 * Extracted so that a ValueSet already fetched while locating the terminology
 * server (see "locateServer") can be reused without an extra request.
 *
 * @param {Object|null|undefined} vs - a ValueSet resource.
 * @return {string} - the code system URI.
 * @throws {Error} - if the value set does not have a single code system.
 */
function getSystemFromValueSetResource(vs) {
  const system = vs && (
    getSystemFromArrayItems(vs.expansion?.contains)
    || getSystemFromArrayItems(vs.compose?.include)
  );
  if (system) {
    return system;
  }
  throw new Error('The valueset does not have a single code system.');
}


/**
 * Determines if all items in the given array have the same "system" property.
 * If the "system" property is consistent across all items, returns that value.
 * Otherwise, returns undefined.
 *
 * @param {Object[]|undefined} arr - An array of objects, each potentially
 *  containing a "system" property.
 * @param {string|undefined} [system] - An optional initial value for
 *  the "system" property.
 * @returns {string|undefined} - The consistent "system" value if all items
 *  share the same value, or undefined otherwise.
 */
function getSystemFromArrayItems(arr, system = undefined) {
  if (arr) {
    for (let i = 0; i < arr.length; ++i) {
      if (!system) {
        system = arr[i].system;
      } else if (system !== arr[i].system) {
        system = undefined;
        break;
      }
    }
  }

  return system;
}


/**
 * Parses a URL-encoded string with parameters and converts it into an array of
 * objects representing the parameters for the "Parameters" FHIR resource.
 *
 * @param {string} params - A URL-encoded string with parameters (e.g.,
 *  'key1=value1&key2=value2').
 * @returns {Object[]} - An array of objects where each object represents
 * a parameter with:
 *  - `name`: The decoded parameter name.
 *  - an additional value[x] field based on the parameter value type, determined
 *    by `getParamValue`.
 */
function toFhirParameters(params) {
  const parsed = [];
  params.split('&').forEach(p => {
    const [key, value] = p.split('=');
    if (key) {
      const name = decodeURIComponent(key);
      parsed.push({
        name,
        ...getParamValue(
          paramName2valueXName[name],
          decodeURIComponent(value || '')
        )
      });
    }
  });
  return parsed;
}


/**
 * The mapping of the general internal search parameter names to the real search
 * parameter names for the current model.
 *
 * @type {{
 * R4: { sourceCoding: string, sourceCode: string },
 * R5: { sourceCoding: string, sourceCode: string }
 * }}
 * TODO: Should this constant be moved to the model?
 */
const modelToTranslateSourceParamName = {
  r4: {
    sourceCodeableConcept: 'codeableConcept',
    sourceCoding: 'coding',
    sourceCode: 'code'
  },
  r5: {
    sourceCodeableConcept: 'sourceCodeableConcept',
    sourceCoding: 'sourceCoding',
    sourceCode: 'sourceCode'
  }
};


/**
 * The mapping of the search parameter names to the field names in
 * the Parameters FHIR resource (https://hl7.org/fhir/parameters.html).
 * See search parameters for the $expand operation here:
 *   https://hl7.org/fhir/valueset-operation-expand.html
 *   https://hl7.org/fhir/R4/valueset-operation-expand.html
 * Search parameters for the $lookup operation:
 *   https://hl7.org/fhir/codesystem-operation-lookup.html
 *   https://hl7.org/fhir/R4/codesystem-operation-lookup.html
 * Search parameters for the /ValueSet/$validate-code operation:
 *   https://hl7.org/fhir/valueset-operation-validate-code.html
 *   https://hl7.org/fhir/R4/valueset-operation-validate-code.html
 * Search parameters for the /CodeSystem/$validate-code operation:
 *   https://hl7.org/fhir/codesystem-operation-validate-code.html
 *   https://hl7.org/fhir/R4/codesystem-operation-validate-code.html
 * Search parameters for the /CodeSystem/$subsumes operation:
 *   https://hl7.org/fhir/codesystem-operation-subsumes.html
 *   https://hl7.org/fhir/R4/codesystem-operation-subsumes.html
 * Search parameters for the /CodeSystem/$translate operation:
 *   https://hl7.org/fhir/conceptmap-operation-translate.html
 *   https://hl7.org/fhir/R4/conceptmap-operation-translate.html
 * Search parameters for the /CodeSystem/$translate operation:
 *   https://hl7.org/fhir/conceptmap-operation-translate.html
 *   https://hl7.org/fhir/R4/conceptmap-operation-translate.html
 *
 * @type {Object}
 */
const paramName2valueXName = Object.entries({
  valueUri: ['url', 'context', 'system', 'sourceScope', 'source', 'targetScope',
    'target', 'targetSystem'],
  ValueSet: ['valueSet'],
  valueString: ['valueSetVersion', 'filter', 'designation', 'property',
    'version', 'systemVersion', 'display', 'conceptMapVersion'],
  valueCode: ['contextDirection', 'displayLanguage', 'code', 'codeA', 'codeB',
    'sourceCode', 'targetCode'],
  valueDateTime: ['date'],
  valueInteger: ['offset', 'count'],
  valueBoolean: ['includeDesignations', 'includeDefinition', 'activeOnly',
    'excludeNested', 'excludeNotForUI', 'excludePostCoordinated', 'abstract',
    'reverse'],
  valueCanonical: ['useSupplement', 'exclude-system', 'system-version',
    'check-system-version', 'force-system-version'],
  valueCoding: ['coding', 'codingA', 'codingB', 'sourceCoding', 'targetCoding'],
  valueCodeableConcept: ['codeableConcept', 'sourceCodeableConcept',
    'targetCodeableConcept'],
  CodeSystem: ['codeSystem'],
  ConceptMap: ['conceptMap']
}).reduce((acc, [key, value]) => {
  value.forEach(v => {
    acc[v] = key;
  });
  return acc;
}, {});


/**
 * Returns an object with the value[x] representing the parameter value for
 * the "Parameters" FHIR resource.
 *
 * @param {string} fieldName - The name of the value[x] field that determines
 *  the type of the value.
 * @param {string} value - a string value that may need to be converted to
 *  the appropriate data type before being placed in the value[x] field.
 * @returns {Object} - An object containing the value[x] field.
 * @throws {Error} - Throws an error if the value is not valid for the specified field name.
 */
function getParamValue(fieldName, value) {
  let paramValue = {};
  switch (fieldName) {
    case 'valueInteger': {
      let v;

      v = Number(value);
      if (Number.isInteger(v)) {
        paramValue[fieldName] = parseInt(value);
      } else {
        throw new Error(`The value for "${fieldName}" should be an integer.`);
      }
      break;
    }
    case 'valueBoolean':
      if (value === 'true') {
        paramValue[fieldName] = true;
      } else if (value === 'false') {
        paramValue[fieldName] = false;
      } else {
        throw new Error(`The value for "${fieldName}" should be a boolean.`);
      }
      break;
    case 'valueCoding':
    case 'valueCodeableConcept':
    case 'CodeSystem':
    case 'ValueSet':
      throw new Error(`The value for "${fieldName}" is not expected to be passed via a URL encoded string with parameters.`);
    default:
      paramValue[fieldName] = value;
  }
  return paramValue;
}


/**
 * Determines the type of a coded element from the provided collection.
 *
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {(ResourceNode|string)[]} codedColl - an array that should have
 *  one element, which is either a ResourceNode with a Coding,
 *  a CodeableConcept, or a code, or a string with a code.
 * @returns {Object} - An object with boolean properties indicating the type of
 *  the coded element:
 *  - `isCodeableConcept`: True if the element is a CodeableConcept.
 *  - `isCoding`: True if the element is a Coding.
 *  - `isCode`: True if the element is a Code or a string.
 */
function getCodedType(ctx, codedColl) {
  const codedTypeInfo = TypeInfo.fromValue(codedColl[0]);
  const isCodeableConcept =
    codedTypeInfo.is(TypeInfo.FhirCodeableConcept, ctx.model);
  const isCoding = !isCodeableConcept && codedTypeInfo.is(TypeInfo.FhirCoding, ctx.model);
  const isCode = !isCodeableConcept && !isCoding && (
    codedTypeInfo.is(TypeInfo.FhirCode, ctx.model) ||
    codedTypeInfo.is(TypeInfo.SystemString, ctx.model)
  );
  return {isCodeableConcept, isCoding, isCode};
}


/**
 * Transforms a response object into a ResourceNode if the response matches
 * the expected resource type.
 *
 * @param {Object} ctx - object describing the context of expression
 *  evaluation (see the "applyParsedPath" function).
 * @param {Promise<Object>|null} response - A promise resolving to the response
 *  object or null.
 * @param {string} resourceType - The expected FHIR resource type (e.g.,
 *  "ValueSet", "Parameters").
 * @returns {Promise<ResourceNode|null>|null} - A promise resolving to a ResourceNode
 *  if the resource type matches, or to null if an error occurs or the resource
 *  type does not match; or null if the given response object is falsy.
 */
function transformResponseToResource(ctx, response, resourceType) {
  return response?.then(obj => {
    if (obj?.resourceType === resourceType) {
      return ResourceNode.makeResNode(ctx, obj, null, null, null, null);
    }
    // Throw an error if the resource type does not match - will cause the catch
    // function to be called.
    throw new Error('Unexpected resourceType in response: ' + obj?.resourceType);
  }).catch(() => null) || null;
}


/**
 * Builds a preferred-server cache key. Exposed so that other modules (e.g. the
 * SDC supplements that implement weight()/ordinal()) can share the same
 * preferred terminology server logic via "fetchFromServers".
 * @type {function(string, (string|undefined|null)): (string|null)}
 */
Terminologies.preferredServerKey = preferredServerKey;


/**
 * Returns the first resource of a requested type from a FHIR search Bundle.
 * Exposed for internal consumers such as the SDC supplements; not part of the
 * public FHIRPath API.
 * @type {function(Object, string): (Object|undefined)}
 */
Terminologies.findBundleResource = findBundleResource;


/**
 * Clears the module-level cache of preferred terminology servers. Intended for
 * internal use only (e.g. test isolation); not part of the public API.
 */
Terminologies._clearPreferredServers = function () {
  preferredServerCache.clear();
};


/**
 * Returns the preferred server for the given cache key (marking it as
 * most-recently-used), or undefined. Intended for internal use only (e.g.
 * tests); not part of the public API.
 * @type {function(string): (string|undefined)}
 */
Terminologies._getPreferredServer = getPreferredServer;


/**
 * Records the preferred server for the given cache key. Intended for internal
 * use only (e.g. tests); not part of the public API.
 * @type {function(string, string): void}
 */
Terminologies._rememberPreferredServer = rememberPreferredServer;


/**
 * Returns the current number of entries in the preferred-server cache. Intended
 * for internal use only (e.g. tests); not part of the public API.
 * @return {number}
 */
Terminologies._preferredServerCacheSize = function () {
  return preferredServerCache.size;
};


/**
 * The maximum number of preferred-server entries retained before eviction.
 * Intended for internal use only (e.g. tests); not part of the public API.
 * @type {number}
 */
Terminologies._preferredServerCacheMaxSize = preferredServerCacheMaxSize;


module.exports = Terminologies;
