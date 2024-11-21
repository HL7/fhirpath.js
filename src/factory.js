// This file contains a class that implements the Type Factory API.
// See https://hl7.org/fhir/fhirpath.html#factory for details.
const util = require("./utilities");
const { ResourceNode, TypeInfo, instantRE, timeRE, dateRE, dateTimeRE} = require("./types");

class Factory {
  // Same as fhirpath.invocationTable, but for %factory methods
  static invocationTable = {
    Extension: {fn: Factory.Extension, arity: {2: ['String', 'AnyAtRoot']}},
    Identifier: {
      fn: Factory.Identifier,
      arity: {
        1: ['String'],
        2: ['String', 'String'],
        3: ['String', 'String', 'String'],
        4: ['String', 'String', 'String', 'Any']
      }
    },
    HumanName: {
      fn: Factory.HumanName,
      arity: {
        1: ['String'],
        2: ['String', 'AnyAtRoot'],
        3: ['String', 'AnyAtRoot', 'String'],
        4: ['String', 'AnyAtRoot', 'String', 'String'],
        5: ['String', 'AnyAtRoot', 'String', 'String', 'String'],
        6: ['String', 'AnyAtRoot', 'String', 'String', 'String', 'String']
      },
    },
    ContactPoint: {
      fn: Factory.ContactPoint,
      arity: {
        1: ['String'],
        2: ['String', 'String'],
        3: ['String', 'String', 'String']
      },
    },
    Address: {
      fn: Factory.Address,
      arity: {
        1: ['AnyAtRoot'],
        2: ['AnyAtRoot', 'String'],
        3: ['AnyAtRoot', 'String', 'String'],
        4: ['AnyAtRoot', 'String', 'String', 'String'],
        5: ['AnyAtRoot', 'String', 'String', 'String', 'String'],
        6: ['AnyAtRoot', 'String', 'String', 'String', 'String', 'String'],
        7: ['AnyAtRoot', 'String', 'String', 'String', 'String', 'String', 'String']
      },
    },
    Quantity: {
      fn: Factory.Quantity,
      arity: {
        1: ['String'],
        2: ['String', 'String'],
        3: ['String', 'String', 'StringOrNumber'],
        4: ['String', 'String', 'StringOrNumber', 'String']
      }
    },
    Coding: {
      fn: Factory.Coding,
      arity: {
        1: ['String'],
        2: ['String', 'String'],
        3: ['String', 'String', 'String'],
        4: ['String', 'String', 'String', 'String']
      }
    },
    CodeableConcept: {
      fn: Factory.CodeableConcept,
      arity: {
        1: ['AnyAtRoot'],
        2: ['AnyAtRoot', 'String']
      }
    },
    create: {
      fn: Factory.create,
      arity: {
        1: ['TypeSpecifier']
      }
    },
    withExtension: {
      fn: Factory.withExtension,
      arity: {
        3: ['AnyAtRoot', 'String', 'AnyAtRoot']
      }
    },
    withProperty: {
      fn: Factory.withProperty,
      arity: {
        3: ['AnyAtRoot', 'String', 'AnyAtRoot']
      }
    }
  };

