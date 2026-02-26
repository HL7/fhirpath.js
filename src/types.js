const addMinutes = require('date-fns/add_minutes');
const ucumUtils = require('@lhncbc/ucum-lhc').UcumLhcUtils.getInstance();
const numbers = require('./numbers');
// TODO: replace decimal.js with implementation that uses fixed precision
//  decimal format and implement supports all math operations?
const Decimal = require('decimal.js');

// The maximum number of significant digits.
// See
//  https://hl7.org/fhirpath/#integer
//  https://hl7.org/fhirpath/#decimal
Decimal.set({precision:31});

const ucumSystemUrl = 'http://unitsofmeasure.org';
const timeFormat =
  '[0-9][0-9](\\:[0-9][0-9](\\:[0-9][0-9](\\.[0-9]+)?)?)?';
const zoneFormat = '(Z|(\\+|-)[0-9][0-9]\\:[0-9][0-9])?';
const timeRE = new RegExp('^T?' + timeFormat + '$');
const dateTimeRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T' + timeFormat + zoneFormat +
  ')?)?)?Z?$');
const dateRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9])?)?$');
const instantRE = new RegExp(
  '^[0-9][0-9][0-9][0-9](-[0-9][0-9](-[0-9][0-9](T[0-9][0-9](:[0-9][0-9](:[0-9][0-9](\\.[0-9]+)?))(Z|([+-])[0-9][0-9]:[0-9][0-9]))))$');
// FHIR date/time regular expressions are slightly different.  For now, we will
// stick with the FHIRPath regular expressions.
//let fhirTimeRE = /([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?/;
//let fhirDateTimeRE =
///([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/;


/**
 * A lookup object for time units that are considered to be above the "week"
 * threshold. Used to determine if a unit represents a duration greater than
 * a week (e.g., years, months).
 * The keys are unit strings and the values are always true.
 * Includes quoted and unquoted UCUM units.
 *
 * @type {Object.<string, boolean>}
 */
const isAboveWeeks = [
  'years', 'year', 'months', 'month', 'mo', 'a', '\'mo\'', '\'a\''
].reduce((acc, unit) => {
  acc[unit] = true;
  return acc;
}, {});


/**
 *   Class FP_Type is the superclass for FHIRPath types that required special
 *   handling.
 */
class FP_Type {

  /**
   * Returns the string representation of this FHIRPath type.
   * Uses the `asStr` property if available, otherwise falls back to the
   * default Object.toString().
   * @returns {string}
   */
  toString() {
    return this.asStr ? this.asStr : super.toString();
  }


  /**
   * Returns the JSON representation of this FHIRPath type.
   * By default, returns the string representation.
   * @returns {string}
   */
  toJSON() {
    return this.toString();
  }

  /**
   *  Tests whether this object is equal to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).  The undefined return value indicates that the values were the
   *  same to the shared precision, but that they had different levels of
   *  precision.
   */
  equals(/* otherObj */) {
    throw new Error('equals() is not implemented for ' + this.constructor.name);
  }

  /**
   *  Tests whether this object is equivalant to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).
   */
  equivalentTo(/* otherObj */) {
    throw new Error('equivalentTo() is not implemented for ' + this.constructor.name);
  }

  /**
   * Returns the value as a JavaScript number.
   * @returns {number}
   */
  toNumber() {
    throw new Error('toNumber() is not implemented for ' + this.constructor.name);
  }

  /**
   * Returns the value as FP_Decimal.
   * @returns {FP_Decimal}
   */
  toDecimal() {
    throw new Error('toNumber() is not implemented for ' + this.constructor.name);
  }


  /**
   * Returns a BigInt representation of this object, if possible.
   * Otherwise, throws an error.
   */
  toBigInt() {
    throw new Error(this.constructor.name + ' cannot be converted to Long (BigInt)');
  }

  /**
   *  Returns -1, 0, or 1 if this object is less then, equal to, or greater
   *  than otherObj.
   */
  compare(/* otherObj */) {
    throw new Error('Comparison not implemented for ' + this.constructor.name);
  }

  /**
   *  Adds other value to this value.
   */
  plus(/* otherObj */) {
    throw new Error('Addition for ' + this.constructor.name + ' is not implemented');
  }

  /**
   * Subtracts another value from this value.
   */
  minus(/* otherObj */) {
    throw new Error('Subtraction for ' + this.constructor.name + ' is not implemented');
  }

  /**
   * Returns the negation of this value.
   */
  negate() {
    throw new Error('Negation for ' + this.constructor.name + ' is not implemented');
  }

  /**
   * Multiplies this value by another value.
   */
  mul(/* otherObj */) {
    throw new Error('Multiplication for ' + this.constructor.name + ' is not implemented');
  }

  /**
   * Divides this value by another value.
   */
  div(/* otherObj */) {
    throw new Error('Division for ' + this.constructor.name + ' is not implemented');
  }

  /**
   * Returns the absolute value of this value.
   */
  abs() {
    throw new Error('abs() for ' + this.constructor.name + ' is not implemented');
  }


  /**
   * Returns the ceiling of this value.
   */
  ceiling() {
    throw new Error('ceiling() for ' + this.constructor.name + ' is not implemented');
  }


  /**
   * Returns the floor of this value.
   */
  floor() {
    throw new Error('floor() is not implemented for ' + this.constructor.name);
  }


  /**
   * Rounds this value to the specified precision.
   */
  round(/*precision*/) {
    throw new Error('round() is not implemented for ' + this.constructor.name);
  }


  /**
   * Truncates this value.
   * @returns {FP_Type}
   */
  truncate() {
    throw new Error('truncate() is not implemented for ' + this.constructor.name);
  }

}


/**
 * Base class for FHIRPath types that require access to the evaluation context.
 * Stores a reference to the context object (ctx) for use by subclasses.
 */
class FP_Type_WithContext extends FP_Type {
  /**
   * @param {Object} ctx - the FHIRPath evaluation context.
   */
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }
}


/**
 *  A class for Quantities.
 */
class FP_Quantity extends FP_Type_WithContext {
  /**
   * Constructs a Quantity with a numeric value and a unit.
   * @param {Object} ctx - the FHIRPath evaluation context.
   * @param {FP_Decimal|number} value - the numeric value of the quantity.
   * @param {string} unit - the unit of the quantity (e.g. a calendar duration
   *   like 'month', or a UCUM code in single quotes like `'mo'` or `'kg'`).
   */
  constructor(ctx, value, unit) {
    super(ctx);
    // Convert value to FP_Decimal if it isn't already
    if (value instanceof FP_Decimal) {
      this.value = value;
    } else {
      this.value = ctx.getDecimal(value);
    }
    this.unit = unit;
    this.asStr = this.value.toString() + ' ' + unit;
  }


  /**
   * Determines if the current unit (or the provided unit) is a calendar duration.
   * Calendar durations are units like years, months, weeks, days, etc.
   *
   * @param {string} [toUnit] - The unit to check. If not provided, uses this.unit.
   * @returns {boolean} - True if the unit is a calendar duration, false otherwise.
   */
  isCalendarDuration(toUnit) {
    return hasOwnProperty(FP_Quantity._calendarDuration2Seconds, toUnit || this.unit);
  }


  /**
   * Checks if the current unit (or the provided unit) is above the "week" threshold,
   * meaning it represents a duration greater than a week (e.g., months, years).
   *
   * @param {string} [toUnit] - The unit to check. If not provided, uses this.unit.
   * @returns {boolean} - True if the unit is above the week threshold, false otherwise.
   */
  isUnitGreaterThanMaxComparable(toUnit) {
    return isAboveWeeks[toUnit || this.unit] ?? false;
  }


  /**
   * Determines if two units are incomparable due to mixing calendar durations
   * with non-calendar units when at least one unit is above the "week" threshold.
   *
   * Returns true when:
   * - One unit is a calendar duration and the other is not (UCUM or other)
   * - AND at least one of them represents a duration greater than a week
   *
   * Examples that return true:
   * - "1 day" (calendar) vs "1 'mo'" (UCUM month code) --> UCUM unit > week
   * - "1 month" (calendar) vs "1 'd'" (UCUM day) --> calendar unit > week
   * - "1 year" (calendar) vs "1 'kg'" (non-duration) --> calendar unit > week
   *
   * Calendar durations and UCUM durations use different semantics above the week
   * threshold and cannot be reliably compared. Calendar durations above weeks
   * (months, years) have variable actual lengths.
   *
   * See: https://build.fhir.org/ig/HL7/FHIRPath/#quantity-equality
   *
   * @param {string} otherUnit - The unit to compare with this.unit.
   * @returns {boolean} - True if the units are incomparable, false otherwise.
   */
  hasIncomparableDurationMix(otherUnit) {
    return this.isCalendarDuration() !== this.isCalendarDuration(otherUnit) &&
      (this.isUnitGreaterThanMaxComparable() || this.isUnitGreaterThanMaxComparable(otherUnit));
  }


  /**
   * Compares this Quantity with another for equality.
   * If the quantities could not be compared, returns undefined, which will be
   * converted to an empty collection in the "doInvoke" function.
   * See https://hl7.org/fhirpath/#equals
   *
   * @param {FP_Quantity|FP_Decimal|number} otherQuantity - The quantity to compare with
   * @returns {boolean|undefined} - true if equal, false if not equal, undefined if not
   *  comparable
   *
   * @example
   * // Allowed comparisons (≤ week threshold)
   * (1 week).equals(7 days)  // true
   * (1 day).equals(24 hours) // true
   * (1 week).equals(1 'wk')  // true
   * (1 month).equals(30 days) // true
   * (1 year).equals(12 months) // true
   *
   * @example
   * // Disallowed comparisons (> week threshold)
   * (1 month).equals(30 'd') // undefined (not comparable)
   * (1 'a').equals(365 days) // undefined (not comparable)
   */
  equals(otherQuantity) {
    let normalizedOtherQuantity;
    if (otherQuantity instanceof FP_Decimal || typeof otherQuantity === 'number') {
      if (this.unit === "'1'") {
        return this.value.equals(otherQuantity.value);
      }
      // If otherQuantity is a decimal or number, treat it as a UCUM quantity with
      // unit 1
      normalizedOtherQuantity = {
        value: this.ctx.getDecimal(otherQuantity),
        unit: '1'
      };
    } else {
      if (!(otherQuantity instanceof this.constructor)) {
        return false;
      }

      if (this.hasIncomparableDurationMix(otherQuantity.unit)) {
        return undefined;
      }

      if (this.unit === otherQuantity.unit) {
        return this.value.equals(otherQuantity.value);
      }

      // Special year/month comparison case: 1 year = 12 month
      const compareYearsAndMonths = this._compareYearsAndMonths(otherQuantity);
      if (compareYearsAndMonths) {
        return compareYearsAndMonths.isEqual;
      }

      normalizedOtherQuantity = FP_Quantity.toUcumQuantity(otherQuantity.value, otherQuantity.unit);
    }

    // General comparison case
    const thisQuantity = FP_Quantity.toUcumQuantity(this.value, this.unit),
      convResult = ucumConvertUnitTo(normalizedOtherQuantity.unit, normalizedOtherQuantity.value, thisQuantity.unit);

    if (convResult.status !== 'succeeded') {
      return false;
    }

    return thisQuantity.value.equals(convResult.toVal);
  }


  /**
   * Determines if this quantity is equivalent to another quantity.
   * See https://www.hl7.org/fhirpath/#quantity-equivalence
   *
   * @param {FP_Quantity} otherQuantity - The quantity to compare with.
   * @returns {boolean} - Returns true if the quantities are equivalent, false otherwise.
   */
  equivalentTo(otherQuantity) {
    if (!(otherQuantity instanceof this.constructor)) {
      return false;
    }

    // If the units are the same, compare the values directly.
    if (this.unit === otherQuantity.unit) {
      return this.value.equivalentTo(otherQuantity.value);
    }

    // Convert both units to their UCUM equivalents and attempt conversion.
    const ucumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(this.unit),
      otherUcumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(otherQuantity.unit),
      convOther = ucumConvertUnitTo(otherUcumUnitCode, otherQuantity.value, ucumUnitCode);

    // If units are not convertible, return false.
    if (convOther.status !== 'succeeded') {
      return false;
    }

    // If ucumUnitCode is most granular, use it for equivalence check.
    if (convOther.toVal.compare(otherQuantity.value) >= 0) {
      return this.value.equivalentTo(convOther.toVal);
    }

    // If otherUcumUnitCode is most granular, use it for equivalence check.
    // Skip the convThis.status check here because the conversion must succeed.
    const convThis = ucumConvertUnitTo(ucumUnitCode, this.value, otherUcumUnitCode);

    return convThis.toVal.equivalentTo(otherQuantity.value);
  }

