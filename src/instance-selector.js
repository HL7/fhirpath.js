// Helpers for the FHIRPath Instance Selector / Object Creation syntax
// (e.g. `Patient { id: 'p1', name: { given: 'A' } }`). This module hosts the
// new functions introduced together with engine.InstanceSelector in
// src/fhirpath.js: model-driven element validation, choice-type resolution,
// BackboneElement normalization, FHIR JSON serialization of FHIRPath values,
// and the final ResourceNode result assembly. The engine entry points
// (engine.InstanceSelector / engine.InstanceSelectorTerm) remain in
// src/fhirpath.js; this module exports the helpers they depend on.


const util = require('./utilities');
const {
  FP_Date, FP_DateTime, FP_Instant, FP_Time, FP_Quantity,
  FP_Type, ResourceNode, TypeInfo, FP_Decimal
} = require('./types');
const makeResNode = ResourceNode.makeResNode;
const { hasOwnProperty } = util;
const ucumSystemUrl = 'http://unitsofmeasure.org';
const fhirIntegerMin = -2147483648n;
const fhirIntegerMax = 2147483647n;
const fhirInteger64Min = -9223372036854775808n;
const fhirInteger64Max = 9223372036854775807n;


/**
 * Throws when an instance selector element name can affect object prototypes or
 * attempts to assign FHIR primitive metadata directly.
 *
 * @param {string} elName - the element name to validate.
 * @param {Object} selector - the InstanceElementSelector AST node.
 * @throws {Error} if the element name is unsafe.
 */
function rejectUnsafeInstanceElementName(elName, selector) {
  if (
    elName === '__proto__' ||
    elName === 'constructor' ||
    elName === 'prototype'
  ) {
    throw new Error('Instance selector element "' + elName +
      '" is not allowed' + instanceElementLocation(selector));
  }
  if (elName.startsWith('_')) {
    throw new Error('Instance selector element "' + elName +
      '" is not allowed; use a FHIR primitive constructor for metadata' +
      instanceElementLocation(selector));
  }
}


/**
 * Validates that an instance selector element belongs to the target type.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {TypeInfo} typeInfo - the type being created.
 * @param {boolean} isPrimitive - true when the created type is primitive.
 * @param {string} elName - the element name to validate.
 * @param {Object} selector - the InstanceElementSelector AST node.
 * @returns {Object} normalized element metadata.
 * @throws {Error} if the element is not valid for the type.
 */
function getInstanceElementInfo(
  ctx, typeInfo, isPrimitive, elName, selector
) {
  rejectUnsafeInstanceElementName(elName, selector);
  const path = typeInfo.name + '.' + elName;
  const model = ctx.model;
  if (
    isPrimitive && elName === 'value'
  ) {
    return {
      elName,
      path,
      fhirNodeDataType: typeInfo.name,
      isRepeating: isRepeatingElementPath(model, path)
    };
  }
  const elementInfo = getModelElementInfo(model, typeInfo.name, elName);
  if (elementInfo) {
    return elementInfo;
  }
  if (typeInfo.name === 'BackboneElement') {
    return {
      elName,
      path,
      deferredBackboneElement: true
    };
  }

  let msg = '"' + elName + '" is not a valid element for type "' +
    typeInfo + '"';
  const location = selector.children[0].start;
  msg += ' (at ' + location.line + ':' + location.column + ')';
  throw new Error(msg);
}


/**
 * Builds the ResourceNode result for an instance selector after all element
 * selector expressions have been evaluated.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {TypeInfo} typeInfo - the type being created.
 * @param {string} name - the unqualified type name.
 * @param {boolean} isPrimitive - true when the created type is primitive.
 * @param {Array<Object>} entries - evaluated element selector data.
 * @returns {Array<ResourceNode|*>} the created instance collection.
 */
function buildInstanceSelectorResult(
  ctx, typeInfo, name, isPrimitive, entries
) {
  const state = {
    data: isPrimitive
      ? null
      : TypeInfo.isType(typeInfo.name, 'Resource', ctx.model)
        ? { resourceType: name }
        : {},
    _data: null
  };

  for (let i = 0; i < entries.length; i++) {
    addInstanceElement(ctx, typeInfo, isPrimitive, state, entries[i]);
  }

  rememberInstanceSelectorType(ctx, state.data, new TypeInfo({
    namespace: TypeInfo.FHIR,
    name
  }));
  return [makeResNode(ctx, state.data, null, name, state._data, name)];
}


/**
 * Resolves nested internal scalar values in an object created by the Instance
 * Selector / Object Creation syntax.
 *
 * @param {*} val - a value in the generated object.
 * @param {boolean} keepPreciseTypes - whether FP_Decimal and bigint values
 *  should be preserved instead of converted to JSON-safe values.
 * @returns {*} a prepared value.
 */