  // Create functions to create primitive types and add these functions to the
  // invocationTable.
  static {
    [
      {
        type: 'string',
        getValue: function (v) {
          if (typeof v  === 'string' && /^[\s\S]+$/.test(v)) {
            return String(v);
          }
          throw new Error(`"${v}" is not a string.` );
        }
      },
      {
        type: 'integer',
        getValue: (v) => {
          const n = Number(v);
          if (Number.isInteger(n)) {
            return n;
          }
          throw new Error(`"${v}" is not an integer.` );
        }
      },
      {
        type: 'unsignedInt',
        getValue: (v) => {
          const n = Number(v);
          if (Number.isInteger(n) && n >= 0) {
            return n;
          }
          throw new Error(`"${v}" is not an unsignedInt.` );
        }
      },
      {
        type: 'positiveInt',
        getValue: (v) => {
          const n = Number(v);
          if (Number.isInteger(n) && n > 0) {
            return n;
          }
          throw new Error(`"${v}" is not a positiveInt.` );
        }
      },
      {
        type: 'integer64',
        getValue: (v) => {
          const n = Number(v);
          if (Number.isInteger(n)) {
            return n;
          }
          throw new Error(`"${v}" is not an integer.` );
        }
      },
      {
        type: 'markdown',
        getValue(v) {
          if (typeof v  === 'string' && /^[\s\S]+$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a markdown.` );
        }
      },
      {
        type: 'url',
        getValue(v) {
          if (typeof v  === 'string' && /^\S*$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a url.` );
        }
      },
      {
        type: 'uri',
        getValue(v) {
          if (typeof v  === 'string' && /^\S*$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a uri.` );
        }
      },
      {
        type: 'instant',
        getValue(v) {
          if (typeof v  === 'string' && instantRE.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not an instant.` );
        }
      },
      {
        type: 'time',
        getValue(v) {
          if (typeof v  === 'string' && timeRE.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a time.` );
        }
      },
      {
        type: 'date',
        getValue(v) {
          if (typeof v  === 'string' && dateRE.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a date.` );
        }
      },
      {
        type: 'dateTime',
        getValue(v) {
          if (typeof v  === 'string' && dateTimeRE.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a dateTime.` );
        }
      },
      {
        type: 'base64Binary',
        getValue(v) {
          if (typeof v  === 'string' &&
            /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
              .test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a base64Binary.` );
        }
      },
      {
        type: 'decimal',
        getValue(v) {
          const n = Number(v);
          if (Number.isNaN(n)) {
            throw new Error(`"${v}" is not an decimal.` );
          }
          return n;
        }
      },
      {
        type: 'boolean',
        getValue(v) {
          if (v === true || v === 'true') {
            return true;
          } else if (v === false || v === 'false') {
            return false;
          } else {
            throw new Error(`"${v}" is not a boolean.` );
          }
        }
      },
      {
        type: 'code',
        getValue(v) {
          if (typeof v  === 'string' && /^\S+( \S+)*$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not a code.` );
        }
      },
      {
        type: 'id',
        getValue(v) {
          if (typeof v  === 'string' && /^[A-Za-z0-9\-.]{1,64}$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not an id.` );
        }
      },
      {
        type: 'oid',
        getValue(v) {
          if (typeof v  === 'string' && /^urn:oid:[0-2](\.(0|[1-9][0-9]*))+$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not an oid.` );
        }
      },
      {
        type: 'uuid',
        getValue(v) {
          if (typeof v  === 'string' && /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not an uuid.` );
        }
      },
      {
        type: 'canonical',
        getValue(v) {
          if (typeof v  === 'string' && /^\S*$/.test(v)) {
            return v;
          }
          throw new Error(`"${v}" is not an canonical.` );
        }
      }
    ].forEach(({type: primitiveType, getValue}) => {
      /**
       * Creates an instance of the type with the value and possibly one or more
       * extensions.
       * See primitive type descriptions here:
       * https://hl7.org/fhir/datatypes.html#primitive
       * @param {Factory[]} self - an array with one element, which is the
       *  Factory class.
       * @param {*} valueColl - a collection that should contain a single value
       *  of a primitive type.
       * @param {Extension[]} [extensions] - an optional array of Extensions.
       * @return {ResourceNode} - a new ResourceNode.
       */
      Factory[primitiveType] = function (self, valueColl, extensions) {
        let data;
        if (valueColl.length > 1) {
          throw new Error('Unexpected collection ' + JSON.stringify(valueColl) +
            ` as a value for %factory.${primitiveType}(value, extensions)`);
        } else if (valueColl.length === 0) {
          data = null;
        } else {
          const v = util.valData(valueColl[0]);
          if (v == null) {
            data = null;
          } if (typeof v !== 'object') {
            data = getValue(v);
          } else {
            throw new Error(`"${v}" is not a ${primitiveType}` );
          }
        }

        let _data = null;
        if (extensions?.length > 0) {
          _data = {
            extension: extensions.map(e => {
              const extensionDataType = TypeInfo.fromValue(e);
              if (TypeInfo.isType(extensionDataType.name, 'Extension')) {
                return util.valData(e);
              } else {
                throw new Error(`Expected "FHIR.Extension", got "${extensionDataType}"` );
              }
            })
          };
        }

        return ResourceNode.makeResNode(data, null, primitiveType, _data, primitiveType);
      };

      Factory.invocationTable[primitiveType] = {
        fn: Factory[primitiveType],
        arity: {1: ['AnyAtRoot'], 2: ['AnyAtRoot', 'Any']}
      };
    });
  }