  /**
   * Compares this Quantity with another to determine ordering.
   * Returns negative if this < other, positive if this > other, 0 if equal.
   * If the quantities could not be compared, returns null, which will be
   * converted to an empty collection in the "doInvoke" function.
   * See https://hl7.org/fhirpath/#comparison
   *
   * @param {FP_Quantity|FP_Decimal|number} otherQuantity
   * @return {number|null}
   *
   *  @example
   * // Allowed comparisons (≤ week threshold)
   * (2 weeks).compare(13 days) // > 0
   * (1 day).compare(25 hours) // < 0
   * (1 week).compare(1 'wk') // = 0
   *
   * @example
   * // Disallowed comparisons (> week threshold)
   * (1 month).compare(30 'd') // null (not comparable)
   * (1 'a').compare(1 day) // null (not comparable)
   */
  compare(otherQuantity) {
    let otherValue;
    let otherUcumUnitCode;
    if (otherQuantity instanceof FP_Decimal || typeof otherQuantity === 'number') {
      if (this.unit === "'1'") {
        return this.value.compare(otherQuantity);
      }
      otherValue = this.ctx.getDecimal(otherQuantity);
      otherUcumUnitCode = '1';
    } else {
      otherValue = otherQuantity.value;
      if (this.unit === otherQuantity.unit) {
        return this.value.minus(otherValue);
      }

      if (this.hasIncomparableDurationMix(otherQuantity.unit)) {
        return null;
      }

      const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
      const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

      if (thisUnitInSeconds !== undefined && otherUnitInSeconds !== undefined) {
        // If both operands are calendar durations
        const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit],
          otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];

        if (thisConvFactor && otherConvFactor) {
          // If the values are indicated in years and months, we use the conversion
          // factor: 1 year = 12 months
          return this.value.mul(thisConvFactor).compare(otherValue.mul(otherConvFactor));
        }

        // Otherwise, we convert them to seconds to compare.
        return this.value.mul(thisUnitInSeconds).compare(otherValue.mul(otherUnitInSeconds));
      }
      otherUcumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(otherQuantity.unit);
    }

    const ucumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(this.unit),
      convResult = ucumConvertUnitTo(otherUcumUnitCode, otherValue, ucumUnitCode);

    if (convResult.status !== 'succeeded') {
      return null;
    }

    return this.value.compare(convResult.toVal);
  }


  /**
   * Determines if this Quantity is comparable with another.
   * See https://hl7.org/fhir/fhirpath.html#fn-comparable
   *
   * @param {FP_Quantity} otherQuantity - The quantity to check comparability with
   * @returns {boolean} - true if comparable, false otherwise
   *
   * @example
   * (1 year).comparable(1 month) // true (both calendar durations)
   * (1 year).comparable(365 'd') // false (year is > week, 'd' is UCUM)
   * (1 day).comparable(24 'h') // true (both ≤ week threshold)
   */
  comparable(otherQuantity) {
    if (otherQuantity instanceof FP_Decimal || typeof otherQuantity === 'number') {
      if (this.unit === "'1'") {
        return true;
      }
      const convRes = ucumUtils.convertToBaseUnits(
        this.unit.replace(surroundingApostrophesRegex, ''), 1);
      if (convRes.status === 'succeeded') {
        return Object.keys(convRes.unitToExp).length === 0;
      }
      return false;
    }
    if (otherQuantity instanceof FP_Quantity) {
      if (this.unit === otherQuantity.unit) {
        return true;
      }

      if (this.hasIncomparableDurationMix(otherQuantity.unit)) {
        return false;
      }

      const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
      const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

      if (thisUnitInSeconds !== undefined && otherUnitInSeconds !== undefined) {
        // If both operands are calendar durations, they are comparable
        return true;
      }

      const ucumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(this.unit),
        otherUcumUnitCode = FP_Quantity.getEquivalentUcumUnitCode(otherQuantity.unit),
        convResult = ucumConvertUnitTo(otherUcumUnitCode, otherQuantity.value, ucumUnitCode);

      return convResult.status === 'succeeded';
    }

    return false;
  }


  /**
   * Adds a quantity to this quantity.
   *
   * This method handles addition of quantities with different units by:
   * 1. Converting year/month units using a conversion factor (1 year = 12 months)
   * 2. Converting calendar duration units using their second equivalents
   * 3. Converting other UCUM units using the UCUM utility library
   *
   * The result is returned in the unit of the smaller magnitude to preserve
   * precision, especially in following date-time arithmetic. For example:
   *
   *    `1 year + 6 months = 18 months`
   *
   *    `1 'h' + 30 'min' = 90 'min'`
   *
   * This is needed because date-time arithmetic ignores the decimal portion of
   * the time-valued quantity for precisions above seconds (see
   * https://hl7.org/fhirpath/#addition-2):
   *
   *   `@2011-01-10 + 18 months = 2012-07-10`
   *
   *   `@2011-01-10 + 1.5 years = @2011-01-10 + 1 years = 2012-01-10`
   *
   * @param {FP_Quantity|FP_Decimal|number} otherQuantity - A quantity to be added to this
   *  quantity.
   *
   * @returns {FP_Quantity|null} A new FP_Quantity object representing the sum
   *  of the two quantities, or null if:
   *   - The quantities have incomparable duration units
   *   - Unit conversion fails
   *   - Either unit involves special UCUM units that cannot be converted
   */
  plus(otherQuantity) {
    if (otherQuantity instanceof FP_TimeBase) {
      return otherQuantity.plus(this);
    }
    const typeOfOther = typeof otherQuantity;
    if (otherQuantity instanceof FP_Decimal || typeOfOther === 'number' || typeOfOther === 'bigint') {
      // If otherQuantity is a decimal or number, treat it as a quantity with unit '1'
      otherQuantity = new FP_Quantity(this.ctx, this.ctx.getDecimal(otherQuantity), "'1'");
    }
    const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit];
    const otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];
    if (thisConvFactor && otherConvFactor) {
      // If the values are indicated in years and months, we use the conversion factor: 1 year = 12 months
      if (thisConvFactor > otherConvFactor) {
        const convertedValue = this.value.mul(thisConvFactor).div(otherConvFactor);
        const resultValue = convertedValue.plus(otherQuantity.value);
        return new FP_Quantity(this.ctx, resultValue, otherQuantity.unit);
      }
      const convertedValue = otherQuantity.value.mul(otherConvFactor).div(thisConvFactor);
      const resultValue = this.value.plus(convertedValue);
      return new FP_Quantity(this.ctx, resultValue, this.unit);
    }

    if (this.hasIncomparableDurationMix(otherQuantity.unit)) {
      return null;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];
    if (thisUnitInSeconds && otherUnitInSeconds) {
      if (thisUnitInSeconds > otherUnitInSeconds) {
        const convertedValue = this.value.mul(thisUnitInSeconds).div(otherUnitInSeconds);
        const resultValue = convertedValue.plus(otherQuantity.value);
        return new FP_Quantity(this.ctx, resultValue, otherQuantity.unit);
      } else {
        const convertedValue = otherQuantity.value.mul(otherUnitInSeconds).div(thisUnitInSeconds);
        const resultValue = this.value.plus(convertedValue);
        return new FP_Quantity(this.ctx, resultValue, this.unit);
      }
    }

    const thisUcumUnitCode = thisUnitInSeconds ?
      FP_Quantity.mapTimeUnitsToUCUMCode[this.unit] :
      this.unit.replace(surroundingApostrophesRegex, '');

    const otherUcumUnitCode = otherUnitInSeconds ?
      FP_Quantity.mapTimeUnitsToUCUMCode[otherQuantity.unit] :
      otherQuantity.unit.replace(surroundingApostrophesRegex, '');

    const convResult = ucumConvertUnitTo(otherUcumUnitCode, otherQuantity.value,
      thisUcumUnitCode);

    if (convResult.status !== 'succeeded'
      || convResult.fromUnit.isSpecial_
      || convResult.toUnit.isSpecial_) {
      return null;
    }

    const resultValue = this.value.plus(convResult.toVal);

    if (convResult.fromUnit.magnitude_ < convResult.toUnit.magnitude_) {
      const convertedValue = resultValue.mul(convResult.toUnit.magnitude_)
        .div(convResult.fromUnit.magnitude_);
      return new FP_Quantity(this.ctx, convertedValue, otherUnitInSeconds ?
        otherQuantity.unit : "'" + otherUcumUnitCode + "'");
    }

    return new FP_Quantity(this.ctx, resultValue, thisUnitInSeconds ?
      this.unit : "'" + thisUcumUnitCode + "'");
  }


  /**
   * Subtracts a quantity from this quantity.
   * @param {FP_Quantity} otherQuantity - The quantity to subtract
   * @returns {FP_Quantity|null} The result of the subtraction
   */
  minus(otherQuantity) {
    if (otherQuantity instanceof FP_TimeBase) {
      throw new Error('Cannot substract a date/time based value from a quantity');
    }
    const typeOfOther = typeof otherQuantity;
    if (otherQuantity instanceof FP_Decimal || typeOfOther === 'number' || typeOfOther === 'bigint') {
      // If otherQuantity is a decimal or number, treat it as a quantity with unit '1'
      otherQuantity = new FP_Quantity(this.ctx, this.ctx.getDecimal(otherQuantity), "'1'");
    }
    // Handle year/month conversion factor case
    const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit];
    const otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];

    if (thisConvFactor && otherConvFactor) {
      if (thisConvFactor > otherConvFactor) {
        const convertedValue = this.value.mul(thisConvFactor).div(otherConvFactor);
        const resultValue = convertedValue.minus(otherQuantity.value);
        return new FP_Quantity(this.ctx, resultValue, otherQuantity.unit);
      }
      const convertedValue = otherQuantity.value.mul(otherConvFactor).div(thisConvFactor);
      const resultValue = this.value.minus(convertedValue);
      return new FP_Quantity(this.ctx, resultValue, this.unit);
    }

    if (this.hasIncomparableDurationMix(otherQuantity.unit)) {
      return null;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (thisUnitInSeconds && otherUnitInSeconds) {
      if (thisUnitInSeconds > otherUnitInSeconds) {
        const convertedValue = this.value.mul(thisUnitInSeconds).div(otherUnitInSeconds);
        const resultValue = convertedValue.minus(otherQuantity.value);
        return new FP_Quantity(this.ctx, resultValue, otherQuantity.unit);
      } else {
        const convertedValue = otherQuantity.value.mul(otherUnitInSeconds).div(thisUnitInSeconds);
        const resultValue = this.value.minus(convertedValue);
        return new FP_Quantity(this.ctx, resultValue, this.unit);
      }
    }

    const thisUcumUnitCode = thisUnitInSeconds ?
      FP_Quantity.mapTimeUnitsToUCUMCode[this.unit] :
      this.unit.replace(surroundingApostrophesRegex, '');

    const otherUcumUnitCode = otherUnitInSeconds ?
      FP_Quantity.mapTimeUnitsToUCUMCode[otherQuantity.unit] :
      otherQuantity.unit.replace(surroundingApostrophesRegex, '');

    const convResult = ucumConvertUnitTo(otherUcumUnitCode, otherQuantity.value,
      thisUcumUnitCode);

    if (convResult.status !== 'succeeded'
      || convResult.fromUnit.isSpecial_
      || convResult.toUnit.isSpecial_) {
      return null;
    }

    const resultValue = this.value.minus(convResult.toVal);

    if (convResult.fromUnit.magnitude_ < convResult.toUnit.magnitude_) {
      const convertedValue = resultValue.mul(convResult.toUnit.magnitude_)
        .div(convResult.fromUnit.magnitude_);
      return new FP_Quantity(this.ctx, convertedValue, otherUnitInSeconds ?
        otherQuantity.unit : "'" + otherUcumUnitCode + "'");
    }

    return new FP_Quantity(this.ctx, resultValue, thisUnitInSeconds ?
      this.unit : "'" + thisUcumUnitCode + "'");
  }


  /**
   * Returns the negation of this quantity's value while preserving the unit.
   * Creates a new FP_Quantity with the negated value.
   *
   * @returns {FP_Quantity} A new FP_Quantity with the negated value and
   *  the same unit.
   * @override
   * @example
   * // If this quantity is "5 'kg'", negate() returns "-5 'kg'"
   */
  negate() {
    return new FP_Quantity(this.ctx, this.value.negate(), this.unit);
  }


  /**
   * Multiplies this quantity to another quantity.
   * @param {FP_Quantity|FP_Decimal} otherQuantity a quantity by which to
   *  multiply this quantity.
   * @return {FP_Quantity}
   */
  mul(otherQuantity) {
    const typeOfOther = typeof otherQuantity;
    // If otherQuantity is a decimal or number, treat it as a quantity with unit '1'
    if (otherQuantity instanceof FP_Decimal || typeOfOther === 'number' || typeOfOther === 'bigint') {
      otherQuantity = new FP_Quantity(this.ctx, otherQuantity, "'1'");
    }

    if (
      (
        this.hasIncomparableDurationMix(otherQuantity.unit) &&
        this.unit !== "'1'" &&
        otherQuantity.unit !== "'1'"
      ) || (
        this.isCalendarDuration() &&
        this.isCalendarDuration(otherQuantity.unit) &&
        (
          this.isUnitGreaterThanMaxComparable() ||
          this.isUnitGreaterThanMaxComparable(otherQuantity.unit)
        )
      )
    ) {
      return null;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    const thisQ = this.convToUcumUnits(this, thisUnitInSeconds);
    if (!thisQ) {
      // If the first operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const otherQ = this.convToUcumUnits(otherQuantity, otherUnitInSeconds);
    if (!otherQ) {
      // If the second operand is not a UCUM quantity or it has a special unit
      return null;
    }

    // Do not use UCUM unit codes for durations in simple cases
    if (this.unit === "'1'") {
      return new FP_Quantity(this.ctx, this.value.mul(otherQuantity.value), otherQuantity.unit);
    } else if (otherQuantity.unit === "'1'") {
      return new FP_Quantity(this.ctx, this.value.mul(otherQuantity.value), this.unit);
    }

    const convResult = ucumConvertToBaseUnits(`(${thisQ.unit}).(${otherQ.unit})`, thisQ.value.mul(otherQ.value));
    if (convResult) {
      return new FP_Quantity(
        this.ctx,
        convResult.value,
        `'${convResult.unit}'`
      );
    }
    // If the result units are unclear
    return null;

  }


  /**
   * Divides this quantity by another quantity.
   * @param {FP_Quantity|FP_Decimal|number} otherQuantity a quantity by which to divide this quantity.
   * @return {FP_Quantity}
   */
  div(otherQuantity) {
    // If otherQuantity is a decimal or number, treat it as a quantity with unit '1'
    if (otherQuantity instanceof FP_Decimal) {
      if (otherQuantity.equals(0)) {
        // Division by zero always gives an empty result
        return null;
      }
      otherQuantity = new FP_Quantity(this.ctx, otherQuantity, "'1'");
    } else if (typeof otherQuantity === 'number' || typeof otherQuantity === 'bigint') {
      if (otherQuantity === 0) {
        // Division by zero always gives an empty result
        return null;
      }
      otherQuantity = new FP_Quantity(this.ctx, otherQuantity, "'1'");
    } else if (otherQuantity.value.equals(0)) {
      // Division by zero always gives an empty result
      return null;
    } else if (otherQuantity.unit !== "'1'" && this.hasIncomparableDurationMix(otherQuantity.unit)) {
      return null;
    }

    const thisUnitInSeconds = FP_Quantity._calendarDuration2Seconds[this.unit];
    const otherUnitInSeconds = FP_Quantity._calendarDuration2Seconds[otherQuantity.unit];

    if (thisUnitInSeconds) {
      if (otherUnitInSeconds) {
        // If both operands are calendar duration quantities
        const thisConvFactor = FP_Quantity._yearMonthConversionFactor[this.unit];
        const otherConvFactor = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];
        if (thisConvFactor && otherConvFactor) {
          // If the values are indicated in years and months, we use the conversion factor: 1 year = 12 months
          return new FP_Quantity(this.ctx, this.value.mul(thisConvFactor).div(otherQuantity.value.mul(otherConvFactor)), "'1'");
        }
      } else if (otherQuantity.unit === "'1'") {
        // If the second operand is a number
        return new FP_Quantity(this.ctx, this.value.div(otherQuantity.value), this.unit);
      }
    }

    const thisQ = this.convToUcumUnits(this, thisUnitInSeconds);
    if (!thisQ) {
      // If the first operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const otherQ = this.convToUcumUnits(otherQuantity, otherUnitInSeconds);
    if (!otherQ) {
      // If the second operand is not a UCUM quantity or it has a special unit
      return null;
    }

    const resultUnit = otherQ.unit === '1'
      ? thisQ.unit
      : `(${thisQ.unit})/(${otherQ.unit})`;

    const convResult = ucumConvertToBaseUnits(resultUnit, thisQ.value.div(otherQ.value));
    if (convResult) {
      return new FP_Quantity(
        this.ctx,
        convResult.value,
        `'${convResult.unit}'`
      );
    }
    // If the result units are unclear
    return null;
  }


  toDecimal() {
    if (this.unit === "'1'") {
      return this.value;
    }
    const convResult = ucumConvertToBaseUnits(
      this.unit.replace(surroundingApostrophesRegex, ''), this.value);
    if (convResult?.unit === "1") {
      return convResult.value;
    }
  }


  /**
   * Returns the absolute value of this quantity.
   * @returns {FP_Quantity}
   */
  abs() {
    return new FP_Quantity(this.ctx, this.value.abs(), this.unit);
  }

  /**
   * Returns the ceiling of this quantity.
   * @return {FP_Quantity}
   */
  ceiling() {
    return new FP_Quantity(this.ctx, this.value.ceiling(), this.unit);
  }

  /**
   * Returns the floor of this quantity.
   * @return {FP_Quantity}
   */
  floor() {
    return new FP_Quantity(this.ctx, this.value.floor(), this.unit);
  }

  /**
   * Returns the rounded value of this quantity.
   * @param {number} [precision] - number of decimal places.
   * @return {FP_Quantity}
   */
  round(precision) {
    return new FP_Quantity(this.ctx, this.value.round(precision), this.unit);
  }


  /**
   * Returns the truncated value of this quantity.
   * @return {FP_Quantity}
   */
  truncate() {
    return new FP_Quantity(this.ctx, this.value.truncate(), this.unit);
  }

  /**
   * Converts a quantity to UCUM unit if possible, otherwise returns null.
   * @param {FP_Quantity} quantity - source quantity.
   * @param {number|undefined} unitInSeconds - if the source quantity is a
   *  calendar duration then the value of the quantity unit in seconds,
   *  otherwise undefined.
   * @return {{unit: string, value: FP_Decimal} | null}
   */
  convToUcumUnits(quantity, unitInSeconds) {
    if (unitInSeconds) {
      return {
        value: quantity.value.mul(unitInSeconds),
        unit: 's'
      };
    } else {
      const unit = quantity.unit.replace(surroundingApostrophesRegex, '');
      const convRes = ucumConvertToBaseUnits(unit, quantity.value);
      if (convRes === null || convRes.fromUnitIsSpecial) {
        // If it is not a UCUM quantity or it has a special unit
        return null;
      }
      return {
        value: convRes.value,
        unit: convRes.unit
      };
    }
  }

  /**
   * If both quantities have one of these units: year or month,
   * then a special case will apply; otherwise returns null.
   * In the special case of comparison, the fact that 1 year = 12 months is used.
   *
   * Just note: in general, for a calendar duration:
   * 1 year = 365 days
   * 12 month = 12*30 days = 360 days
   * so, 1 year != 12 month
   * That's why this special case is needed
   *
   * @param {FP_Quantity} otherQuantity
   * @return {null|{isEqual: boolean}}
   * @private
   */
  _compareYearsAndMonths(otherQuantity) {
    const magnitude1 = FP_Quantity._yearMonthConversionFactor[this.unit],
      magnitude2 = FP_Quantity._yearMonthConversionFactor[otherQuantity.unit];

    if ( magnitude1 && magnitude2) {
      return {
        isEqual: this.value.mul(magnitude1).equals(otherQuantity.value.mul(magnitude2))
      };
    }

    return null;
  }

}

const  surroundingApostrophesRegex = /^'|'$/g;
/**
 * Converts a FHIR path unit to a UCUM unit code by converting a calendar duration keyword to an equivalent UCUM unit code
 * or removing single quotes for a UCUM unit.
 * @param {string} unit
 * @return {string}
 */
FP_Quantity.getEquivalentUcumUnitCode = function (unit) {
  return FP_Quantity.mapTimeUnitsToUCUMCode[unit] || unit.replace(surroundingApostrophesRegex, '');
};

/**
 * Converts FHIR path value/unit to UCUM value/unit. Usable for comparison.
 * @param {FP_Decimal} value
 * @param {string} unit
 * @returns { {value: FP_Decimal, unit: string} }
 */
FP_Quantity.toUcumQuantity = function (value, unit) {
  const magnitude = FP_Quantity._calendarDuration2Seconds[unit];
  if (magnitude) {
    return {
      value: value.mul(magnitude),
      unit: 's'
    };
  }

  return {
    value,
    unit: unit.replace(surroundingApostrophesRegex, '')
  };
};


/**
 * Wrapper for ucumUtils.convertUnitTo that accepts FP_Decimal values.
 * Converts a quantity from one unit to another, preserving decimal precision.
 *
 * @param {string} fromUnitCode - The source unit code.
 * @param {FP_Decimal} fromVal - The value to convert (can be FP_Decimal or number).
 * @param {string} toUnitCode - The target unit code.
 * @returns {Object} The conversion result with toVal as FP_Decimal if successful,
 *   or the original ucumUtils result if conversion failed.
 */
function ucumConvertUnitTo(fromUnitCode, fromVal, toUnitCode) {
  const result = ucumUtils.convertUnitTo(fromUnitCode, 1, toUnitCode);

  if (result.status === 'succeeded') {
    return {
      ...result,
      toVal: fromVal.mul(result.fromUnit.magnitude_).div(result.toUnit.magnitude_)
    };
  }

  return result;
}


/**
 * Cache for ucumUtils.convertToBaseUnits results.
 * Keys are unit codes, values are the conversion results (or null if failed).
 * @type {Map<string, {unit: string, magnitude: number, fromUnitIsSpecial: boolean}|null>}
 */
const ucumConvertToBaseUnitsCache = new Map();


/**
 * Wrapper for ucumUtils.convertToBaseUnits that accepts FP_Decimal values.
 * Converts a quantity to base UCUM units, preserving decimal precision.
 * Results are cached by unit code for performance.
 *
 * @param {string} unitCode - The source unit code.
 * @param {FP_Decimal} value - The value to convert.
 * @returns {{unit: string, value: FP_Decimal, fromUnitIsSpecial: boolean}|null} An object with the base unit,
 *   converted value, and whether the source unit is special, or null if conversion failed.
 */
function ucumConvertToBaseUnits(unitCode, value) {
  let cachedResult = ucumConvertToBaseUnitsCache.get(unitCode);

  if (cachedResult === undefined) {
    const result = ucumUtils.convertToBaseUnits(unitCode, 1);
    if (result.status === 'succeeded') {
      cachedResult = {
        unit: Object.keys(result.unitToExp).map(key => key+result.unitToExp[key]).join('.') || '1',
        magnitude: result.magnitude,
        fromUnitIsSpecial: result.fromUnitIsSpecial
      };
    } else {
      cachedResult = null;
    }
    ucumConvertToBaseUnitsCache.set(unitCode, cachedResult);
  }

  if (cachedResult === null) {
    return null;
  }

  return {
    unit: cachedResult.unit,
    value: value.mul(cachedResult.magnitude),
    fromUnitIsSpecial: cachedResult.fromUnitIsSpecial
  };
}


/**
 * Converts FHIRPath value/unit to other FHIRPath value/unit.
 *
 * @param {Object} ctx - The context object containing getDecimal method.
 * @param {string} fromUnit - The source unit code.
 * @param {FP_Decimal|number} value - The value to convert (can be FP_Decimal or number).
 * @param {string} toUnit - The target unit code.
 * @returns {Object} The conversion result with toVal as FP_Decimal if successful,
 *   or the original ucumUtils result if conversion failed.
 *
 * @param {string} fromUnit
 * @param {number} value
 * @param {string} toUnit
 * @return {FP_Quantity|null}
 */
FP_Quantity.convUnitTo = function (ctx, fromUnit, value, toUnit) {
  // 1 Year <-> 12 Months
  const fromYearMonthMagnitude = FP_Quantity._yearMonthConversionFactor[fromUnit],
    toYearMonthMagnitude = FP_Quantity._yearMonthConversionFactor[toUnit];
  if (fromYearMonthMagnitude && toYearMonthMagnitude) {
    return new FP_Quantity(ctx, value.mul(fromYearMonthMagnitude).div(toYearMonthMagnitude), toUnit);
  }

  const fromMagnitude = FP_Quantity._calendarDuration2Seconds[fromUnit],
    toMagnitude = FP_Quantity._calendarDuration2Seconds[toUnit];

  // To FHIR path calendar duration
  if (toMagnitude) {
    if (fromMagnitude) {
      return new FP_Quantity(ctx, value.mul(fromMagnitude).div(toMagnitude), toUnit);
    } else {
      const convResult = ucumConvertUnitTo(fromUnit.replace(/^'|'$/g, ''), value, 's');

      if (convResult.status === 'succeeded') {
        return new FP_Quantity(ctx, convResult.toVal.div(toMagnitude), toUnit);
      }
    }
  // To Ucum unit
  } else {
    const convResult = fromMagnitude ? ucumConvertUnitTo('s', value.mul(fromMagnitude), toUnit.replace(/^'|'$/g, ''))
      : ucumConvertUnitTo(fromUnit.replace(/^'|'$/g, ''), value, toUnit.replace(/^'|'$/g, ''));

    if(convResult.status === 'succeeded') {
      return new FP_Quantity(ctx, convResult.toVal, toUnit);
    }
  }

  return null;
};


// Defines conversion factors for calendar durations
FP_Quantity._calendarDuration2Seconds = {
  'years': 365*24*60*60,
  'months': 30*24*60*60,
  'weeks': 7*24*60*60,
  'days': 24*60*60,
  'hours': 60*60,
  'minutes': 60,
  'seconds': 1,
  'milliseconds': .001,
  'year': 365*24*60*60,
  'month': 30*24*60*60,
  'week': 7*24*60*60,
  'day': 24*60*60,
  'hour': 60*60,
  'minute': 60,
  'second': 1,
  'millisecond': .001
};

// Defines special case to compare years with months for calendar durations
FP_Quantity._yearMonthConversionFactor = {
  'years': 12,
  'months': 1,
  'year': 12,
  'month': 1
};

/**
 *  Defines a map from time units that are supported for date/time arithmetic
 *  (including some UCUM time based units) to FHIRPath time units.
 */
FP_Quantity.dateTimeArithmeticDurationUnits = {
  'years': "year",
  'months': "month",
  'weeks': "week",
  'days': "day",
  'hours': "hour",
  'minutes': "minute",
  'seconds': "second",
  'milliseconds': "millisecond",
  'year': "year",
  'month': "month",
  'week': "week",
  'day': "day",
  'hour': "hour",
  'minute': "minute",
  'second': "second",
  'millisecond': "millisecond",
  "'wk'": "week",
  "'d'": "day",
  "'h'": "hour",
  "'min'": "minute",
  "'s'": "second",
  "'ms'": "millisecond"
};

/**
 *  Defines a map from UCUM code to FHIRPath time units.
 */
FP_Quantity.mapUCUMCodeToTimeUnits = {
  'a': "year",
  'mo': "month",
  'wk': "week",
  'd': "day",
  'h': "hour",
  'min': "minute",
  's': "second",
  'ms': "millisecond",
};

/**
 *  Defines a map from FHIRPath time units to UCUM code.
 */
FP_Quantity.mapTimeUnitsToUCUMCode = Object.keys(FP_Quantity.mapUCUMCodeToTimeUnits)
  .reduce(function (res, key) {
    res[FP_Quantity.mapUCUMCodeToTimeUnits[key]] = key;
    res[FP_Quantity.mapUCUMCodeToTimeUnits[key]+'s'] = key;
    return res;
  }, {});

/**
 * Abstract base class for FHIRPath date/time types (FP_DateTime, FP_Date,
 * FP_Time, FP_Instant). Provides common date/time arithmetic, comparison,
 * and precision handling.
 */
class FP_TimeBase extends FP_Type_WithContext {
  /**
   * @param {Object} ctx - the FHIRPath evaluation context.
   * @param {string} timeStr - the date/time string representation.
   */
  constructor(ctx, timeStr) {
    super(ctx);
    this.asStr = timeStr;
  }

  /**
   *  Adds a time-based quantity to this date/time.
   * @param timeQuantity a quantity to be added to this date/time.  See the
   *  FHIRPath specification for supported units.
   */
  plus(timeQuantity) {
    const unit = timeQuantity.unit;
    let timeUnit = FP_Quantity.dateTimeArithmeticDurationUnits[unit];
    if (!timeUnit) {
      throw new Error('For date/time arithmetic, the unit of the quantity ' +
        'must be one of the following time-based units: ' +
        Object.keys(FP_Quantity.dateTimeArithmeticDurationUnits));
    }
    const cls = this.constructor;
    const unitPrecision = cls._timeUnitToDatePrecision[timeUnit];
    if (unitPrecision === undefined) {
      throw new Error('Unsupported unit for +.  The unit should be one of ' +
        Object.keys(cls._timeUnitToDatePrecision).join(', ') + '.');
    }
    let qVal = timeQuantity.value;
    const isTime = (cls === FP_Time);

    if (isTime ? unitPrecision < 2 : unitPrecision < 5) {
      // From the FHIRPath specification: "For precisions above seconds, the
      // decimal portion of the time-valued quantity is ignored, since date/time
      // arithmetic above seconds is performed with calendar duration semantics."
      const truncatedVal = qVal.truncate();
      if (!truncatedVal.equals(qVal)) {
        console.warn( 'The quantity value was truncated from ' +
          timeQuantity.toString() + ' to ' +
          truncatedVal + ' ' + timeQuantity.unit +
          ' in operation with ' + this.toString());
      }
      qVal = truncatedVal;
    }

    // If the precision of the time quantity is higher than the precision of the
    // date, we need to convert the time quantity to the precision of the date.
    if (this._getPrecision() < unitPrecision) {
      const neededUnit = cls._datePrecisionToTimeUnit[
        this._getPrecision()];
      if (neededUnit !== 'second') {
        const newQuantity = FP_Quantity.convUnitTo(this.ctx, timeUnit, qVal, neededUnit);
        timeUnit = newQuantity.unit;
        qVal = newQuantity.value.truncate();
      }
    }
    const newDate = FP_TimeBase.timeUnitToAddFn[timeUnit](this._getDateObj(), qVal.toNumber());
    // newDate is a Date.  We need to make a string with the correct precision.
    let precision = this._getPrecision();
    if (isTime)
      precision += 3; // based on dateTimeRE, not timeRE
    let newDateStr = FP_DateTime.isoDateTime(newDate, precision);
    if (isTime) {
      // FP_Time just needs the time part of the string
      newDateStr = newDateStr.slice(newDateStr.indexOf('T') + 1, -6);
    }

    return new cls(this.ctx, newDateStr);
  }


  /**
   * Subtracts a time-based quantity from this date/time.
   * @param {FP_Quantity} timeQuantity - a quantity to subtract. See the
   *  FHIRPath specification for supported units.
   * @returns {FP_TimeBase} a new date/time with the quantity subtracted.
   * @throws {Error} if the quantity's unit is not a supported time unit.
   */
  minus(timeQuantity) {
    if (timeQuantity instanceof FP_Quantity) {
      const negativeQuantity = timeQuantity.negate();
      return this.plus(negativeQuantity);
    }
    throw new Error('For date/time arithmetic, the unit of the quantity ' +
      'must be one of the following time-based units: ' +
      Object.keys(FP_Quantity.dateTimeArithmeticDurationUnits));
  }


  /**
   *  Tests whether this object is equal to another.  Returns either true,
   *  false, or undefined (where in the FHIRPath specification empty would be
   *  returned).  The undefined return value indicates that the values were the
   *  same to the shared precision, but that they had differnent levels of
   *  precision.
   * @param otherDateTime any sub-type of FP_TimeBase, but it should be the same
   *  as the type of "this".
   */
  equals(otherDateTime) {
    // From the 2019May ballot:
    // For Date, DateTime and Time equality, the comparison is performed by
    // considering each precision in order, beginning with years (or hours for
    // time values), and respecting timezone offsets. If the values are the
    // same, comparison proceeds to the next precision; if the values are
    // different, the comparison stops and the result is false. If one input has
    // a value for the precision and the other does not, the comparison stops
    // and the result is empty ({ }); if neither input has a value for the
    // precision, or the last precision has been reached, the comparison stops
    // and the result is true.
    // Note:  Per the spec above
    //   2012-01 = 2012 //  empty
    //   2012-01 = 2011 //  false
    //   2012-01 ~ 2012 //  false
    var rtn;
    if (!(otherDateTime instanceof this.constructor) && !(this instanceof otherDateTime.constructor))
      rtn = false;
    else {
      var thisPrec  = this._getPrecision();
      var otherPrec = otherDateTime._getPrecision();

      if (thisPrec == otherPrec) {
        rtn = this._getDateObj().getTime() == otherDateTime._getDateObj().getTime();
      }
      else {
        // The dates are not equal, but decide whether to return empty or false.
        var commonPrec  = thisPrec <= otherPrec ? thisPrec : otherPrec;
        // Adjust for timezone offsets, if any, so they are at a common timezone
        var thisUTCStr  = this._getDateObj().toISOString();
        var otherUTCStr = otherDateTime._getDateObj().toISOString();

        if (this.constructor === FP_Time) {
          commonPrec += 3; // because we now have year, month, and day
          thisPrec += 3;
          otherPrec += 3;
        }

        // Now parse the strings and compare the adjusted time parts.
        // Dates without time specify no timezone and should be treated as already normalized to UTC. So we do not adjust the timezone, as this would change the date
        var thisAdj  = thisPrec > 2 ? (new FP_DateTime(this.ctx, thisUTCStr))._getTimeParts() : this._getTimeParts();
        var otherAdj = otherPrec > 2 ? (new FP_DateTime(this.ctx, otherUTCStr))._getTimeParts() : otherDateTime._getTimeParts();

        for (var i = 0; i <= commonPrec && rtn !== false; ++i) {
          rtn = thisAdj[i] == otherAdj[i];
        }
        // if rtn is still true, then return empty to indicate the difference in
        // precision.
        if (rtn)
          rtn = undefined;
      }
    }
    // else return undefined (empty)
    return rtn;
  }


  /**
   *  Tests whether this object is equivalant to another.  Returns either true
   *  or false.
   */
  equivalentTo(otherDateTime) {
    var rtn = otherDateTime instanceof this.constructor;
    if (rtn) {
      var thisPrec = this._getPrecision();
      var otherPrec = otherDateTime._getPrecision();
      rtn = thisPrec == otherPrec;
      if (rtn) {
        rtn = this._getDateObj().getTime() ==
          otherDateTime._getDateObj().getTime();
      }
    }
    return rtn;
  }


  /**
   *  Returns a number less than 0, equal to 0 or greater than 0
   *  if this (date) time is less than, equal to, or greater than otherTime.
   *  Comparisons are made at the lesser of the two time precisions.
   *  @param {FP_TimeBase} otherTime
   *  @return {number}
   */
  compare(otherTime) {
    var thisPrecision = this._getPrecision();
    var otherPrecision = otherTime._getPrecision();
    var thisTimeInt = thisPrecision <= otherPrecision ?
      this._getDateObj().getTime(): this._dateAtPrecision(otherPrecision).getTime();
    var otherTimeInt = otherPrecision <= thisPrecision ?
      otherTime._getDateObj().getTime(): otherTime._dateAtPrecision(thisPrecision).getTime();
    if (thisPrecision !== otherPrecision && thisTimeInt === otherTimeInt) {
      return null;
    }
    return thisTimeInt - otherTimeInt;
  }


  /**
   *  Returns a number representing the precision of the time string given to
   *  the constructor.  (Higher means more precise).  The number is the number
   *  of components of the time string (ignoring the time zone) produced by
   *  matching against the time regular expression, except that milliseconds
   *  and seconds are counted together as a single of level of precision.
   *  @return {number}
   */
  _getPrecision() {
    if (this.precision === undefined)
      this._getMatchData();
    return this.precision;
  }

  /**
   *  Returns the match data from matching the given RegExp against the
   *  date/time string given to the constructor.
   *  Also sets this.precision.
   * @param regEx The regular expression to match against the date/time string.
   * @param maxPrecision the maximum precision possible for the type
   */
  _getMatchData(regEx, maxPrecision) {
    if (this.timeMatchData === undefined) {
      this.timeMatchData = this.asStr.match(regEx);
      if (this.timeMatchData) {
        for (let i=maxPrecision; i>=0 && this.precision === undefined; --i) {
          if (this.timeMatchData[i])
            this.precision = i;
        }
      }
    }
    return this.timeMatchData;
  }

  /**
   *  Returns an array of the pieces of the given time string, for use in
   *  constructing lower precision versions of the time. The returned array will
   *  contain separate elements for the hour, minutes, seconds, and milliseconds
   *  (or as many of those are as present).  The length of the returned array
   *  will therefore be an indication of the precision.
   *  It will not include the timezone.
   * @timeMatchData the result of matching the time portion of the string passed
   *  into the constructor against the "timeRE" regular expression.
   */
  _getTimeParts(timeMatchData) {
    var timeParts = [];
    // Finish parsing the data into pieces, for later use in building
    // lower-precision versions of the date if needed.
    timeParts = [timeMatchData[0]];
    var timeZone = timeMatchData[4];
    if (timeZone) { // remove time zone from hours
      let hours = timeParts[0];
      timeParts[0] = hours.slice(0, hours.length-timeZone.length);
    }
    var min = timeMatchData[1];
    if (min) { // remove minutes from hours
      let hours = timeParts[0];
      timeParts[0] = hours.slice(0, hours.length-min.length);
      timeParts[1] = min;
      var sec = timeMatchData[2];
      if (sec) { // remove seconds from minutes
        timeParts[1] = min.slice(0, min.length-sec.length);
        timeParts[2] = sec;
        var ms = timeMatchData[3];
        if (ms) { // remove milliseconds from seconds
          timeParts[2] = sec.slice(0, sec.length-ms.length);
          timeParts[3] = ms;
        }
      }
    }
    return timeParts;
  }


  /**
   *  Returns a date object representing this time on a certain date.
   */
  _getDateObj() {
    if (!this.dateObj) {
      var precision = this._getPrecision();
      // We cannot directly pass the string into the date constructor because
      // (1) we don't want to introduce a time-dependent system date and (2) the
      // time string might not have contained minutes, which are required by the
      // Date constructor.
      this.dateObj = this._dateAtPrecision(precision);
    }
    return this.dateObj;
  }


  /**
   * Creates a date object for the given timezone.
   *
   * @param {number} year The full year designation is required for
   *  cross-century date accuracy. If year is between 0 and 99 is used,
   *  then year is assumed to be 1900 + year.
   * @param {number} month The month as a number between 0 and 11 (January to
   *  December).
   * @param {number} day The date as a number between 1 and 31.
   * @param {number} hour A number from 0 to 23 (midnight to 11pm) that
   *  specifies the hour.
   * @param {number} minutes A number from 0 to 59 that specifies the minutes.
   * @param {number} seconds A number from 0 to 59 that specifies the seconds.
   * @param ms A number from 0 to 999 that specifies the milliseconds.
   * @param {string} timezoneOffset (optional) a string in the format (+-)HH:mm or Z, representing the
   *  timezone offset.  If not provided, the local timezone will be assumed (as the
   *  Date constructor does).
   * @returns {Date} a Date object representing the date and time in the
   *  specified timezone.
   */
  _createDate(year, month, day, hour, minutes, seconds, ms, timezoneOffset) {
    var d = new Date(year, month, day, hour, minutes, seconds, ms);
    if (timezoneOffset) {
      // d is in local time.  Adjust for the timezone offset.
      // First adjust the date by the timezone offset before reducing its
      // precision.  Otherwise,
      // @2018-11-01T-04:00 < @2018T-05:00
      var localTimezoneMinutes = d.getTimezoneOffset();
      var timezoneMinutes = 0; // if Z
      if (timezoneOffset !== 'Z') {
        var timezoneParts = timezoneOffset.split(':'); // (+-)hours:minutes
        var hours = parseInt(timezoneParts[0]);
        timezoneMinutes = parseInt(timezoneParts[1]);
        if (hours < 0)
          timezoneMinutes = -timezoneMinutes;
        timezoneMinutes += 60*hours;
      }
      // localTimezoneMinutes has the inverse sign of its timezone offset
      d = addMinutes(d, -localTimezoneMinutes-timezoneMinutes);
    }
    return d;
  }
}


/**
 *  A map from a FHIRPath time units to a function used to add that
 *  quantity to a date/time.
 */
FP_TimeBase.timeUnitToAddFn = {
  "year": require('date-fns/add_years'),
  "month": require('date-fns/add_months'),
  "week": require('date-fns/add_weeks'),
  "day": require('date-fns/add_days'),
  "hour": require('date-fns/add_hours'),
  "minute": require('date-fns/add_minutes'),
  "second": require('date-fns/add_seconds'),
  "millisecond": require('date-fns/add_milliseconds')
};


/**
 * A class representing a FHIRPath DateTime value.
 */
class FP_DateTime extends FP_TimeBase {
  /**
   *  Constructs an FP_DateTime, assuming dateStr is valid.  If you don't know
   *  whether a string is a valid DateTime, use FP_DateTime.checkString instead.
   */
  constructor(ctx, dateStr) {
    super(ctx, dateStr);
  }


  /**
   *  Returns -1, 0, or 1 if this date time is less then, equal to, or greater
   *  than otherDateTime.  Comparisons are made at the lesser of the two date time
   *  precisions.
   */
  compare(otherDateTime) {
    if (!(otherDateTime instanceof FP_DateTime))
      throw 'Invalid comparison of a DateTime with something else';
    return super.compare(otherDateTime);
  }


  /**
   *  Returns the match data from matching dateTimeRE against the datetime string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(dateTimeRE, 5);
  }

  /**
   *  Returns an array of the pieces of the date time string passed into the
   *  constructor, for use in constructing lower precision versions of the
   *  date time. The returned array will contain separate elements for the year,
   *  month, day, hour, minutes, seconds, and milliseconds (or as many of those
   *  are as present).  The length of the returned array will therefore be an
   *  indication of the precision.  It will not include the timezone.
   */
  _getTimeParts() {
    if (!this.timeParts) {
      let timeMatchData =  this._getMatchData();
      let year = timeMatchData[0];
      this.timeParts = [year];
      var month = timeMatchData[1];
      if (month) { // Remove other information from year
        this.timeParts[0] = year.slice(0, year.length-month.length);
        this.timeParts[1] = month;
        let day = timeMatchData[2];
        if (day) { // Remove day information from month
          this.timeParts[1] = month.slice(0, month.length-day.length);
          this.timeParts[2] = day;
          let time = timeMatchData[3];
          if (time) { // Remove time from day
            this.timeParts[2] = day.slice(0, day.length-time.length);
            if (time[0] === 'T') // remove T from hour
              timeMatchData[3] = time.slice(1);
            this.timeParts = this.timeParts.concat(
              super._getTimeParts(timeMatchData.slice(3)));
          }
        }
      }
    }
    return this.timeParts;
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   * @param precision the new precision, which is assumed to be less than
   *  or equal to the current precision.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts();
    var timezoneOffset = this._getMatchData()[7];
    // Get the date object first at the current precision.
    var thisPrecision = this._getPrecision();
    var year = parseInt(timeParts[0]);
    var month = thisPrecision > 0 ? parseInt(timeParts[1].slice(1)) - 1 : 0;
    var day = thisPrecision > 1 ? parseInt(timeParts[2].slice(1)) : 1;
    var hour = thisPrecision > 2 ? parseInt(timeParts[3]) : 0;
    var minutes = thisPrecision > 3 ? parseInt(timeParts[4].slice(1)): 0;
    var seconds = thisPrecision > 4 ? parseInt(timeParts[5].slice(1)): 0;
    var ms = timeParts.length > 6 ? parseInt(timeParts[6].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (precision < thisPrecision) {
      // Adjust the precision
      year = d.getFullYear();
      month = precision > 0 ? d.getMonth() : 0;
      day = precision > 1 ? d.getDate() : 1;
      hour = precision > 2 ? d.getHours() : 0;
      minutes = precision > 3 ? d.getMinutes(): 0;
      // Here the precision will always be less than the maximum
      // due to the condition in the if statement: "precision < thisPrecision"
      d = new Date(year, month, day, hour, minutes);
    }
    return d;
  }
}

/**
 *  Tests str to see if it is convertible to a DateTime.
 * @return If str is convertible to a DateTime, returns an FP_DateTime;
 *  otherwise returns null.
 */
FP_DateTime.checkString = function(ctx, str) {
  let d = new FP_DateTime(ctx, str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A map from FHIRPath time units to the internal DateTime "precision" number.
 */
FP_DateTime._timeUnitToDatePrecision = {
  "year": 0,
  "month": 1,
  "week": 2, // wk is just 7*d
  "day": 2,
  "hour": 3,
  "minute": 4,
  "second": 5,
  "millisecond": 6
};

/**
 *  The inverse of _timeUnitToDatePrecision.
 */
FP_DateTime._datePrecisionToTimeUnit = [
  "year", "month", "day", "hour", "minute", "second", "millisecond"
];



/**
 * A class representing a FHIRPath Time value (e.g. "14:30:00").
 */
class FP_Time extends FP_TimeBase {
  /**
   *  Constructs an FP_Time, assuming dateStr is valid.  If you don't know
   *  whether a string is a valid DateTime, use FP_Time.checkString instead.
   */
  constructor(ctx, timeStr) {
    if (timeStr[0] === 'T')
      timeStr = timeStr.slice(1);
    super(ctx, timeStr);
  }


  /**
   *  Returns -1, 0, or 1 if this time is less then, equal to, or greater
   *  than otherTime.  Comparisons are made at the lesser of the two time
   *  precisions.
   */
  compare(otherTime) {
    if (!(otherTime instanceof FP_Time))
      throw 'Invalid comparison of a time with something else';
    return super.compare(otherTime);
  }


  /**
   *  Returns a new Date object for a time equal to what this time would be if
   *  the string passed into the constructor had the given precision.
   *  The "date" portion of the returned Date object is not meaningful, and
   *  should be ignored.
   * @param precision the new precision, which is assumed to be less than the
   *  or equal to the current precision.  A precision of 0 means the hour.
   */
  _dateAtPrecision(precision) {
    var timeParts = this._getTimeParts();
    var timezoneOffset = this._getMatchData()[4];
    // Get the date object first at the current precision.
    var thisPrecision = this._getPrecision();
    var year = 2010; // Have to pick some year for the date object
    var month = 0;
    var day = 1;
    var hour = parseInt(timeParts[0]);
    var minutes = thisPrecision > 0 ? parseInt(timeParts[1].slice(1)): 0;
    var seconds = thisPrecision > 1 ? parseInt(timeParts[2].slice(1)): 0;
    var ms = timeParts.length > 3 ? parseInt(timeParts[3].slice(1)): 0;
    var d = this._createDate(year, month, day, hour, minutes, seconds, ms,
      timezoneOffset);
    if (timezoneOffset) {
      // Keep the date the same (in the local timezone), so it is not a relevant
      // factor when comparing different times.
      d.setYear(year);
      d.setMonth(month);
      d.setDate(day);
    }
    if (precision < thisPrecision) {
      // Adjust the precision
      hour = d.getHours();
      minutes = precision > 0 ? d.getMinutes(): 0;
      // Here the precision will always be less than the maximum
      // due to the condition in the if statement: "precision < thisPrecision"
      d = new Date(year, month, day, hour, minutes);
    }
    return d;
  }


  /**
   *  Returns the match data from matching timeRE against the time string.
   *  Also sets this.precision.
   */
  _getMatchData() {
    return super._getMatchData(timeRE, 2);
  }

  /**
   *  Returns an array of the pieces of the time string passed into the
   *  constructor, for use in constructing lower precision versions of the
   *  time. The returned array will contain separate elements for the hour,
   *  minutes, seconds, and milliseconds (or as many of those are as present).
   *  The length of the returned array will therefore be an indication of the
   *  precision.  It will not include the timezone.
   */
  _getTimeParts() {
    if (!this.timeParts) {
      this.timeParts = super._getTimeParts(this._getMatchData());
    }
    return this.timeParts;
  }
}

/**
 *  Tests str to see if it is convertible to a Time.
 * @return If str is convertible to a Time, returns an FP_Time;
 *  otherwise returns null.
 */
FP_Time.checkString = function(ctx, str) {
  let d = new FP_Time(ctx, str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A map from FHIRPath time units to the internal DateTime "precision" number.
 */
FP_Time._timeUnitToDatePrecision = {
  "hour": 0,
  "minute": 1,
  "second": 2,
  "millisecond": 3
};

/**
 *  The inverse of _timeUnitToDatePrecision.
 */
FP_Time._datePrecisionToTimeUnit = ["hour", "minute", "second", "millisecond"];


/**
 *  Returns either the given number or a string with the number prefixed by
 *  zeros if the given number is less than the given length.
 * @param num the nubmer to format
 * @param len the number of returned digits.  For now this must either be 2 or
 *  3. (Optional-- default is 2).
 */
function formatNum(num, len) {
  // Could use String.repeat, but that requires convertin num to an string first
  // to get its length.  This might be slightly faster given that we only need 2
  // or three 3 digit return values.
  var rtn = num;
  if (len === 3 && num < 100)
    rtn = '0' + num;
  if (num < 10)
    rtn = '0' + rtn;
  return rtn;
}


/**
 *  Formats the given date object into an ISO8601 datetime string, expressing it
 *  in the local timezone.
 * @date the date to format
 * @precision the precision at which to terminate string string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
FP_DateTime.isoDateTime = function(date, precision) {
  if (precision === undefined)
    precision = 5; // maximum
  // YYYY-MM-DDTHH:mm:ss.sss[+-]HH:mm
  // Note:  Date.toISOString sets the timezone at 'Z', which I did not want.
  // Actually, I wanted to keep the original timezone given in the constructor,
  // but that is difficult due to daylight savings time changes.  (For instance,
  // if you add 6 months, the timezone offset could change).
  var rtn = '' + date.getFullYear();
  if (precision > 0) {
    rtn += '-' + formatNum(date.getMonth() + 1);
    if (precision > 1) {
      rtn += '-' + formatNum(date.getDate());
      if (precision > 2) {
        rtn += 'T' + FP_DateTime.isoTime(date, precision - 3);
      }
    }
  }
  // FHIRPath STU1 does not allow a timezone offset on a dateTime that does not
  // have a time part (except that the grammar allows 'Z', which is
  // inconsistent).
  if (precision > 2) {
    // Note:  getTimezoneoffset returns the offset for the local system at the
    // given date.
    var tzOffset = date.getTimezoneOffset();
    // tzOffset is a number of minutes, and is positive for negative timezones,
    // and negative for positive timezones.
    var tzSign = tzOffset < 0 ? '+' : '-';
    tzOffset = Math.abs(tzOffset);
    var tzMin = tzOffset % 60;
    var tzHour = (tzOffset - tzMin) / 60;
    rtn += tzSign + formatNum(tzHour) + ':' + formatNum(tzMin);
  }
  return rtn;
};


/**
 *  Returns a time string in ISO format at the given precision level.
 * @date the date to format
 * @precision the precision at which to terminate string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  timeRE.
 * @return a string in ISO 8601 format.
 */
FP_DateTime.isoTime = function(date, precision) {
  if (precision === undefined)
    precision = 2; // maximum

  let rtn = '' + formatNum(date.getHours());
  if (precision > 0) {
    rtn += ':' + formatNum(date.getMinutes());
    if (precision > 1) {
      rtn += ':' + formatNum(date.getSeconds() );
      if (date.getMilliseconds())
        rtn += '.' + formatNum(date.getMilliseconds(), 3);
    }
  }
  return rtn;
};


/**
 * A class representing a FHIRPath Date value (e.g. "2025-02-26").
 * Extends FP_DateTime with date-only precision (year, month, day).
 */
class FP_Date extends FP_DateTime {
  /**
   * Constructs an FP_Date, assuming dateStr is valid.  If you don't know
   * whether a string is a valid Date, use FP_Date.checkString instead.
   */
  constructor(ctx, dateStr) {
    super(ctx, dateStr);
  }


  /**
   * Returns the match data from matching dateRE against the date string.
   * Also sets this.precision.
   */
  _getMatchData() {
    return FP_TimeBase.prototype._getMatchData.apply(this, [dateRE, 2]);
  }
}


/**
 * Tests str to see if it is convertible to a Date.
 * @return If str is convertible to a Date, returns an FP_Date;
 *  otherwise returns null.
 */
FP_Date.checkString = function(ctx, str) {
  let d = new FP_Date(ctx, str);
  if (!d._getMatchData())
    d = null;
  return d;
};


/**
 * Returns a date string in ISO format at the given precision level.
 * @date the date to format
 * @precision the precision at which to terminate string.  (This is
 *  optional). If present, it will be an integer into the matching components of
 *  dateTimeRE.
 * @return a string in ISO8601 format.
 */
FP_Date.isoDate = function(date, precision) {
  if (precision === undefined || precision > 2)
    precision = 2;
  return FP_DateTime.isoDateTime(date, precision);
};

/**
 * A class representing a FHIR Instant value — a DateTime with at least
 * second-level precision and a mandatory timezone offset.
 */
class FP_Instant extends FP_DateTime {
  /**
   * Constructs an FP_Instant, assuming instantStr is valid.  If you don't know
   * whether a string is a valid "instant", use FP_Instant.checkString instead.
   */
  constructor(ctx, instantStr) {
    super(ctx, instantStr);
  }


  /**
   * Returns the match data from matching instantRE against the "instant" string.
   * Also sets this.precision.
   */
  _getMatchData() {
    return FP_TimeBase.prototype._getMatchData.apply(this, [instantRE, 5]);
  }
}


/**
 * Tests str to see if it is convertible to an "instant".
 * @return If str match the "instant" RegExp, returns an FP_Instant;
 *  otherwise returns null.
 */
FP_Instant.checkString = function(ctx, str) {
  let d = new FP_Instant(ctx, str);
  if (!d._getMatchData())
    d = null;
  return d;
};

/**
 *  A class that represents a node in a FHIR resource, with path and possibly type
 *  information.
 */
class ResourceNode {
  /**
   *  Constructs a instance for the given node ("data") of a resource.  If the
   *  data is the top-level node of a resouce, the path and type parameters will
   *  be ignored in favor of the resource's resourceType field.
   * @param {Object} ctx - the FHIRPath evaluation context.
   * @param {*} data - the node's data or value (which might be an object with
   *  sub-nodes, an array, or FHIR data type)
   * @param {ResourceNode} parentResNode - parent ResourceNode.
   * @param {string} path - the node's path in the resource (e.g. Patient.name).
   *  If the data's type can be determined from data, that will take precedence
   *  over this parameter.
   * @param {*} _data - additional data stored in a property named with "_"
   *  prepended, see https://www.hl7.org/fhir/element.html#json for details.
   * @param {string} fhirNodeDataType - FHIR node data type, if the resource node
   *  is described in the FHIR model.
   *  @param {string} propName – the property name of the node within its parent
   *   resource, if applicable. Used to identify the specific property this node
   *   represents.
   *  @param {number} index - the index of the node within an array property,
   *   if the node is part of an array. Used to track the position of the node
   *   among siblings.
   */
  constructor(ctx, data, parentResNode, path, _data, fhirNodeDataType, propName = null, index = null) {
    // If data is a resource (maybe a contained resource) reset the path
    // information to the resource type.
    if (data?.resourceType) {
      path = data.resourceType;
      fhirNodeDataType = data.resourceType;
    }
    this.ctx = ctx;
    this.parentResNode = parentResNode || null;
    this.path = path || null;

    if (fhirNodeDataType === 'integer64') {
      this.data = BigInt(data);
    } else if (typeof data === 'number') {
      this.data = ctx.getDecimal(data);
    } else {
      this.data = data;
    }

    this._data = _data || {};
    this.fhirNodeDataType = fhirNodeDataType || null;
    this.model = ctx.model || null;
    this.propName = propName;
    this.index = index;
  }

  /**
   * Returns resource node type info.
   * @return {TypeInfo}
   */
  getTypeInfo() {
    if (!this.typeInfo) {
      let typeInfo;

      if (this.fhirNodeDataType) {
        const match = /^System\.(.*)$/.exec(this.fhirNodeDataType);
        if (match) {
          typeInfo = new TypeInfo({namespace: TypeInfo.System, name: match[1]});
        } else {
          typeInfo = new TypeInfo({
            namespace: TypeInfo.FHIR,
            name: this.fhirNodeDataType,
            // refType is a list of possible resource types that this reference may refer to.
            refType: this.parentResNode && this.model?.path2RefType[this.parentResNode.path + '.' + this.propName] || null
          });
        }
      }

      this.typeInfo = typeInfo
        // Resource object properties that are not defined in the model now have
        // System.* data types:
        || TypeInfo.createByValueInSystemNamespace(this.data);
    }
    return this.typeInfo;
  }


  /**
   * Returns the JSON representation of this node's data.
   * @returns {*} the JSON-serializable data value.
   */
  toJSON() {
    return toJSON(this.data);
  }


  /**
   * Get the resource that contains this node.
   * The node may be in contained resources.
   *
   * @returns {ResourceNode}
   */
  getParentResource() {
    let node = this;
    do {
      node = node.parentResNode;
    } while(node && !node.data?.resourceType);
    return node;
  }

  /**
   * Converts a resource node value to an instance of the FHIRPath system type
   * (FP_Quantity, FP_Date, FP_DateTime, or FP_Time) for use in evaluating
   * a FHIRPath expression if the node path matches the specified type in the
   * model and when conversion is possible, otherwise returns the data as is.
   * Throws an exception if the data is a Quantity that has a comparator.
   * The Mapping from FHIR Quantity to FHIRPath System.Quantity is explained here:
   * https://www.hl7.org/fhir/fhirpath.html#quantity
   * this.data is not changed, but converted value is returned.
   * @return {FP_Type|any}
   */
  convertData() {
    if (!this.convertedData) {
      var data = this.data;
      if (data != null) {
        const cls = TypeInfo.typeToClassWithCheckString[this.path];
        if (cls) {
          data = cls.checkString(this.ctx, data) || data;
        } else if (TypeInfo.isType(this.path, 'Quantity', this.model)) {
          if (data?.system === ucumSystemUrl) {
            if ((typeof data.value === 'number' || data.value instanceof FP_Decimal) && typeof data.code === 'string') {
              if (data.comparator !== undefined)
                throw new Error('Cannot convert a FHIR.Quantity that has a comparator');
              data = new FP_Quantity(
                this.ctx,
                data.value,
                FP_Quantity.mapUCUMCodeToTimeUnits[data.code] || '\'' + data.code + '\''
              );
            }
          }
        }
      }

      this.convertedData = data;
    }
    return this.convertedData;
  }

  /**
   * The full property name of the node in the resource
   * (e.g. Patient.name[0].given[0])
   *
   * @return {string} - returns the full property name of the node in
   *  the resource.
   */
  fullPropertyName() {
    let propName = this.propName;

    // Check if this is a choice type
    if (this.parentResNode && this.model && this.fhirNodeDataType &&
      propName.endsWith(this.fhirNodeDataType.charAt(0).toUpperCase() +
        this.fhirNodeDataType.substring(1)) &&
      this.model.choiceTypePaths[this.parentResNode?.path + '.' +
        propName.substring(0, propName.length - this.fhirNodeDataType.length)]
    ) {
      propName = propName.substring(0, propName.length - this.fhirNodeDataType.length);
    }

    let result = (this.parentResNode ?
      this.parentResNode.fullPropertyName() + '.' + propName
      : propName) || this.path;
    if (this.index != null) {
      result += '[' + this.index + ']';
    }
    return result;
  }
}


/**
 *  Returns a ResourceNode for the given data node, checking first to see if the
 *  given node is already a ResourceNode.  Takes the same arguments as the
 *  constructor for ResourceNode.
 */
ResourceNode.makeResNode = function(ctx, data, parentResNode, path, _data, fhirNodeDataType, propName, index) {
  return (data instanceof ResourceNode) ? data
    : new ResourceNode(ctx, data, parentResNode, path, _data, fhirNodeDataType,
      propName, index);
};


// The set of available data types in the System namespace
const availableSystemTypes = new Set();
// IE11 probably doesn't support `new Set(iterable)`
['Boolean', 'String', 'Integer', 'Long', 'Decimal', 'Date', 'DateTime', 'Time', 'Quantity'].forEach(i => availableSystemTypes.add(i));

/**
 * Object class defining type information.
 * Used for minimal type support.
 * (see http://hl7.org/fhirpath/#types-and-reflection)
 */
class TypeInfo {
  constructor({name, namespace, refType = null}) {
    this.name = name;
    this.namespace = namespace;
    if (refType) {
      this.refType = refType;
    }
  }

  // The "model" data object specific to a domain, e.g. R4.
  static model = null;

  /**
   * Checks for equality with another TypeInfo object, or that another TypeInfo
   * object specifies a superclass for the type specified by this object.
   * @param {TypeInfo} other - the TypeInfo object to compare with.
   * @param {Object} model - the model object specific to a domain, e.g. R4.
   * @return {boolean}
   */
  is(other, model) {
    if (
      other instanceof TypeInfo &&
      (!this.namespace || !other.namespace || this.namespace === other.namespace)
    ) {
      return model && (!this.namespace || this.namespace === TypeInfo.FHIR)
        ? TypeInfo.isType(this.name, other.name, model)
        : this.name === other.name;
    }
    return false;
  }


  /**
   * Determines whether the current type can be automatically converted to
   * another type or whether another type specifies the same type or
   * a superclass for the current type.
   * See automatic conversion: https://hl7.org/fhir/fhirpath.html#types
   *
   * @param {TypeInfo} other - The `TypeInfo` object to compare with.
   * @param {Object} model - The model object specific to a domain (e.g., R4).
   * @returns {boolean} - Returns `true` if the current type can be automatically
   *  converted to the other type or if the other type specifies a superclass for
   *  the current type; otherwise, returns `false`.
   */
  isConvertibleTo(other, model) {
    if (other instanceof TypeInfo) {
      // Check automatic conversion
      if ( (!this.namespace || this.namespace === TypeInfo.FHIR) &&
        (!other.namespace || other.namespace === TypeInfo.System) &&
        fhir2SystemAutomaticConversion[this.name] === other.name ) {
        return true;
      }

      // The similar as in "is()" above
      if ( !this.namespace || !other.namespace ||
        this.namespace === other.namespace ) {
        return model && (!this.namespace || this.namespace === TypeInfo.FHIR)
          ? TypeInfo.isType(this.name, other.name, model)
          : this.name === other.name;
      }
    }
    return false;
  }


  /**
   * Returns the string representation of type info.
   * @returns {string}
   */
  toString() {
    return (this.namespace ? this.namespace + '.' : '') + this.name;
  }

  /**
   * Returns true if type info represents a valid type identifier, false otherwise.
   * @param {Object} model - the model object specific to a domain, e.g. R4.
   * @returns {boolean}
   */
  isValid(model) {
    let result = false;
    if (this.namespace === 'System') {
      result = availableSystemTypes.has(this.name);
    } else if (this.namespace === 'FHIR') {
      result = model.availableTypes.has(this.name);
    } else if (!this.namespace) {
      result = availableSystemTypes.has(this.name)
        || model.availableTypes.has(this.name);
    }
    return result;
  }
}

/**
 * Defines a map from a datatype to a datatype class which has a checkString method.
 * @type {Object.<string, FP_DateTime | FP_Time>}
 */
TypeInfo.typeToClassWithCheckString = {
  date: FP_Date,
  dateTime: FP_DateTime,
  instant: FP_Instant,
  time: FP_Time
};

/**
 * Checks if the type name or its parent type name is equal to
 * the expected type name.
 * @param type - type name to check.
 * @param superType - expected type name.
 * @param model - the model object specific to a domain, e.g. R4.
 * @return {boolean}
 */
TypeInfo.isType = function(type, superType, model) {
  do {
    if (type === superType) {
      return true;
    }
  } while ((type = model?.type2Parent[type]));
  return false;
};

// Available namespaces:
TypeInfo.System = 'System';
TypeInfo.FHIR = 'FHIR';

TypeInfo.FhirValueSet = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'ValueSet'});
TypeInfo.FhirUri = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'uri'});
TypeInfo.SystemString = new TypeInfo({
  namespace: TypeInfo.System, name: 'String'});
TypeInfo.FhirString = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'string'});
TypeInfo.FhirCodeSystem = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'CodeSystem'});
TypeInfo.FhirCodeableConcept = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'CodeableConcept'});
TypeInfo.FhirCoding = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'Coding'});
TypeInfo.FhirCode = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'code'});
TypeInfo.FhirConceptMap = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'ConceptMap'});
TypeInfo.FhirReference = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'Reference'});
TypeInfo.FhirCanonical = new TypeInfo({
  namespace: TypeInfo.FHIR, name: 'canonical'});