function prepareInstanceSelectorResultValue(val, keepPreciseTypes) {
  if (val instanceof ResourceNode) {
    return prepareInstanceSelectorResultValue(
      util.valData(val), keepPreciseTypes
    );
  }
  if (val instanceof FP_Decimal) {
    return keepPreciseTypes ? val : val.toJSON();
  }
  if (val instanceof FP_Type) {
    return val.toJSON();
  }
  if (typeof val === 'bigint') {
    return keepPreciseTypes ? val : val.toString();
  }
  if (Array.isArray(val)) {
    return val.map(item =>
      prepareInstanceSelectorResultValue(item, keepPreciseTypes)
    );
  }
  if (val && typeof val === 'object') {
    const prepared = {};
    for (const key of Object.keys(val)) {
      if (key === '__proto__') {
        continue;
      }
      prepared[key] = prepareInstanceSelectorResultValue(
        val[key], keepPreciseTypes
      );
    }
    return prepared;
  }
  return val;
}


/**
 * Looks up metadata for an element below a concrete FHIR model path.
 *
 * @param {Object} model - the active FHIR model.
 * @param {string} basePath - the parent element path.
 * @param {string} elName - the child element name.
 * @returns {Object|null} normalized element metadata, or null if unknown.
 */
function getModelElementInfo(model, basePath, elName) {
  const path = normalizeModelPath(model, basePath + '.' + elName);
  if (model?.choiceTypePaths?.[path]) {
    return {
      elName,
      path,
      choiceTypes: model.choiceTypePaths[path],
      isRepeating: isRepeatingElementPath(model, path)
    };
  }
  if (model?.path2Type?.[path]) {
    const choicePath = choiceBasePathForConcretePath(model, path);
    return {
      elName,
      path: choicePath || path,
      fhirNodeDataType: modelTypeName(model.path2Type[path]),
      isRepeating: isRepeatingElementPath(model, choicePath || path) ||
        isRepeatingElementPath(model, path)
    };
  }
  return null;
}


/**
 * Returns the logical choice path for a concrete FHIR JSON choice path.
 *
 * @param {Object} model - the active FHIR model.
 * @param {string} path - concrete model path, e.g. `Extension.valueString`.
 * @returns {string|null} logical choice path, e.g. `Extension.value`.
 */
function choiceBasePathForConcretePath(model, path) {
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) {
    return null;
  }

  const basePath = path.slice(0, dotIndex);
  const propName = path.slice(dotIndex + 1);
  for (let i = 1; i < propName.length; i++) {
    const ch = propName[i];
    if (ch < 'A' || ch > 'Z') {
      continue;
    }

    const choicePath = basePath + '.' + propName.slice(0, i);
    const suffix = propName.slice(i);
    if (model?.choiceTypePaths?.[choicePath]?.includes(suffix)) {
      return choicePath;
    }
  }

  return null;
}


/**
 * Returns the FHIR type name from model type metadata.
 *
 * @param {string|Object} modelType - model type metadata.
 * @returns {string|null} FHIR type name.
 */
function modelTypeName(modelType) {
  if (typeof modelType === 'string') {
    return modelType;
  }
  return modelType?.code || null;
}


/**
 * Normalizes a model path using pathsDefinedElsewhere.
 *
 * @param {Object} model - the active FHIR model.
 * @param {string} path - the model path to normalize.
 * @returns {string} normalized path.
 */
function normalizeModelPath(model, path) {
  return model?.pathsDefinedElsewhere?.[path] || path;
}


/**
 * Returns true when a model path is repeating.
 *
 * @param {Object} model - the active FHIR model.
 * @param {string} path - the normalized model path.
 * @returns {boolean} true when the path can repeat.
 */
function isRepeatingElementPath(model, path) {
  return !!model?.path2Repeating[path];
}


/**
 * Validates an evaluated element selector and adds its non-empty value to the
 * target instance.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {TypeInfo} typeInfo - the type being created.
 * @param {boolean} isPrimitive - true when the created type is primitive.
 * @param {Object} state - object construction state.
 * @param {Object} entry - evaluated element selector data.
 */
