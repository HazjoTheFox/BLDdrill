// --- Helper Function (Equivalent to Python's statistics module) ---

/**
 * Calculates the sample standard deviation of an array of numbers.
 * The formula uses (n-1) in the denominator.
 * @param {number[]} data - An array of numbers.
 * @returns {number} The sample standard deviation. Returns 0 if the array has fewer than 2 elements.
 */
function standardDeviation(data) {
  if (!Array.isArray(data) || data.length < 2) {
    return 0;
  }

  const n = data.length;
  // 1. Calculate the mean
  const mean = data.reduce((sum, value) => sum + value, 0) / n;
  
  // 2. Calculate the variance
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (n - 1);

  // 3. Return the square root of the variance
  return Math.sqrt(variance);
}


// --- Main Logic (Translated from Python) ---

/**
 * Calculates the weight for each command based on its performance.
 * This function mutates the `comms` object by adding a "weight" property.
 * @param {object} comms - The main object containing all command data.
 * @param {object} timedComms - A filtered object containing only commands with time data.
 * @param {number} sessionMean - The average mean time across all timed commands.

 * @param {number} sessionStdDev - The standard deviation of the means across all timed commands.
 */
function weightOfEach(comms, timedComms, sessionMean, sessionStdDev) {
  if (sessionStdDev === 0) {
    // To avoid division by zero, we can either throw an error or handle it gracefully.
    // Here we choose to throw an error, matching the Python script's intent.
    throw new Error("Session standard deviation cannot be zero. This happens when all command means are identical.");
  }

  for (const [commId, commData] of Object.entries(timedComms)) {
    // Calculate normalized deviation (z-score), scaled by drillFactor
    const normalizedDeviation = (commData.mean - sessionMean) / (Math.min(sessionStdDev, 0.3));

    // Exponential weight: weight = 2^normalized_deviation
    // The ** operator works the same in JS as in Python.
    const weight = 2 ** normalizedDeviation;

    comms[commId].weight = weight;
    console.log("Calculated Weight: " + weight);
  }
}

/**
 * The main calculation function.
 * @param {object} comms - The object containing command data.

 * @returns {object} The comms object, updated with mean, deviation, and weight values.
 */
export function calculate(comms) {
  // Filter for items in 'comms' that are objects and have a 'times' array.
  // This is the JS equivalent of the Python dictionary comprehension.
  const timedComms = Object.fromEntries(
    Object.entries(comms).filter(([key, value]) =>
      typeof value === 'object' && value !== null && Array.isArray(value.times) && value.times.length > 0
    )
  );

  const meanList = [];

  // We need at least 2 timed commands to calculate a meaningful session standard deviation.
  if (Object.keys(timedComms).length >= 5) {
    for (const [key, value] of Object.entries(timedComms)) {
      // Calculate mean for the individual command
      const mean = value.times.reduce((sum, current) => sum + current, 0) / value.times.length;
      comms[key].mean = parseFloat(mean.toFixed(2));
      meanList.push(mean);

      // Calculate deviation for the individual command if it has enough data points
      if (value.times.length >= 2) {
        comms[key].deviation = standardDeviation(value.times);
      }
    }

    // Calculate session-wide statistics from the list of individual means
    const sessionMean = meanList.reduce((sum, current) => sum + current, 0) / meanList.length;
    const sessionDeviation = standardDeviation(meanList);

    weightOfEach(comms, timedComms, sessionMean, sessionDeviation);

    return {"comms": comms, "mean": sessionMean, "deviation": sessionDeviation};
  }

  // If there are not enough timed commands, return the original object without calculations.
  return {"comms": comms, "mean": 0, "deviation": 0};
}