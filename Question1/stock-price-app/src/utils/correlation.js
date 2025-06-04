// Calculate mean of an array
export const calculateMean = (arr) => {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Calculate standard deviation of an array
export const calculateStandardDeviation = (arr) => {
  const mean = calculateMean(arr);
  const squareDiffs = arr.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

// Calculate covariance between two arrays
export const calculateCovariance = (arr1, arr2) => {
  const mean1 = calculateMean(arr1);
  const mean2 = calculateMean(arr2);
  
  const sum = arr1.reduce((acc, val, i) => {
    return acc + ((val - mean1) * (arr2[i] - mean2));
  }, 0);
  
  return sum / (arr1.length - 1);
};

// Calculate Pearson's correlation coefficient
export const calculateCorrelation = (arr1, arr2) => {
  const covariance = calculateCovariance(arr1, arr2);
  const stdDev1 = calculateStandardDeviation(arr1);
  const stdDev2 = calculateStandardDeviation(arr2);
  
  return covariance / (stdDev1 * stdDev2);
};

// Calculate correlation matrix for multiple stocks
export const calculateCorrelationMatrix = (stockData) => {
  const stocks = Object.keys(stockData);
  const correlations = [];

  for (let i = 0; i < stocks.length; i++) {
    for (let j = 0; j < stocks.length; j++) {
      const stock1 = stocks[i];
      const stock2 = stocks[j];
      
      const correlation = calculateCorrelation(
        stockData[stock1],
        stockData[stock2]
      );

      correlations.push({
        stock1,
        stock2,
        correlation
      });
    }
  }

  return correlations;
}; 