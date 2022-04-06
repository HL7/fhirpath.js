const ucumUtils = require('@lhncbc/ucum-lhc').UcumLhcUtils.getInstance();
const {roundToMaxPrecision} = require('./numbers');
const {valData} = require('./utilities');
const {FP_Type, FP_Quantity} = require('./types');

/**
 *  Returns a JSON version of the given object, but with the object's keys
 *  in sorted order (or at least stable order,
 *  see https://stackoverflow.com/a/35810961/360782) and the values in
 *  unified forms, e.g. "1 year" is converted to "12 months", "3 'min'"
 *  is converted to "120 'sec'".
 */
function hashObject(obj) {
  return JSON.stringify(prepareObject(obj));
}

/**
 * Brings an object to the unified form so that it can be serialized to JSON to
 * compare with other objects according to https://hl7.org/fhirpath/#equals
 */
function prepareObject(value) {
  value = valData(value);

  if (typeof value === 'number') {
    return roundToMaxPrecision(value);
  } else if (value instanceof Date) {
    return value.toISOString();
  } if (value instanceof FP_Quantity) {
    const magnitude = FP_Quantity._yearMonthConversionFactor[value.unit];
    if (magnitude) {
      return '_!yearMonth!_:' + magnitude * value.value;
    } else {
      const ucumQuantity = FP_Quantity.toUcumQuantity(value.value, value.unit);
      const unit = ucumUtils.getSpecifiedUnit(ucumQuantity.unit).unit;
      return '_!' + unit.property_ + '!_:' + unit.magnitude_ * ucumQuantity.value;
    }
  } else if (value instanceof FP_Type) {
    return value.toString();
  } else if (typeof value === 'object') {
    return Array.isArray(value) ?
      value.map(prepareObject) :
      Object.keys(value).sort().reduce(
        (o, key) => {
          const v = value[key];
          o[key] = prepareObject(v);
          return o;
        }, {});
  }

  return  value;
}

module.exports = hashObject;