function addInstanceElement(ctx, typeInfo, isPrimitive, state, entry) {
  const valueColl = entry.valueColl;
  validateInstanceElementAssignment(entry, valueColl);

  if (valueColl.length === 0) {
    return;
  }

  // FHIR JSON scalar types may set their value using the special "value"
  // element. This includes xhtml for object construction, even though xhtml is
  // not a FHIR primitive by spec.
  if (isPrimitive && entry.elName === 'value') {
    validateFHIRInstanceElementValue(ctx, entry, valueColl, typeInfo.name);
    const primitiveValue = valueColl[0];
    state.data = instanceElementValue(ctx, primitiveValue);
    if (primitiveValue?._data) {
      state._data = {
        ...(state._data || {}),
        ...primitiveValue._data
      };
    }
    return;
  }

  // For primitives, non-value elements (e.g. extensions) live in the
  // sibling "_" object, mirroring FHIR JSON representation.
  const target = isPrimitive ? (state._data = state._data || {}) : state.data;
  const concreteInfo = concreteInstanceElementInfo(ctx, entry, valueColl);
  const elementValueColl =
    concreteInfo.fhirNodeDataType === 'BackboneElement'
      ? valueColl.map(value => normalizeBackboneElementValue(
        ctx, concreteInfo.path, value, entry.selector
      ))
      : valueColl;
  validateFHIRInstanceElementValue(
    ctx,
    entry,
    elementValueColl,
    concreteInfo.fhirNodeDataType
  );
  if (
    elementValueColl.length > 1 ||
    isRepeatingInstanceElement(concreteInfo)
  ) {
    const valueFn = entry.elementInfo.deferredBackboneElement
      ? value => deferredBackboneElementValue(value)
      : value => instanceElementValue(
        ctx, value, concreteInfo.fhirNodeDataType
      );
    const elementValues = elementValueColl.map(valueFn);
    if (elementValues.some(value => value != null)) {
      target[concreteInfo.elName] = elementValues;
    }
    const childData = instanceElementDataArray(valueColl);
    if (childData) {
      target['_' + concreteInfo.elName] = childData;
    }
  } else {
    const value = entry.elementInfo.deferredBackboneElement
      ? deferredBackboneElementValue(elementValueColl[0])
      : instanceElementValue(
        ctx,
        elementValueColl[0],
        concreteInfo.fhirNodeDataType
      );
    if (value != null) {
      target[concreteInfo.elName] = value;
    }
    if (valueColl[0]?._data) {
      target['_' + concreteInfo.elName] = valueColl[0]._data;
    }
  }
}


/**
 * Remembers the FHIRPath type of an object produced by an instance selector.
 * This preserves type information for deferred BackboneElement validation
 * without adding enumerable metadata to the generated FHIR JSON object.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} data - generated object data.
 * @param {TypeInfo} typeInfo - the generated object's type.
 * @returns {*} the original data.
 */
function rememberInstanceSelectorType(ctx, data, typeInfo) {
  if (data && typeof data === 'object') {
    // Allocate the WeakMap on first use so evaluations that never construct
    // objects do not pay for it (see the ctx setup in applyParsedPath).
    const typeByData = ctx.instanceSelectorTypeByData ||
      (ctx.instanceSelectorTypeByData = new WeakMap());
    typeByData.set(data, typeInfo);
  }
  return data;
}


/**
 * Ensures an evaluated selector can be assigned to the target instance without
 * violating repeatability constraints. Duplicate-element detection is handled
 * earlier, before element values are evaluated (see engine.InstanceSelector in
 * src/fhirpath.js).
 *
 * @param {Object} entry - evaluated element selector data.
 * @param {Array} valueColl - evaluated element value collection.
 * @throws {Error} if a non-repeating element receives too many values.
 */
function validateInstanceElementAssignment(entry, valueColl) {
  if (
    valueColl.length > 1 &&
    !isRepeatingInstanceElement(entry.elementInfo) &&
    !entry.elementInfo.deferredBackboneElement
  ) {
    throw new Error('Instance selector element "' + entry.elName +
      '" is not repeating, but its expression returned ' +
      valueColl.length + ' items' + instanceElementLocation(entry.selector));
  }
}


/**
 * Returns a source location suffix for an instance element selector.
 *
 * @param {Object} selector - the InstanceElementSelector AST node.
 * @returns {string} formatted location suffix.
 */
function instanceElementLocation(selector) {
  const location = selector.children[0].start;
  return ' (at ' + location.line + ':' + location.column + ')';
}


/**
 * Validates that values are assignable to a concrete FHIR element type.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {Object} entry - evaluated element selector data.
 * @param {Array} valueColl - evaluated element value collection.
 * @param {string|null} fhirNodeDataType - the expected FHIR node data type.
 * @throws {Error} when the value cannot be assigned to the element type.
 */
