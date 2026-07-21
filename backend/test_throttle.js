const throttle = require('./utils/throttle');
const assert = require('assert');

console.log('Running unit tests for throttle...');

let callCount = 0;
const increment = () => {
  callCount++;
};

const throttledIncrement = throttle(increment, 100);

// Invoke throttled function 5 times rapidly
throttledIncrement();
throttledIncrement();
throttledIncrement();
throttledIncrement();
throttledIncrement();

// Verify that it has not executed immediately, or is waiting for execution.
setTimeout(() => {
  try {
    assert.strictEqual(callCount, 1, `Expected call count to be 1, but got ${callCount}`);
    console.log('Test passed: Throttle successfully limited execution count.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}, 150);