  /**
   * Creates an extension with the given url and value
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} url - a string value that identifies the extension
   * @param {*} value - the value of the extension (any valid type for
   *  extension.value[x]).
   * @return {ResourceNode}
   */
  static Extension(self, url, value) {
    if (value.length !== 1) {
      if (value.length > 1) {
        throw new Error("Unexpected collection " + JSON.stringify(value) +
          " as a value for %factory.Extension(url, value)");
      }

      if (value.length === 0) {
        throw new Error("Unexpected empty collection " + JSON.stringify(value) +
          " as a value for %factory.Extension(url, value)");
      }
    } else {
      return ResourceNode.makeResNode(Factory.createExtensionObject(url, value[0]),
        null, 'Extension', null, 'Extension');
    }
  }

  /**
   * Creates an object to store the extension value.
   * @param {string} url - a string value that identifies the extension
   * @param {*} value - the value of the extension (any valid type for
   *  extension.value[x]).
   * @return {{[p: string]: *, url}}
   */
  static createExtensionObject(url, value) {
    const valuePropertyName = 'value' +
      TypeInfo.fromValue(value).name.replace(/^\w/, c => c.toUpperCase());
    return {
      url,
      [valuePropertyName]: util.valData(value)
    };
  }

  /**
   * Creates an identifier with the given properties.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} system - a string value that goes in Identifier.system.
   * @param {string} value - a string value that goes in Identifier.value.
   * @param {string} use - a string value that goes in Identifier.use.
   * @param {ResourceNode[]} typeColl - a CodeableConcept that goes in
   *  Identifier.type.
   * @return {ResourceNode}
   */
  static Identifier (self, system, value, use, typeColl) {
    if (typeColl?.length > 1) {
      throw new Error("Unexpected collection " + JSON.stringify(typeColl) +
        " as a type for %factory.Identifier{system, value, use, type)");
    }
    const data = {};
    if (util.isSome(system)) {
      data.system = system;
    }
    if (util.isSome(value)) {
      data.value = value;
    }
    if (util.isSome(use)) {
      data.use = use;
    }
    if (util.isSome(typeColl)) {
      const typeInfo = TypeInfo.fromValue(typeColl[0]);
      if (!TypeInfo.isType(typeInfo.name, 'CodeableConcept')) {
        throw new Error(`Expected "FHIR.CodeableConcept", got "${typeInfo}"` );
      }
      data.type = typeColl[0];
    }
    return ResourceNode.makeResNode(data, null, 'Identifier', null,
      'Identifier');
  }

  /**
   * Create a human name with the given properties.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} family - a string value that goes in HumanName.system.
   * @param {ResourceNode[]} givenColl - a collection of string values that goes
   *  in HumanName.given.
   * @param {string} prefix - a string value that goes in HumanName.prefix.
   * @param {string} suffix - a string value that goes in HumanName.suffix.
   * @param {string} text - a string value that goes in HumanName.text.
   * @param {string} use - a string value that goes in HumanName.use.
   * @return {ResourceNode}
   */
  static HumanName(self, family, givenColl, prefix, suffix, text, use) {
    const data = {};
    if (util.isSome(family)) {
      data.family = family;
    }
    if (util.isSome(givenColl)) {
      data.given = givenColl.map(given => {
        const v = util.valData(given);
        if (typeof v === "string") {
          return v;
        }
        throw new Error(`Expected string, but got: ${JSON.stringify(v)}`);
      });
    }
    if (util.isSome(prefix)) {
      data.prefix = prefix;
    }
    if (util.isSome(suffix)) {
      data.suffix = suffix;
    }
    if (util.isSome(text)) {
      data.text = text;
    }
    if (util.isSome(use)) {
      data.use = use;
    }
    return ResourceNode.makeResNode(data, null, 'HumanName', null,
      'HumanName');
  }