function validateFHIRInstanceElementValue(
  ctx, entry, valueColl, fhirNodeDataType
) {
  const primitiveType = fhirPrimitiveScalarType(fhirNodeDataType);

  for (let i = 0; i < valueColl.length; i++) {
    const isValidValue = primitiveType
      ? isFHIRPrimitiveScalarValue(ctx, valueColl[i], primitiveType)
      : isFHIRComplexElementValue(ctx, valueColl[i], fhirNodeDataType);
    if (!isValidValue) {
      throw new Error('Instance selector element "' + entry.elName +
        '" expects type "' + fhirNodeDataType + '"' +
        instanceElementLocation(entry.selector));
    }
  }
}


/**
 * Returns true when a value can be assigned to a complex FHIR element.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @param {string|null} fhirTypeName - the expected FHIR node data type.
 * @returns {boolean} true when the value is compatible.
 */
function isFHIRComplexElementValue(ctx, value, fhirTypeName) {
  if (!fhirTypeName) {
    return true;
  }

  const data = util.valData(value);
  if (data instanceof FP_Quantity && fhirTypeName === 'Quantity') {
    return true;
  }

  const valueTypeInfo = typeInfoFromInstanceValue(ctx, value);
  if (valueTypeInfo.namespace === TypeInfo.FHIR) {
    return valueTypeInfo.is(new TypeInfo({
      namespace: TypeInfo.FHIR,
      name: fhirTypeName
    }), ctx.model);
  }

  return false;
}


/**
 * Converts an evaluated element value into a representation suitable for
 * storing inside the data object of a newly created instance. FP_Decimal values
 * are preserved so prepareEvalResult can decide whether to keep precision or
 * produce JSON-safe output. Other FP_Type values (Date, DateTime, Time, ...)
 * are converted via toJSON(); ResourceNode values are unwrapped to their plain
 * data.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated element value collection.
 * @param {string} [fhirNodeDataType] - the expected FHIR node data type.
 * @returns {*} the storable value.
 */
function instanceElementValue(ctx, value, fhirNodeDataType) {
  let data = util.valData(value);
  if (data instanceof FP_Quantity && fhirNodeDataType === 'Quantity') {
    return fhirQuantityDataFromFPQuantity(ctx, data);
  }
  if (data instanceof FP_Type && !(data instanceof FP_Decimal)) {
    data = data.toJSON();
  }
  if (value instanceof ResourceNode && data && typeof data === 'object') {
    rememberInstanceSelectorType(ctx, data, typeInfoFromInstanceValue(ctx, value));
  }
  return data;
}


/**
 * Returns the concrete FHIR JSON element metadata for an evaluated selector.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {Object} entry - evaluated element selector data.
 * @param {Array} valueColl - evaluated element value collection.
 * @returns {Object} concrete element metadata.
 * @throws {Error} if a choice element has mixed or unsupported value types.
 */
function concreteInstanceElementInfo(ctx, entry, valueColl) {
  const elementInfo = entry.elementInfo;
  if (!elementInfo.choiceTypes) {
    return {
      ...elementInfo,
      elName: entry.elName
    };
  }

  let suffix = null;
  for (let i = 0; i < valueColl.length; i++) {
    const currentSuffix = choiceSuffixForValue(
      ctx, elementInfo, valueColl[i], entry.selector
    );
    if (!suffix) {
      suffix = currentSuffix;
    } else if (suffix !== currentSuffix) {
      throw new Error('"' + entry.elName +
        '" cannot contain multiple concrete choice types' +
        instanceElementLocation(entry.selector));
    }
  }
  const path = elementInfo.path + suffix;
  return {
    ...elementInfo,
    elName: entry.elName + suffix,
    path,
    fhirNodeDataType: modelTypeName(ctx.model.path2Type[path]),
    isRepeating: isRepeatingElementPath(ctx.model, path)
  };
}


/**
 * Normalizes and validates a value assigned to a concrete BackboneElement path.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {string} basePath - the concrete BackboneElement path.
 * @param {ResourceNode} value - the typed BackboneElement value being assigned.
 * @param {Object} selector - the selector node used for error locations.
 * @returns {*} normalized BackboneElement data.
 * @throws {Error} if the value is untyped or if a child is invalid for the
 *  concrete path.
 */