/**
 * Creates new TypeInfo object for specified value in the System namespace.
 * @param {*} value
 * @return {TypeInfo}
 */
TypeInfo.createByValueInSystemNamespace = function(value) {
  let name = typeof value;

  if (name === 'bigint') {
    name = 'long';
  } else if (Number.isInteger(value)) {
    name = 'integer';
  } else if (name === "number") {
    name = 'decimal';
  } else if (value instanceof FP_Decimal) {
    name = value.isInteger() ? 'integer' : 'decimal';
  } else if (value instanceof FP_Date) {
    name = 'date';
  } else if (value instanceof FP_DateTime) {
    name = 'dateTime';
  } else if (value instanceof FP_Time) {
    name = 'time';
  } else if (value instanceof FP_Quantity) {
    name = 'Quantity';
  }

  name = name.replace(/^\w/, c => c.toUpperCase());

  // Currently can return name = "Object" which is probably wrong,
  // but the isValid method allows you to check this.
  return new TypeInfo({namespace: TypeInfo.System, name}) ;
};

/**
 * Retrieves TypeInfo by value
 * @param {*} value
 * @return {TypeInfo}
 */
TypeInfo.fromValue = function (value) {
  return value instanceof ResourceNode
    ? value.getTypeInfo()
    : TypeInfo.createByValueInSystemNamespace(value);
};