  /**
   * Creates a ContactPoint.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} system - a string value that goes in ContactPoint.system.
   * @param {string} value - a string value that goes in ContactPoint.value.
   * @param {string} use - a string value that goes in ContactPoint.use.
   * @return {ResourceNode}
   */
  static ContactPoint(self, system, value, use) {
    const data = {};
    if (util.isSome(system)) {
      data.system = system;
    }
    if (util.isSome(value)) {
      data.value = value;
    }
    if (util.isSome(use)) {
      data.use = use;
    }
    return ResourceNode.makeResNode(data, null, 'ContactPoint', null,
      'ContactPoint');
  }

  /**
   * Creates an Address
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {ResourceNode[]} lineColl - a collection of string values that goes
   *  in Address.line.
   * @param {string} city - a string value that goes in Address.city.
   * @param {string} state - a string value that goes in Address.state.
   * @param {string} postalCode - a string value that goes in Address.postalCode.
   * @param {string} country - a string value that goes in Address.country.
   * @param {string} use - a string value that goes in Address.use.
   * @param {string} type - a string value that goes in Address.type.
   * @return {ResourceNode}
   */
  static Address(self, lineColl, city, state, postalCode, country, use, type) {
    const data = {};
    if (util.isSome(lineColl)) {
      data.line = lineColl.map(line => {
        const v = util.valData(line);
        if (typeof v === "string") {
          return v;
        }
        throw new Error(`Expected string, but got: ${JSON.stringify(v)}`);
      });
    }
    if (util.isSome(city)) {
      data.city = city;
    }
    if (util.isSome(state)) {
      data.state = state;
    }
    if (util.isSome(postalCode)) {
      data.postalCode = postalCode;
    }
    if (util.isSome(country)) {
      data.country = country;
    }
    if (util.isSome(use)) {
      data.use = use;
    }
    if (util.isSome(type)) {
      data.type = type;
    }
    return ResourceNode.makeResNode(data, null, 'Address', null,
      'Address');
  }

  /**
   * Creates a Quantity.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} system - a string value that goes in Quantity.system.
   * @param {string} code - a string value that goes in Quantity.code.
   * @param {string} value - a string or decimal value that goes in
   *  Quantity.value.
   * @param {string} unit - a string value that goes in Quantity.unit.
   * @return {ResourceNode}
   */
  static Quantity(self, system, code, value, unit) {
    const data = {};
    if (util.isSome(system)) {
      data.system = system;
    }
    if (util.isSome(code)) {
      data.code = code;
    }
    if (util.isSome(value)) {
      data.value = Number(value);
    }
    if (util.isSome(unit)) {
      data.unit = unit;
    }
    return ResourceNode.makeResNode(data, null, 'Quantity', null,
      'Quantity');
  }

  /**
   * Creates a Coding.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {string} system - a string value that goes in Coding.system.
   * @param {string} code - a string value that goes in Coding.code.
   * @param {string} display - a string value that goes in Coding.display.
   * @param {string} version - a string value that goes in Coding.version.
   * @return {ResourceNode}
   */
  static Coding(self, system, code, display, version) {
    const data = {};
    if (util.isSome(system)) {
      data.system = system;
    }
    if (util.isSome(code)) {
      data.code = code;
    }
    if (util.isSome(display)) {
      data.display = display;
    }
    if (util.isSome(version)) {
      data.version = version;
    }
    return ResourceNode.makeResNode(data, null, 'Coding', null,
      'Coding');
  }

  /**
   * Creates a CodeableConcept.
   * @param {Factory[]} self - an array with one element, which is the Factory
   *  class.
   * @param {ResourceNode[]} valueColl - a collection of Coding that goes in
   *  CodeableConcept.coding.
   * @param {string} text - a string value that goes in CodeableConcept.text.
   * @return {ResourceNode}
   */
  static CodeableConcept(self, valueColl, text) {
    const data = valueColl?.length > 0 ?
      {
        coding: valueColl.map(coding => {
          if (coding instanceof ResourceNode &&
            coding.getTypeInfo().name === 'Coding') {
            return util.valData(coding);
          }
          throw new Error("Unexpected value " + JSON.stringify(coding) +
            "; expected value of type Coding");
        })
      }
      : {};

    if (util.isSome(text)) {
      data.text = text;
    }

    return ResourceNode.makeResNode(data, null, 'CodeableConcept', null,
      'CodeableConcept');
  }