function normalizeBackboneElementValue(ctx, basePath, value, selector) {
  assertTypedBackboneElementValue(value, selector);
  const data = instanceElementValue(ctx, value, 'BackboneElement');
  if (data == null || typeof data !== 'object') {
    return data;
  }

  const result = {};
  const metadata = [];
  const assignedChildPaths = new Set();
  Object.keys(data).forEach(prop => {
    if (prop.startsWith('_')) {
      metadata.push(prop);
      return;
    }

    const childInfo = getModelElementInfo(ctx.model, basePath, prop);
    if (!childInfo) {
      throwInvalidBackboneElement(prop, basePath, selector);
    }
    if (assignedChildPaths.has(childInfo.path)) {
      throw new Error('Instance selector element "' + prop +
        '" is already assigned' + instanceElementLocation(selector));
    }
    assignedChildPaths.add(childInfo.path);

    const rawValue = data[prop];
    const rawColl = backboneChildValueCollection(ctx, value, prop, rawValue);
    const normalizedColl = rawColl.map(item =>
      normalizeBackboneChildValue(ctx, childInfo, item, selector)
    );
    const childEntry = {
      elName: prop,
      elementInfo: childInfo,
      selector
    };
    const concreteInfo = concreteInstanceElementInfo(
      ctx, childEntry, normalizedColl
    );
    validateFHIRInstanceElementValue(
      ctx, childEntry, normalizedColl, concreteInfo.fhirNodeDataType
    );
    const serializedColl = normalizedColl.map(item =>
      instanceElementValue(ctx, item, concreteInfo.fhirNodeDataType)
    );
    const shouldUseArray = isRepeatingInstanceElement(concreteInfo);
    if (normalizedColl.length > 1 &&
      !isRepeatingInstanceElement(concreteInfo)) {
      throw new Error('Instance selector element "' + prop +
        '" is not repeating, but its expression returned ' +
        normalizedColl.length + ' items' + instanceElementLocation(selector));
    }

    if (shouldUseArray) {
      if (serializedColl.some(item => item != null)) {
        result[concreteInfo.elName] = serializedColl;
      }
    } else if (serializedColl[0] != null) {
      result[concreteInfo.elName] = serializedColl[0];
    }

    const metadataValue = data['_' + prop];
    if (metadataValue !== undefined) {
      result['_' + concreteInfo.elName] = metadataValue;
    }
  });

  metadata.forEach(prop => {
    const baseProp = prop.slice(1);
    if (!hasOwnProperty(data, baseProp)) {
      const childInfo = getModelElementInfo(ctx.model, basePath, baseProp);
      if (!childInfo) {
        throwInvalidBackboneElement(baseProp, basePath, selector);
      }
      if (childInfo.choiceTypes) {
        throw new Error('Instance selector metadata element "' + prop +
          '" must use a concrete choice name' +
          instanceElementLocation(selector));
      }
      if (assignedChildPaths.has(childInfo.path)) {
        throw new Error('Instance selector element "' + prop +
          '" is already assigned' + instanceElementLocation(selector));
      }
      assignedChildPaths.add(childInfo.path);
      validateBackboneMetadataShape(data[prop], childInfo, prop, selector);
      result[prop] = data[prop];
    }
  });

  return rememberInstanceSelectorType(ctx, result, new TypeInfo({
    namespace: TypeInfo.FHIR,
    name: 'BackboneElement'
  }));
}


/**
 * Returns a BackboneElement child value collection, preserving model/path
 * metadata from typed source ResourceNodes when it is available.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {ResourceNode} sourceNode - the typed BackboneElement source node.
 * @param {string} prop - the child property name.
 * @param {*} rawValue - the raw child value from the source data object.
 * @returns {Array} child values to normalize.
 */
function backboneChildValueCollection(ctx, sourceNode, prop, rawValue) {
  const childNodes = util.makeChildResNodes(ctx, sourceNode, prop, ctx.model);
  if (
    childNodes.length > 0 &&
    childNodes.every(child => child.fhirNodeDataType)
  ) {
    return childNodes;
  }
  return Array.isArray(rawValue) ? rawValue : [rawValue];
}


/**
 * Ensures a concrete BackboneElement assignment came from a typed FHIRPath
 * value before any child fields or metadata are inspected.
 *
 * @param {*} value - the assigned BackboneElement value.
 * @param {Object} selector - the selector node used for error locations.
 * @throws {Error} if the value is not a ResourceNode.
 */
function assertTypedBackboneElementValue(value, selector) {
  if (!(value instanceof ResourceNode)) {
    throw new Error(
      'Instance selector BackboneElement values must come from a typed ' +
      'FHIRPath result' + instanceElementLocation(selector)
    );
  }
}


/**
 * Validates FHIR JSON primitive metadata copied from a deferred
 * BackboneElement. Scalar metadata must be an object, while repeating metadata
 * must be an array whose entries are null or objects.
 *
 * @param {*} metadataValue - the metadata value to validate.
 * @param {Object} childInfo - concrete child element metadata.
 * @param {string} prop - metadata property name.
 * @param {Object} selector - the selector node used for error locations.
 * @throws {Error} if the metadata value shape is invalid.
 */
