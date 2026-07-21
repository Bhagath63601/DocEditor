/**
 * Throttles execution of a function.
 * @param {Function} func The function to throttle.
 * @param {number} wait The throttle timeout in milliseconds.
 * @returns {Function} Throttled version of the function.
 */
function throttle(func, wait) {
  let timeout = null;
  let latestArgs = null;

  return function() {
    latestArgs = arguments;
    if (!timeout) {
      timeout = setTimeout(async () => {
        await func.apply(this, latestArgs);
        timeout = null;
      }, wait);
    }
  };
}

module.exports = throttle;