  /**
   * Create an instance of the named type.
   * @param {Factory[]} self - an array with one element that refers to
   *  the current Factory instance.
   * @param {TypeInfo} typeInfo - a value that is the type to create.
   * @return {ResourceNode}
   */
  static create(self, typeInfo) {
    if (typeInfo.namespace === TypeInfo.System) {
      throw new Error('%factory.create(type) doesn\'t support system types.');
    }
    return ResourceNode.makeResNode(null, null, typeInfo.name, null,
      typeInfo.name);
  }

  /**
   * Add an extension, and return the new type.
   * @param {Factory[]} self - an array with one element that refers to
   *  the current Factory instance.
   * @param {ResourceNode[]} instanceColl - a collection that should contain the
   *  instance to which the extension is to be added.
   * @param {string} url - a string value that goes in Extension.url.
   *  specification this could also be an actual ValueSet, but I don't want to
   *  complicate this example.
   * @param {ResourceNode[]} value - the value of the extension.
   * @return {ResourceNode|[]}
   */
  static withExtension(self, instanceColl, url, value) {
    if (instanceColl.length > 1 ) {
      throw  new Error("Unexpected collection " + JSON.stringify(instanceColl) +
        " as an instance for %factory.withExtension(instance, url, value)");
    }

    if (value.length !== 1) {
      if (value.length > 1) {
        throw new Error("Unexpected collection " + JSON.stringify(value) +
          " as a value for %factory.withExtension(instance, url, value)");
      }

      if (value.length === 0) {
        throw new Error("Unexpected empty collection " + JSON.stringify(value) +
          " as a value for %factory.withExtension(instance, url, value)");
      }
    }

    if (instanceColl.length === 0) {
      return [];
    }

    const instance = instanceColl[0];

    if (instance instanceof ResourceNode) {
      let data = instance.data;
      let _data = instance._data;
      if (TypeInfo.isPrimitive(instance.getTypeInfo())) {
        _data = {
          ...(instance._data || {}),
          extension: [
            ...(instance._data?.extension || []),
            Factory.createExtensionObject(url, value[0])
          ]
        };
      } else {
        data = {
          ...(instance.data || {}),
          extension: [
            ...(instance.data?.extension || []),
            Factory.createExtensionObject(url, value[0])
          ]
        };
      }
      return  ResourceNode.makeResNode(data, null, instance.path, _data,
        instance.fhirNodeDataType);
    } else {
      throw new Error('Expected a ResourceNode.');
    }
  }

  /**
   * Set a property value, and return the new type.
   * @param {Factory[]} self - an array with one element that refers to
   *  the current Factory instance.
   * @param {ResourceNode[]} instanceColl - a collection that should contain the
   *  instance to set the property on.
   * @param {string} name - a string value that identifies the property to set.
   * @param {string} value - the value of the property
   * @return {ResourceNode|*[]}
   */
  static withProperty(self, instanceColl, name, value) {
    if (instanceColl.length > 1 ) {
      throw  new Error("Unexpected collection " + JSON.stringify(instanceColl) +
        " as an instance for %factory.withProperty(instance, name, value)");
    }

    if (value.length !== 1) {
      if (value.length > 1) {
        throw new Error("Unexpected collection " + JSON.stringify(value) +
          " as a value for %factory.withProperty(instance, name, value)");
      }

      if (value.length === 0) {
        throw new Error("Unexpected empty collection " + JSON.stringify(value) +
          " as a value for %factory.withProperty(instance, name, value)");
      }
    }

    if (instanceColl.length === 0) {
      return [];
    }

    const instance = instanceColl[0];

    if (instance instanceof ResourceNode) {
      let data = instance.data;
      let _data = instance._data;
      if (TypeInfo.isPrimitive(instance.getTypeInfo())) {
        _data = {
          ...(instance._data || {}),
          [name]: util.valData(value[0]),
          ...(value[0]?._data ? { ['_' + name]: value[0]._data } : {})
        };
      } else {
        data = {
          ...(instance.data || {}),
          [name]: util.valData(value[0]),
          ...(value[0]?._data ? { ['_' + name]: value[0]._data } : {})
        };
      }
      return  ResourceNode.makeResNode(data, null, instance.path, _data,
        instance.fhirNodeDataType);
    } else {
      throw new Error('Expected a ResourceNode.');
    }
  }

}

module.exports = Factory;