function validateBackboneMetadataShape(
  metadataValue, childInfo, prop, selector
) {
  if (isRepeatingInstanceElement(childInfo)) {
    if (
      !Array.isArray(metadataValue) ||
      metadataValue.some(item =>
        item != null && (typeof item !== 'object' || Array.isArray(item))
      )
    ) {
      throwInvalidBackboneMetadataShape(prop, selector);
    }
    return;
  }

  if (
    metadataValue == null ||
    typeof metadataValue !== 'object' ||
    Array.isArray(metadataValue)
  ) {
    throwInvalidBackboneMetadataShape(prop, selector);
  }
}


/**
 * Throws a validation error for invalid FHIR JSON primitive metadata.
 *
 * @param {string} prop - metadata property name.
 * @param {Object} selector - the selector node used for error locations.
 * @throws {Error} always.
 */
function throwInvalidBackboneMetadataShape(prop, selector) {
  throw new Error('Instance selector metadata element "' + prop +
    '" has invalid metadata shape' + instanceElementLocation(selector));
}


/**
 * Returns true when the instance element should be serialized as an array.
 *
 * @param {Object} elementInfo - instance element metadata.
 * @returns {boolean} true when the element is repeating.
 */
function isRepeatingInstanceElement(elementInfo) {
  return !!elementInfo.isRepeating;
}


/**
 * Converts a deferred BackboneElement value without serializing FP_Type values.
 * The concrete assignment path later determines whether values such as
 * System.Date or System.Quantity belong to a choice element.
 *
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {*} the deferred BackboneElement value.
 */
function deferredBackboneElementValue(value) {
  if (value instanceof ResourceNode) {
    return value;
  }
  return util.valDataConverted(value);
}


/**
 * Builds a FHIR JSON primitive sibling metadata array for a multi-valued
 * primitive element, preserving index alignment with the value array.
 *
 * @param {Array} valueColl - evaluated element value collection.
 * @returns {Array|null} the `_element` array, or null if there is no metadata.
 */
function instanceElementDataArray(valueColl) {
  let hasData = false;
  const result = valueColl.map(value => {
    if (value?._data) {
      hasData = true;
      return value._data;
    }
    return null;
  });
  return hasData ? result : null;
}


/**
 * Returns the scalar type used to validate FHIR JSON assignments.
 *
 * @param {string|null} fhirNodeDataType - the expected FHIR node data type.
 * @returns {string|null} the normalized primitive type, or null for complex
 *   elements.
 */
function fhirPrimitiveScalarType(fhirNodeDataType) {
  if (typeof fhirNodeDataType !== 'string') {
    return null;
  }
  switch (fhirNodeDataType) {
    case 'System.Boolean':
      return 'boolean';
    case 'System.Integer':
      return 'integer';
    case 'System.Long':
      return 'integer64';
    case 'System.Decimal':
      return 'decimal';
    case 'System.String':
      return 'string';
    case 'System.Date':
      return 'date';
    case 'System.DateTime':
      return 'dateTime';
    case 'System.Time':
      return 'time';
    case 'xhtml':
      return 'xhtml';
    default:
      return TypeInfo.isPrimitive(new TypeInfo({
        namespace: TypeInfo.FHIR,
        name: fhirNodeDataType
      })) ? fhirNodeDataType : null;
  }
}


/**
 * Returns true when a value can be assigned to a FHIR JSON scalar.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @param {string} primitiveType - the normalized FHIR primitive type.
 * @returns {boolean} true when the value is compatible.
 */
function isFHIRPrimitiveScalarValue(ctx, value, primitiveType) {
  const data = util.valData(value);
  if (isMetadataOnlyFHIRPrimitiveValue(ctx, value, primitiveType)) {
    return true;
  }
  switch (primitiveType) {
    case 'boolean':
      return typeof data === 'boolean';
    case 'integer':
      return isFHIRIntegerInRange(value, fhirIntegerMin, fhirIntegerMax);
    case 'unsignedInt':
      return isFHIRIntegerInRange(value, 0n, fhirIntegerMax);
    case 'positiveInt':
      return isFHIRIntegerInRange(value, 1n, fhirIntegerMax);
    case 'integer64':
      return isFHIRInteger64Value(value);
    case 'decimal':
      return isFHIRDecimalValue(value);
    case 'date':
      return isFHIRDateValue(ctx, value);
    case 'dateTime':
      return isFHIRDateTimeValue(ctx, value);
    case 'instant':
      return isFHIRInstantValue(ctx, value);
    case 'time':
      return isFHIRTimeValue(ctx, value);
    case 'base64Binary':
    case 'canonical':
    case 'code':
    case 'id':
    case 'markdown':
    case 'oid':
    case 'string':
    case 'uri':
    case 'url':
    case 'uuid':
    case 'xhtml':
      return typeof data === 'string';
    default:
      return true;
  }
}


