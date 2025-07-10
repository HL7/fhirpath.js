// Contains the additional FHIRPath functions.
// See https://hl7.org/fhir/fhirpath.html#functions for details.


const Terminologies = require('./terminologies');
const util = require("./utilities");
const {TypeInfo, ResourceNode} = require('./types');
const urlJoin = require('@loxjs/url-join');

let engine = {};


/**
 * Returns true if the code is a member of the given valueset.
 * @param {(string|Object)[]} coll - input collection with a single Coding,
 *  CodeableConcept, or code element.
 * @param {(ResourceNode|string)[]} valueSetColl - an array that should have one
 *  element, which is value set URL.
 * @return {Promise<boolean>|[]} - promise of a boolean value indicating that
 *  there is one element in the input collection whose code is a member of the
 *  specified value set.
 */
engine.memberOf = function (coll, valueSetColl ) {
  const ctx = this;

  util.checkAllowAsync(ctx, 'memberOf');
  // If the input is empty or has more than one value, the return value is empty
  if (coll.length === 1 && coll[0] != null && valueSetColl.length === 1 && valueSetColl[0] != null) {
    const typeInfo = TypeInfo.fromValue(valueSetColl[0]);
    // If the valueSet cannot be resolved as an uri to a value set,
    // the return value is empty.
    if(typeInfo.is(TypeInfo.FhirUri, ctx.model) || typeInfo.is(TypeInfo.SystemString)) {
      const terminologies = this.processedVars.terminologies;
      if (!terminologies) {
        throw new Error('Option "terminologyUrl" is not specified.');
      }
      return Terminologies.validateVS.call(this,
        [terminologies], valueSetColl, coll, ''
      )?.then(params => {
        return util.valData(params)?.parameter.find((p) => p.name === "result").valueBoolean;
      }, () => []);
    }
  }

  return [];
};


/**
 * Requests a FHIR resource by its canonical URL (see
 * https://hl7.org/fhir/references.html#canonical) from the FHIR server.
 * To request a resource by a canonical URL of the form "someUrl[|version]",
 * we need to make a request: "<resourceType>?url=<someUrl>[&version=version]"
 * In general, we don't know how to get the resource type from the canonical
 * URL. So we need the resource type.
 * Throws an error if the FHIR server URL is not specified in the context.
 *
 * @param {Object} ctx - The execution context containing processedVars and
 *  model information.
 * @param {string} refType - The FHIR resource type to query (e.g., 'ValueSet').
 * @param {string} url - The canonical URL of the resource to fetch.
 * @returns {Promise<Object|null>} A promise resolving to the resource object if found, or null.
 */
function requestResourceByCanonicalUrl(ctx, refType, url) {
  const fhirServerUrl = ctx.processedVars.fhirServerUrl;
  if (!fhirServerUrl) {
    throw new Error('Option "fhirServerUrl" is not specified.');
  }
  const match = /^(https?:\/\/[^|]*)(\|(.*))?/.exec(url);
  if (refType && match && ctx.model.resourcesWithUrlParam[refType]) {
    const params = {url: match[1]};
    if (match[3]) {
      params.version = match[3];
    }
    return  util.fetchWithCache(
      urlJoin(fhirServerUrl, refType) + '?' +
      new URLSearchParams(params).toString()
    ).then((bundle) => {
      // Assuming the bundle contains a single resource.
      return bundle.entry?.[0]?.resource ?? null;
    });
  }
  return Promise.resolve(null);
}

/**
 * Retrieves a contained resource from a FHIR resource by its ID.
 * @param {Object} resource - FHIR resource object that may contain contained
 *  resources.
 * @param {string} containedResId - The ID of the contained resource to retrieve.
 * @returns {Object|null} The contained resource if found, or null if not found.
 */
function getContainedResource(resource, containedResId) {
  return containedResId ?
    util.valData(resource)?.contained?.find((r) => r.id === containedResId) || null
    : null;
}


/**
 * A set of base FHIR resource types used to determine if a relative URL
 * should be resolved against the FHIR server URL.
 * @type {Object}
 */
const baseResourceTypes = {Resource: 1, DomainResource: 1};


