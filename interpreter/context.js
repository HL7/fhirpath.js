/**
 *  Provides context in which to evaluate FHIRPath expressions.
 */
class Context {
  /**
   *  Constructor.
   * @param resourceNames a set of known resource names
   */
  constructor(resourceNames) {
    this.resourceNames = resourceNames
  }
}

module.exports = Context;