/**
 * Converts an FP_Quantity to FHIR Quantity JSON.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {FP_Quantity} quantity - the FHIRPath System.Quantity value.
 * @returns {Object} FHIR Quantity data.
 */
function fhirQuantityDataFromFPQuantity(ctx, quantity) {
  const unit = FP_Quantity.getEquivalentUcumUnitCode(quantity.unit);
  const data = {
    value: quantity.value
  };
  if (unit) {
    data.unit = unit;
    data.system = ucumSystemUrl;
    data.code = unit;
  }
  return rememberInstanceSelectorType(ctx, data, new TypeInfo({
    namespace: TypeInfo.FHIR,
    name: 'Quantity'
  }));
}


/**
 * Resolves the concrete `[x]` suffix for a choice element value.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {Object} elementInfo - instance element metadata.
 * @param {*} value - one evaluated value.
 * @param {Object} selector - the selector node used for error locations.
 * @returns {string} the matching choice suffix.
 * @throws {Error} if no concrete choice type can be inferred.
 */
function choiceSuffixForValue(ctx, elementInfo, value, selector) {
  const valueTypeInfo = typeInfoFromInstanceValue(ctx, value);
  const model = ctx.model;
  const exactSystemSuffix =
    valueTypeInfo.namespace === TypeInfo.System
      ? preferredChoiceSuffixForSystemType(valueTypeInfo.name)
      : null;

  let fallback = null;
  for (const suffix of elementInfo.choiceTypes) {
    const fhirTypeName = modelTypeName(model.path2Type[
      elementInfo.path + suffix
    ]);
    const choiceTypeInfo = new TypeInfo({
      namespace: TypeInfo.FHIR,
      name: fhirTypeName
    });

    if (
      valueTypeInfo.namespace === TypeInfo.FHIR &&
      valueTypeInfo.name === fhirTypeName
    ) {
      return suffix;
    }
    if (suffix === exactSystemSuffix) {
      return suffix;
    }
    if (
      !fallback &&
      (valueTypeInfo.is(choiceTypeInfo, model) ||
        choiceTypeInfo.isConvertibleTo(valueTypeInfo, model))
    ) {
      fallback = suffix;
    }
  }

  if (fallback) {
    return fallback;
  }

  throw new Error('"' + elementInfo.elName +
    '" cannot be resolved to a concrete choice type for value type "' +
    valueTypeInfo + '"' + instanceElementLocation(selector));
}


/**
 * Throws a validation error for an invalid element below a concrete path.
 *
 * @param {string} elName - the invalid element name.
 * @param {string} basePath - the concrete parent path.
 * @param {Object} selector - the original selector node.
 * @throws {Error} always.
 */
function throwInvalidBackboneElement(elName, basePath, selector) {
  throw new Error('"' + elName + '" is not a valid element for "' +
    basePath + '"' + instanceElementLocation(selector));
}


/**
 * Normalizes a child value while validating a concrete BackboneElement path.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {Object} childInfo - concrete child element metadata.
 * @param {*} value - the child value.
 * @param {Object} selector - the selector node used for error locations.
 * @returns {*} normalized child data.
 */
function normalizeBackboneChildValue(ctx, childInfo, value, selector) {
  if (childInfo.fhirNodeDataType === 'BackboneElement') {
    return normalizeBackboneElementValue(ctx, childInfo.path, value, selector);
  }
  if (childInfo.choiceTypes) {
    return value;
  }
  return instanceElementValue(ctx, value, childInfo.fhirNodeDataType);
}


/**
 * Returns true when a value is an integer inside the specified BigInt range.
 *
 * @param {*} value - a single item from an evaluated value collection.
 * @param {bigint} min - inclusive minimum.
 * @param {bigint} max - inclusive maximum.
 * @returns {boolean} true when the value is an in-range integer.
 */
function isFHIRIntegerInRange(value, min, max) {
  const intValue = fhirIntegerBigIntValue(value, false);
  return intValue !== null && intValue >= min && intValue <= max;
}


/**
 * Returns the BigInt value for an integer-compatible FHIRPath scalar.
 * JavaScript number values must be safe integers because unsafe numbers may
 * already be rounded before reaching this function.
 *
 * @param {*} value - a single item from an evaluated value collection.
 * @param {boolean} allowString - whether integer strings are accepted.
 * @returns {bigint|null} the integer value, or null when incompatible.
 */