/**
 * Set of primitive data type names.
 */
const primitives = new Set();
// IE11 probably doesn't support `new Set(iterable)`
[
  "instant",
  "time",
  "date",
  "dateTime",
  "base64Binary",
  "decimal",
  "integer64",
  "boolean",
  "string",
  "code",
  "markdown",
  "id",
  "integer",
  "unsignedInt",
  "positiveInt",
  "uri",
  "oid",
  "uuid",
  "canonical",
  "url",
  // The following primitive type names are for reference only and are not
  // currently used in code. Instead, in the TypeInfo.isPrimitiveValue function
  // we use a simplified check.
  "Integer",
  "Long",
  "Decimal",
  "String",
  "Date",
  "DateTime",
  "Time"
].forEach(i => primitives.add(i));


// Defines automatic conversion of FHIR types to FHIRPath(System) types.
// See https://hl7.org/fhir/fhirpath.html#types.
const fhir2SystemAutomaticConversion = [
  {from: ['boolean'], to: 'Boolean'},
  {from: ['string', 'uri', 'code', 'oid', 'id', 'uuid', 'markdown', 'base64Binary'], to: 'String'},
  {from: ['integer', 'unsignedInt', 'positiveInt'], to: 'Integer'},
  {from: ['integer64'], to: 'Long'},
  {from: ['decimal'], to: 'Decimal'},
  {from: ['date', 'dateTime', 'instant'], to: 'DateTime'},
  {from: ['time'], to: 'Time'},
  {from: ['Quantity'], to: 'Quantity'}
].reduce((acc, item) => {
  const {from, to} = item;
  from.forEach(f => {
    acc[f] = to;
  });
  return acc;
}, {});