/**
 * Requests a FHIR resource by its URL, which may be absolute or relative.
 * If the URL is absolute, it is fetched directly. If the fetch fails and
 * a refType is provided, attempts to resolve as a canonical URL. If the URL is
 * relative and starts with a resource type, it is resolved against the FHIR
 * server URL. Returns null if the resource cannot be resolved. If a fragment
 * is specified, it retrieves the contained resource by its ID.
 *
 * @param {Object} ctx - The execution context containing processedVars and
 *  model information.
 * @param {ResourceNode} node - the current resource node.
 * @param {string|null|undefined} refType - The FHIR resource type to query,
 *  undefined or null.
 * @param {string} url - The URL of the resource to fetch.
 * @param {boolean} isCanonical - Indicates if the URL is a canonical URL.
 * @returns {Promise<Object|null>} A promise resolving to the resource object
 *  if found, or null.
 */
function requestResourceByUrl(ctx, node, refType, url, isCanonical) {
  let promiseOfResource = null;
  let fragment = '';
  [url, fragment] = url.split('#');
  if (/^https?:\/\//.test(url)) {
    if (url.indexOf('|') !== -1 || isCanonical) {
      // If the reference is a canonical URL of specified type,
      // we can use this type to resolve it.
      if (refType) {
        promiseOfResource = requestResourceByCanonicalUrl(ctx, refType, url);
      }
    } else if (refType) {
      // If the reference is an absolute URL, we can use it directly.
      promiseOfResource = util.fetchWithCache(url).catch(
        // If the reference can be a canonical URL of specified type,
        // we can use this type to resolve it.
        () => requestResourceByCanonicalUrl(ctx, refType, url));
    } else {
      promiseOfResource = util.fetchWithCache(url);
    }
  } else {
    const match = /([A-Za-z]*)\//.exec(url);
    if (
      !isCanonical &&
      match &&
      ctx.model.type2Parent[match[1]] in baseResourceTypes
    ) {
      // If the reference is a relative URL that starts with a resource type,
      // we need to resolve it relative to the FHIR server URL.
      const fhirServerUrl = ctx.processedVars.fhirServerUrl;
      if (!fhirServerUrl) {
        throw new Error('Option "fhirServerUrl" is not specified.');
      }
      promiseOfResource = util.fetchWithCache(urlJoin(fhirServerUrl, url));
    } else if (!url && fragment && node instanceof ResourceNode) {
      promiseOfResource = Promise.resolve(node.getParentResource());
    }
  }

  if (promiseOfResource) {
    return promiseOfResource.then(res => {
      if (fragment) {
        // If a fragment is specified, we need to find the contained resource by its ID.
        res = getContainedResource(res, fragment);
      }
      return res;
    });
  }

  return Promise.resolve(null);
}


/**
 * Resolves a collection of FHIR references, canonicals, or URIs to their
 * corresponding resources.
 * For each item in the collection:
 * - If it is a Reference, resolves the referenced resource.
 * - If it is a Canonical, resolves the resource by canonical URL.
 * - If it is a URI or string, attempts to resolve as a resource URL.
 * Returns an array of ResourceNode objects for successfully resolved resources.
 *
 * @param {Array} coll - The collection of items to resolve.
 * @returns {Promise<Array>} A promise resolving to an array of ResourceNode
 *  objects.
 */
engine.resolveFn = function (coll) {
  const ctx = this;

  util.checkAllowAsync(ctx, 'resolve');

  return Promise.allSettled((coll || []).reduce((acc,item) => {
    let res;
    const typeInfo = TypeInfo.fromValue(item);

    if (typeInfo.is(TypeInfo.FhirReference, ctx.model)) {
      const v = util.valData(item);
      if (v?.reference) {
        // If the item is a Reference, use its reference property.
        res = requestResourceByUrl(ctx, item, typeInfo.refType?.length === 1 &&
          typeInfo.refType[0] || v.type, v.reference, false);
      }
    } else if(typeInfo.is(TypeInfo.FhirCanonical, ctx.model)) {
      res = requestResourceByUrl(ctx, item,typeInfo.refType?.length === 1 &&
        typeInfo.refType[0], util.valData(item), true);
    } else if(typeInfo.is(TypeInfo.FhirUri, ctx.model) ||
      typeInfo.is(TypeInfo.SystemString)) {
      res = requestResourceByUrl(ctx, item, null, util.valData(item), false);
    }

    acc.push(res);
    return acc;
  }, [])).then(result => {
    return result.reduce((acc, resItem) => {
      if (resItem.status === 'fulfilled' && resItem.value?.resourceType) {
        acc.push(ResourceNode.makeResNode(resItem.value, null, null, null,
          null, ctx.model));
      }
      return acc;
    }, []);
  });
};


module.exports = engine;