function fhirIntegerBigIntValue(value, allowString) {
  const data = util.valData(value);
  if (typeof data === 'bigint') {
    return data;
  }
  if (
    allowString &&
    typeof data === 'string' &&
    /^-?(0|[1-9][0-9]*)$/.test(data)
  ) {
    return BigInt(data);
  }
  if (typeof data === 'number' && Number.isSafeInteger(data)) {
    return BigInt(data);
  }
  if (data instanceof FP_Decimal && data.isInteger()) {
    return BigInt(data.toString());
  }
  return null;
}


/**
 * Returns true when a value can be represented as a FHIR JSON integer64.
 *
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is integer64-compatible.
 */
function isFHIRInteger64Value(value) {
  const intValue = fhirIntegerBigIntValue(value, true);
  return intValue !== null &&
    intValue >= fhirInteger64Min &&
    intValue <= fhirInteger64Max;
}


/**
 * Returns true when a value can be assigned to a FHIR decimal element.
 *
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is a decimal-compatible scalar.
 */
function isFHIRDecimalValue(value) {
  const data = util.valData(value);
  return typeof data === 'number'
    ? Number.isFinite(data)
    : data instanceof FP_Decimal;
}


/**
 * Returns true when a ResourceNode represents a FHIR primitive with only
 * metadata (`_data`) and no scalar value, and that primitive can be assigned to
 * the expected primitive type.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @param {string} primitiveType - the normalized FHIR primitive type.
 * @returns {boolean} true when the metadata-only primitive is compatible.
 */
function isMetadataOnlyFHIRPrimitiveValue(ctx, value, primitiveType) {
  if (
    !(value instanceof ResourceNode) ||
    value.data != null ||
    !value._data
  ) {
    return false;
  }

  const valueTypeInfo = value.getTypeInfo();
  return valueTypeInfo.namespace === TypeInfo.FHIR &&
    valueTypeInfo.is(new TypeInfo({
      namespace: TypeInfo.FHIR,
      name: primitiveType
    }), ctx.model);
}


/**
 * Returns true when a value is a valid FHIR date scalar.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is date-compatible.
 */
function isFHIRDateValue(ctx, value) {
  const data = util.valData(value);
  return data instanceof FP_Date ||
    typeof data === 'string' && !!FP_Date.checkString(ctx, data);
}


/**
 * Returns true when a value is a valid FHIR dateTime scalar.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is dateTime-compatible.
 */
function isFHIRDateTimeValue(ctx, value) {
  const data = util.valData(value);
  return data instanceof FP_DateTime ||
    typeof data === 'string' && !!FP_DateTime.checkString(ctx, data);
}


/**
 * Returns true when a value is a valid FHIR instant scalar.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is instant-compatible.
 */
function isFHIRInstantValue(ctx, value) {
  const data = util.valData(value);
  return data instanceof FP_Instant ||
    data instanceof FP_DateTime &&
      !!FP_Instant.checkString(ctx, data.toJSON()) ||
    typeof data === 'string' && !!FP_Instant.checkString(ctx, data);
}


/**
 * Returns true when a value is a valid FHIR time scalar.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - a single item from an evaluated value collection.
 * @returns {boolean} true when the value is time-compatible.
 */
function isFHIRTimeValue(ctx, value) {
  const data = util.valData(value);
  return data instanceof FP_Time ||
    typeof data === 'string' && !!FP_Time.checkString(ctx, data);
}


/**
 * Returns the FHIRPath type of a value, including remembered instance selector
 * types for plain objects that were unwrapped from ResourceNode values.
 *
 * @param {Object} ctx - the evaluation context.
 * @param {*} value - the value whose type should be resolved.
 * @returns {TypeInfo} the resolved type information.
 */
function typeInfoFromInstanceValue(ctx, value) {
  if (value && typeof value === 'object' &&
    ctx.instanceSelectorTypeByData?.has(value)) {
    return ctx.instanceSelectorTypeByData.get(value);
  }
  return TypeInfo.fromValue(value);
}


/**
 * Returns the preferred choice-type suffix for a System type.
 *
 * @param {string} systemTypeName - System type name.
 * @returns {string|null} the preferred FHIR choice suffix.
 */
function preferredChoiceSuffixForSystemType(systemTypeName) {
  switch (systemTypeName) {
    case 'Boolean':
    case 'Date':
    case 'DateTime':
    case 'Decimal':
    case 'Integer':
    case 'Quantity':
    case 'String':
    case 'Time':
      return systemTypeName;
    case 'Long':
      return 'Integer64';
    default:
      return null;
  }
}


module.exports = {
  getInstanceElementInfo,
  buildInstanceSelectorResult,
  prepareInstanceSelectorResultValue
};