/**
 * Checks whether the specified type information contains a primitive data type.
 * @param {TypeInfo} typeInfo
 * @return {boolean}
 */
TypeInfo.isPrimitive = function(typeInfo) {
  return primitives.has(typeInfo.name);
};


/**
 * Checks whether the specified value is of a primitive data type.
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is a primitive data type,
 *  otherwise false.
 */
TypeInfo.isPrimitiveValue = function(value) {
  if (value instanceof ResourceNode) {
    return primitives.has(value.getTypeInfo().name);
  } else {
    // Simplified check for primitive data types:
    return typeof value !== 'object' || value instanceof FP_Type
      // Here Quantity is called a "primitive" type:
      // https://hl7.org/fhir/fhirpath.html#types
      // But here it is not a "primitive" type:
      // https://hl7.org/fhir/R5/datatypes.html#2.1.28.0
      // I consider it a non-primitive type.
      // If we decide to consider it primitive, then we will need to make
      // changes to the set of primitives (see the "primitives" constant above).
      && !(value instanceof FP_Quantity);
  }
};

/**
 * Basic "type()" function implementation
 * (see http://hl7.org/fhirpath/#reflection)
 * @param {Array<*>} coll - input collection
 * @return {Array<*>}
 */
function typeFn(coll) {
  return coll.map(value => {
    return TypeInfo.fromValue(value);
  });
}

