// Supported math operations modes
const mathOperations = ['native', 'precise'];


/**
 * Validates a command-line option against a list of valid values.
 * If the option value is invalid, prints an error message showing the
 * option's flags and the invalid value, then exits the process with code 1.
 *
 * @param {Object} options - The Commander.js command object containing option definitions.
 * @param {Array<Object>} options.options - Array of option definition objects, each with
 *   `short` and `flags` properties.
 * @param {string} optionValue - The value of the option to validate.
 * @param {Array<string>} validValues - Array of valid values for the option.
 * @param {string} optionShort - The short flag (e.g., '-m') used to look up the
 *   option's full flags description for the error message.
 */
function validateOption(options, optionValue, validValues, optionShort) {
  if (optionValue && !validValues.includes(optionValue)) {
    const optionDesc = options.options.find(o => o.short === optionShort).flags;
    console.error(
      `error: option '${optionDesc}' is invalid, got '${optionValue}'`);
    process.exit(1);
  }
}


module.exports = {
  mathOperations,
  validateOption
};