/**
 * Implementation of function "is(type : type specifier)" and operator "is"
 * (see http://hl7.org/fhirpath/#is-type-specifier)
 * @param {Array<*>} coll - input collection
 * @param {TypeInfo} typeInfo
 * @return {boolean|[]}
 */
function isFn(coll, typeInfo) {
  if(coll.length === 0) {
    return [];
  }

  if(coll.length > 1) {
    throw new Error("Expected singleton on left side of 'is', got " + toJSON(coll));
  }

  const ctx = this;

  return TypeInfo.fromValue(coll[0]).is(typeInfo, ctx.model);
}

/**
 * Implementation of function "as(type : type specifier)" and operator "as"
 * (see http://hl7.org/fhirpath/#as-type-specifier)
 * @param {Array<*>} coll - input collection
 * @param {TypeInfo} typeInfo
 * @return {Array<*>}
 */
function asFn(coll, typeInfo) {
  if(coll.length === 0) {
    return [];
  }

  if(coll.length > 1) {
    throw new Error("Expected singleton on left side of 'as', got " + toJSON(coll));
  }

  const ctx = this;
  return TypeInfo.fromValue(coll[0]).is(typeInfo, ctx.model) ? coll : [];
}

/**
 * Converts a value to a JSON string, handling BigInt values.
 * This function is useful for serializing objects that may contain BigInt values,
 * which are not natively supported by JSON.stringify.
 *
 * @param {*} obj - The object to be converted to a JSON string.
 * @param {string|number} [space] - Adds indentation, white space, and line break
 *  characters to the return-value JSON text to make it easier to read.
 * @returns {string} - The JSON string representation of the object.
 */
function toJSON(obj, space = undefined) {
  return JSON.stringify(obj, (_, i) => typeof i === 'bigint' ? i.toString(): i, space);
}


/**
 * Reference to the native Object.prototype.hasOwnProperty method, bound to
 * Function.prototype.call. This can be used to safely check if an object has
 * a property as its own (not inherited), avoiding issues if the object has
 * a custom hasOwnProperty property.
 *
 * Example usage:
 * // Cannot use util.hasOwnProperty directly because it triggers the error:
 * // "Do not access Object.prototype method 'hasOwnProperty' from target object"
 * const { hasOwnProperty } = require("./utilities");
 * ...
 * hasOwnProperty(obj, 'propertyName')
 *
 * @type {Function}
 */
const hasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty);


/**
 * Abstract base class for FHIRPath decimal numbers.
 * Provides a common interface for both native and precise decimal implementations.
 */
class FP_Decimal extends FP_Type {

  /**
   * @abstract
   * @property value The numeric value of the decimal.
   * @type {number|Decimal}
   */

  /**
   * @abstract
   * @property decimalPlaces number of digits after the decimal point.
   * @type {number|Decimal}
   */

  /**
   * @abstract
   * @property decimalPrecision number of digits after the decimal point
   *  excluding trailing zeroes.
   * @type {number|Decimal}
   */


  /**
   * Creates an FP_Decimal_Precise instance from the given value.
   * This is the default factory method; subclasses override it to return
   * their own type.
   * @param {number|string|FP_Decimal} value - the value to convert.
   * @returns {FP_Decimal}
   */
  static getDecimal(value) {
    return new FP_Decimal_Precise(value);
  }


  /**
   * The maximum number of decimal places allowed in FHIRPath.
   * @type {number}
   */
  static MAX_PRECISION = 8;

  /**
   *  The smallest representable number in FHIRPath.
   *  @type {number}
   */
  static MIN_DECIMAL = 1e-8;

  /**
   * The largest representable number in FHIRPath.
   * @type {number}
   */
  static MAX_DECIMAL = Math.pow(10,20);

  /**
   * Divides this decimal by another decimal and returns the integer part of the
   * result.
   */
  divToInt(/*other*/) {
    throw new Error('divToInt() is not implemented for ' + this.constructor.name);
  }

  /**
   * Returns the remainder of dividing this decimal by another decimal.
   */
  mod(/*other*/) {
    throw new Error('mod() is not implemented for ' + this.constructor.name);
  }

  /**
   * Returns the natural exponent of this decimal.
   * @returns {FP_Decimal}
   */
  exp() {
    throw new Error('exp() is not implemented for ' + this.constructor.name);
  }


  /**
   * Returns the natural logarithm of this decimal.
   * @returns {FP_Decimal}
   */
  ln() {
    throw new Error('ln() is not implemented for ' + this.constructor.name);
  }


  /**
   * Returns the logarithm of this decimal in the given base.
   */
  log(/*base*/) {
    throw new Error('log() is not implemented for ' + this.constructor.name);
  }


  /**
   * Raises this decimal to the given power.
   */
  power(/*exponent*/) {
    throw new Error('power() is not implemented for ' + this.constructor.name);
  }


  /**
   * Returns the square root of this decimal.
   * @returns {FP_Decimal}
   */
  sqrt() {
    throw new Error('sqrt() is not implemented for ' + this.constructor.name);
  }


  /**
   * Checks whether this decimal value represents an integer (i.e., has no
   * fractional part).
   * @returns {boolean} true if the value is an integer, false otherwise.
   */
  isInteger() {
    return this.decimalPlaces === 0;
  }


  /**
   * Returns the JSON representation.
   * @returns {number}
   */
  toJSON() {
    return this.toNumber();
  }


  /**
   * Parses a numeric string to determine the number of decimal places and
   * the decimal precision (excluding trailing zeroes). Sets `this.decimalPlaces`
   * and `this.decimalPrecision`.
   * @param {string} str - a numeric string (e.g. "3.140", "1e-5").
   */
  decimalPlacesFromString(str) {
    const match = /^([+-]?\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(str);
    if (!match) {
      return 0;
    }
    const fraction = match[2];
    const trailingZeroes = fraction ? /0*$/.exec(fraction)[0].length : 0;
    const exponent = match[3];
    this.decimalPlaces = Math.max(
      0,
      (fraction === '0' ? (exponent ? 0 : 1) : (fraction || '').length) - (exponent || 0)
    );
    this.decimalPrecision = this.decimalPlaces - trailingZeroes;
  }

}

/**
 * Native implementation using JavaScript's built-in Number type.
 * Uses the existing roundToMaxPrecision for equality/comparison.
 */
class FP_Decimal_Native extends FP_Decimal {
  /**
   * Constructs an FP_Decimal_Native from the given value.
   * @param {FP_Decimal|number|bigint|string} value - the value to convert.
   */
  constructor(value) {
    super();
    if (value instanceof FP_Decimal) {
      this.value = value.toNumber();
      this.asStr = value.asStr;
      this.decimalPlaces = value.decimalPlaces;
      this.decimalPrecision = value.decimalPrecision;
    } else {
      const typeOfValue = typeof value;
      if (typeOfValue === 'number' || typeOfValue === 'bigint') {
        this.value = Number(value);
        this.asStr = this.value.toString();
        this.decimalPlacesFromString(this.asStr);
      } else if (typeOfValue === 'string' &&
        /^\s*[+-]?([0-9]+)(\.[0-9]+)?([eE][+-]?[0-9]+)?\s*$/.test(value)) {
        this.value = parseFloat(value);
        if (isNaN(this.value)) {
          throw new Error(`Invalid decimal value: ${value}`);
        }
        this.asStr = value;
        this.decimalPlacesFromString(value);
      } else {
        throw new Error(`Cannot convert ${typeOfValue} to decimal`);
      }
    }
    // TODO: consider adding checks for underflow and overflow here
    //   See
    //   https://hl7.org/fhirpath/#decimal
    //   https://hl7.org/fhirpath/#math-2
    // if (this.value !== 0) {
    //   if (Math.abs(this.value) < FP_Decimal.MIN_DECIMAL) {
    //     // Operations that cause arithmetic underflow will result in empty ({ }).
    //     return [];
    //   } else if (Math.abs(this.value) > FP_Decimal.MAX_DECIMAL) {
    //     // Operations that cause arithmetic overflow will result in empty ({ }).
    //     return [];
    //   }
    // }
  }


  /**
   * Creates an FP_Decimal_Native instance from the given value.
   * @param {number|string|FP_Decimal} value - the value to convert.
   * @returns {FP_Decimal_Native}
   */
  static getDecimal(value) {
    return new FP_Decimal_Native(value);
  }


  /**
   * Adds another decimal to this decimal.
   * @param {FP_Decimal|FP_Quantity|BigInt|number} other
   * @returns {FP_Decimal|FP_Quantity|BigInt}
   */
  plus(other) {
    if (other instanceof FP_Quantity) {
      return other.plus(this);
    } else if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() + other;
    }

    const otherVal = this._toNumber(other);
    return new FP_Decimal_Native(this.value + otherVal);
  }


  /**
   * Subtracts another value from this decimal.
   * @param {FP_Decimal|FP_Quantity|BigInt|number} other
   * @returns {FP_Decimal|FP_Quantity|BigInt}
   */
  minus(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").minus(other);
    } if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() - other;
    }

    const otherVal = this._toNumber(other);
    return new FP_Decimal_Native(this.value - otherVal);
  }


  /**
   * Multiplies this decimal by another decimal.
   * @param {FP_Decimal|FP_Quantity|BigInt|number} other
   * @returns {FP_Decimal|FP_Quantity|BigInt}
   */
  mul(other) {
    if (other instanceof FP_Quantity) {
      return other.mul(this);
    } if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() * other;
    }

    const otherVal = this._toNumber(other);
    return new FP_Decimal_Native(this.value * otherVal);
  }


  /**
   * Divides this decimal by another decimal.
   * @param {FP_Decimal|FP_Quantity|BigInt|number} other
   * @returns {FP_Decimal|FP_Quantity}
   */
  div(other) {
    if (other instanceof FP_Quantity) {
      return (new FP_Quantity(other.ctx, this.value, "'1'")).div(other);
    }

    const otherVal = this._toNumber(other);
    if (otherVal === 0) {
      // Division by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Native(this.value / otherVal);
  }


  /**
   * Returns the integer part of dividing this decimal by another.
   * @param {FP_Decimal|number} other
   * @returns {FP_Decimal_Native|null} null if division by zero.
   */
  divToInt(other) {
    const otherVal = this._toNumber(other);
    if (otherVal === 0) {
      // Division by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Native(Math.trunc(this.value / otherVal));
  }


  /**
   * Returns the remainder of dividing this decimal by another.
   * @param {FP_Decimal|Decimal|number} other
   * @returns {FP_Decimal}
   */
  mod(other) {
    const otherVal = this._toNumber(other);
    if (otherVal === 0) {
      // Modulo by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Native(this.value % otherVal);
  }


  /**
   * Returns e raised to the power of this decimal.
   * @returns {FP_Decimal_Native}
   */
  exp() {
    return new FP_Decimal_Native(Math.exp(this.value));
  }


  /**
   * Returns the natural logarithm of this decimal.
   * @returns {FP_Decimal_Native}
   */
  ln() {
    return new FP_Decimal_Native(Math.log(this.value));
  }


  /**
   * Returns the logarithm of this decimal in the given base.
   * @param {FP_Decimal|number} base
   * @returns {FP_Decimal_Native}
   */
  log(base) {
    const baseVal = this._toNumber(base);
    return new FP_Decimal_Native(Math.log(this.value) / Math.log(baseVal));
  }


  /**
   * Raises this decimal to the given power.
   * @param {FP_Decimal|number} exponent
   * @returns {FP_Decimal_Native|null} null if the result is NaN.
   */
  power(exponent) {
    const exponentVal = this._toNumber(exponent);
    const res = Math.pow(this.value, exponentVal);
    return isNaN(res) ? null : new FP_Decimal_Native(res);
  }


  /**
   * Returns the square root of this decimal.
   * @returns {FP_Decimal_Native|null} null if the value is negative.
   */
  sqrt() {
    if (this.value < 0) {
      return null;
    }
    return new FP_Decimal_Native(Math.sqrt(this.value));
  }


  /**
   * Returns the negation of this decimal.
   * @returns {FP_Decimal_Native}
   */
  negate() {
    return new FP_Decimal_Native(-this.value);
  }


  /**
   * Returns the absolute value of this decimal.
   * @returns {FP_Decimal_Native}
   */
  abs() {
    return new FP_Decimal_Native(Math.abs(this.value));
  }


  /**
   * Returns the ceiling of this decimal.
   * @returns {FP_Decimal_Native}
   */
  ceiling() {
    return new FP_Decimal_Native(Math.ceil(this.value));
  }


  /**
   * Returns the floor of this decimal.
   * @returns {FP_Decimal_Native}
   */
  floor() {
    return new FP_Decimal_Native(Math.floor(this.value));
  }


  /**
   * Rounds this decimal to the specified precision.
   * @param {number} [precision] - number of decimal places.
   * @returns {FP_Decimal_Native}
   */
  round(precision) {
    if (precision === undefined) {
      return new FP_Decimal_Native(Math.round(this.value));
    }
    const scale = Math.pow(10, precision);
    return new FP_Decimal_Native(Math.round(this.value * scale) / scale);
  }


  /**
   * Truncates this decimal to an integer.
   * @returns {FP_Decimal_Native}
   */
  truncate() {
    return new FP_Decimal_Native(Math.trunc(this.value));
  }


  /**
   * Compares this decimal with another value.
   * @param {FP_Decimal|FP_Quantity|number} other
   * @returns {number|null} -1, 0, or 1, or null if comparison fails.
   */
  compare(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").compare(other);
    }

    try {
      const otherVal = this._toNumber(other);
      const thisRounded = numbers.roundToMaxPrecision(this.value);
      const otherRounded = numbers.roundToMaxPrecision(otherVal);
      return thisRounded < otherRounded ? -1 : (thisRounded > otherRounded ? 1 : 0);
    } catch {
      return null;
    }
  }


  /**
   * Checks equality with another value.
   * @param {FP_Decimal|FP_Quantity|number} other
   * @returns {boolean}
   */
  equals(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").equals(other);
    }
    const otherVal = this._toNumber(other);
    return numbers.isEqual(this.value, otherVal);
  }


  /**
   * Determines numeric equivalence with another value.
   * Compares values rounded to the lesser of the two decimal precisions.
   * @param {FP_Decimal|number} other
   * @returns {boolean}
   */
  equivalentTo(other) {
    const otherDecimal = FP_Decimal_Native.getDecimal(other);
    const otherVal = otherDecimal.value;
    const thisVal = this.value;

    if (Number.isInteger(thisVal) && Number.isInteger(otherVal)) {
      return thisVal === otherVal;
    }

    const precision = Math.min(this.decimalPrecision, otherDecimal.decimalPrecision);

    if (precision === 0) {
      return Math.round(thisVal) === Math.round(otherVal);
    }

    const scale = Math.pow(10, precision);
    return Math.round(thisVal * scale) / scale ===
      Math.round(otherVal * scale) / scale;
  }


  /**
   * Returns the value as a JavaScript number.
   * @returns {number}
   */
  toNumber() {
    return this.value;
  }


  /**
   * Returns a BigInt representation of this decimal.
   * @returns {BigInt}
   * @throws {Error} if this decimal is not an integer or is out of BigInt range.
   */
  toBigInt() {
    return BigInt(this.value);
  }


  /**
   * Returns the string representation of this decimal.
   * @returns {string}
   */
  toString() {
    return this.asStr;
  }


  /**
   * Converts another value to a JavaScript number for arithmetic.
   * @param {FP_Decimal|number|string} other
   * @returns {number}
   * @throws {Error} if the value cannot be converted.
   * @private
   */
  _toNumber(other) {
    if (other instanceof FP_Decimal) {
      return other.toNumber();
    } else {
      const typeOfOther = typeof other;
      if (typeOfOther === 'bigint') {
        return Number(other);
      } else if (typeOfOther === 'number') {
        return other;
      } else if (typeOfOther === 'string' &&
        /^\s*[+-]?([0-9]+)(\.[0-9]+)?([eE][+-]?[0-9]+)?\s*$/.test(other)) {
        const val = parseFloat(other);
        if (isNaN(val)) {
          throw new Error(`Invalid decimal value: ${other}`);
        }
        return val;
      }
    }
    throw new Error(`Cannot convert ${other} to a number`);
  }

}


/**
 * Precise implementation using decimal.js library.
 * Preserves exact decimal precision for all operations.
 */
class FP_Decimal_Precise extends FP_Decimal {
  /**
   * Constructs an FP_Decimal_Precise from the given value.
   * @param {FP_Decimal|Decimal|number|bigint|string} value - the value to convert.
   */
  constructor(value) {
    super();
    if (value instanceof FP_Decimal_Precise) {
      this.value = value.value;
      this.asStr = value.asStr;
      this.decimalPlaces = value.decimalPlaces;
      this.decimalPrecision = value.decimalPrecision;
    } else if (value instanceof Decimal) {
      this.value = value;
      this.asStr = value.toString();
      this.decimalPlaces = value.decimalPlaces();
      this.decimalPrecision = this.decimalPlaces;
    } else if (value instanceof FP_Decimal_Native) {
      this.value = new Decimal(value.value);
      this.asStr = value.asStr;
      this.decimalPlaces = value.decimalPlaces;
    } else {
      const typeOfValue = typeof value;
      if (typeOfValue === 'number' || typeOfValue === 'bigint') {
        this.value = new Decimal(value);
        this.asStr = this.value.toString();
        this.decimalPlaces = this.value.decimalPlaces();
        this.decimalPrecision = this.decimalPlaces;
      } else if (typeOfValue === 'string') {
        try {
          this.value = new Decimal(value);
        } catch {
          throw new Error(`Invalid decimal value: ${value}`);
        }
        this.asStr = value;
        this.decimalPlacesFromString(value);
      } else {
        throw new Error(`Cannot convert ${typeOfValue} to a decimal`);
      }
    }
    // TODO: consider adding checks for underflow and overflow here
    //   See
    //   https://hl7.org/fhirpath/#decimal
    //   https://hl7.org/fhirpath/#math-2
    // if (!this.value.equals(0)) {
    //   if (this.value.abs().comparedTo(FP_Decimal.MIN_DECIMAL) === -1) {
    //     // Operations that cause arithmetic underflow will result in empty ({ }).
    //     return [];
    //   } else if (this.value.abs().comparedTo(FP_Decimal.MAX_DECIMAL) === 1) {
    //     // Operations that cause arithmetic overflow will result in empty ({ }).
    //     return [];
    //   }
    // }
  }


  /**
   * Creates an FP_Decimal_Precise instance from the given value.
   * @param {number|string|FP_Decimal} value - the value to convert.
   * @returns {FP_Decimal_Precise}
   */
  static getDecimal(value) {
    return new FP_Decimal_Precise(value);
  }


  /**
   * Adds another decimal to this decimal.
   * @param {FP_Decimal|Decimal|number|string|FP_Quantity} other
   * @returns {FP_Decimal|FP_Quantity}
   */
  plus(other) {
    if (other instanceof FP_Quantity) {
      return other.plus(this);
    } else if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() + other;
    }

    const otherVal = this._toDecimal(other);
    return new FP_Decimal_Precise(this.value.plus(otherVal));
  }


  /**
   * Subtracts another value from this decimal.
   * @param {FP_Decimal|Decimal|number|string|FP_Quantity} other
   * @returns {FP_Decimal|FP_Quantity|BigInt}
   */
  minus(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").minus(other);
    } if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() - other;
    }

    const otherVal = this._toDecimal(other);
    return new FP_Decimal_Precise(this.value.minus(otherVal));
  }


  /**
   * Multiplies this decimal by another decimal.
   * @param {FP_Decimal|Decimal|BigInt|number} other
   * @returns {FP_Decimal|FP_Quantity|BigInt}
   */
  mul(other) {
    if (other instanceof FP_Quantity) {
      return other.mul(this);
    } if (this.isInteger() && typeof other === 'bigint') {
      return this.toBigInt() * other;
    }

    const otherVal = this._toDecimal(other);
    return new FP_Decimal_Precise(this.value.times(otherVal));
  }


  /**
   * Divides this decimal by another decimal.
   * @param {FP_Decimal|Decimal|number|string} other
   * @returns {FP_Decimal|FP_Quantity}
   */
  div(other) {
    if (other instanceof FP_Quantity) {
      return (new FP_Quantity(other.ctx, this.value, "'1'")).div(other);
    }

    const otherVal = this._toDecimal(other);
    if (otherVal.isZero()) {
      // Division by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Precise(this.value.dividedBy(otherVal));
  }


  /**
   * Divides this decimal by another and returns the integer part of the result.
   * @param {FP_Decimal|BigInt|number} other
   * @returns {FP_Decimal_Precise|null} null if division by zero.
   */
  divToInt(other) {
    const otherVal = this._toDecimal(other);
    if (otherVal.isZero()) {
      // Division by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Precise(this.value.dividedToIntegerBy(otherVal));
  }


  /**
   * Returns the remainder of dividing this decimal by another.
   * @param {FP_Decimal|Decimal|number|string} other
   * @returns {FP_Decimal_Precise|null} null if modulo by zero.
   */
  mod(other) {
    const otherVal = this._toDecimal(other);
    if (otherVal.isZero()) {
      // Modulo by zero always gives an empty result
      return null;
    }
    return new FP_Decimal_Precise(this.value.modulo(otherVal));
  }


  /**
   * Returns e raised to the power of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  exp() {
    return new FP_Decimal_Precise(this.value.exp());
  }


  /**
   * Returns the natural logarithm of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  ln() {
    return new FP_Decimal_Precise(this.value.ln());
  }


  /**
   * Returns the logarithm of this decimal in the given base.
   * @param {FP_Decimal|Decimal|number|string} base
   * @returns {FP_Decimal_Precise}
   */
  log(base) {
    return new FP_Decimal_Precise(this.value.log(
      base instanceof FP_Decimal ? base.value : base));
  }


  /**
   * Raises this decimal to the given power.
   * @param {FP_Decimal|Decimal|number|string} exponent
   * @returns {FP_Decimal_Precise|null} null if the result is NaN.
   */
  power(exponent) {
    const res = this.value.pow(
      exponent instanceof FP_Decimal ? exponent.value : exponent);
    return res.isNaN() ? null : new FP_Decimal_Precise(res);
  }


  /**
   * Returns the square root of this decimal.
   * @returns {FP_Decimal_Precise|null} null if the value is negative.
   */
  sqrt() {
    if (this.value.comparedTo(0) === -1) {
      return null;
    }

    return new FP_Decimal_Precise(this.value.sqrt());
  }


  /**
   * Returns the negation of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  negate() {
    return new FP_Decimal_Precise(this.value.negated());
  }


  /**
   * Returns the absolute value of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  abs() {
    return new FP_Decimal_Precise(this.value.abs());
  }


  /**
   * Returns the ceiling of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  ceiling() {
    return new FP_Decimal_Precise(this.value.ceil());
  }


  /**
   * Returns the floor of this decimal.
   * @returns {FP_Decimal_Precise}
   */
  floor() {
    return new FP_Decimal_Precise(this.value.floor());
  }


  /**
   * Rounds this decimal to the specified precision using ROUND_HALF_UP.
   * @param {number} [precision] - number of decimal places.
   * @returns {FP_Decimal_Precise}
   */
  round(precision) {
    if (precision === undefined) {
      return new FP_Decimal_Precise(this.value.toDecimalPlaces(0, Decimal.ROUND_HALF_UP));
    }
    return new FP_Decimal_Precise(this.value.toDecimalPlaces(Number(precision), Decimal.ROUND_HALF_UP));
  }


  /**
   * Truncates this decimal to an integer.
   * @returns {FP_Decimal_Precise}
   */
  truncate() {
    return new FP_Decimal_Precise(this.value.truncated());
  }


  /**
   * Compares this decimal with another value.
   * @param {FP_Decimal|FP_Quantity|Decimal|number} other
   * @returns {number} -1, 0, or 1.
   */
  compare(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").compare(other);
    }
    const otherVal = this._toDecimal(other);

    return this.value.toDecimalPlaces(FP_Decimal.MAX_PRECISION)
      .comparedTo(otherVal.toDecimalPlaces(FP_Decimal.MAX_PRECISION));
  }


  /**
   * Checks equality with another value.
   * @param {FP_Decimal|FP_Quantity|Decimal|number} other
   * @returns {boolean}
   */
  equals(other) {
    if (other instanceof FP_Quantity) {
      return new FP_Quantity(other.ctx, this, "'1'").equals(other);
    }
    const otherVal = this._toDecimal(other);
    return this.value.toDecimalPlaces(FP_Decimal.MAX_PRECISION)
      .equals(otherVal.toDecimalPlaces(FP_Decimal.MAX_PRECISION));
  }


  /**
   * Determines numeric equivalence with another value.
   * Compares values rounded to the lesser of the two decimal precisions.
   * @param {FP_Decimal|Decimal|number} other
   * @returns {boolean}
   */
  equivalentTo(other) {
    const otherVal = this._toDecimal(other);

    if (this.value.isInteger() && otherVal.isInteger()) {
      return this.value.equals(otherVal);
    }

    const prec = Math.min(this.decimalPrecision, otherVal.decimalPlaces());
    const thisRounded = this.value.toDecimalPlaces(prec, Decimal.ROUND_HALF_UP);
    const otherRounded = otherVal.toDecimalPlaces(prec, Decimal.ROUND_HALF_UP);

    return thisRounded.equals(otherRounded);
  }


  /**
   * Checks whether this decimal value represents an integer.
   * @returns {boolean} true if the value is an integer, false otherwise.
   */
  isInteger() {
    return this.decimalPlaces === 0;
  }


  /**
   * Returns the value as a JavaScript number.
   * @returns {number}
   */
  toNumber() {
    return this.value.toNumber();
  }


  /**
   * Returns a BigInt representation of this decimal.
   * @returns {BigInt}
   */
  toBigInt() {
    return BigInt(this.toString());
  }


  /**
   * Returns the string representation of this decimal.
   * @returns {string}
   */
  toString() {
    return this.asStr;
  }


  /**
   * Converts another value to a decimal.js Decimal for arithmetic.
   * @param {FP_Decimal|Decimal|number|string} other
   * @returns {Decimal}
   * @throws {Error} if the value cannot be converted.
   * @private
   */
  _toDecimal(other) {
    if (other instanceof FP_Decimal_Precise) {
      return other.value;
    } else if (other instanceof Decimal) {
      return other;
    } else if (other instanceof FP_Decimal_Native) {
      return new Decimal(other.value);
    } else {
      try {
        return new Decimal(other);
      } catch {
        throw new Error(`Cannot convert ${other} to Decimal`);
      }
    }
  }

}


module.exports = {
  FP_Type,
  FP_TimeBase,
  FP_Date,
  FP_DateTime,
  FP_Instant,
  FP_Time,
  FP_Quantity,
  FP_Decimal,
  FP_Decimal_Native,
  FP_Decimal_Precise,
  timeRE,
  dateTimeRE,
  dateRE,
  instantRE,
  ResourceNode,
  TypeInfo,
  typeFn,
  isFn,
  asFn,
  toJSON,
  hasOwnProperty
};
