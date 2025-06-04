const BASE_URL = 'http://20.244.56.144/evaluation-service';

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const fetchStocks = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/stocks`);
    const data = await response.json();
    return data.stocks || {};
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return {};
  }
};

export const fetchStockData = async (ticker, minutes) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      return { prices: [], average: 0 };
    }

    const prices = data.map(item => ({
      time: new Date(item.lastUpdatedAt).toLocaleTimeString(),
      price: parseFloat(item.price)
    })).sort((a, b) => new Date(a.time) - new Date(b.time));

    if (prices.length === 0) {
      return { prices: [], average: 0 };
    }

    const average = prices.reduce((sum, point) => sum + point.price, 0) / prices.length;

    return {
      prices,
      average: parseFloat(average.toFixed(2))
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    return {
      prices: [],
      average: 0
    };
  }
};

export const fetchCorrelationData = async (minutes) => {
  try {
    const stocks = await fetchStocks();
    const stockSymbols = Object.values(stocks);
    const stockData = {};

    for (const symbol of stockSymbols) {
      const data = await fetchStockData(symbol, minutes);
      if (data.prices.length > 0) {
        stockData[symbol] = data.prices.map(point => point.price);
      }
    }

    const correlations = [];
    for (let i = 0; i < stockSymbols.length; i++) {
      for (let j = 0; j < stockSymbols.length; j++) {
        const stock1 = stockSymbols[i];
        const stock2 = stockSymbols[j];
        
        const prices1 = stockData[stock1];
        const prices2 = stockData[stock2];
        
        if (!prices1 || !prices2 || prices1.length === 0 || prices2.length === 0) continue;
        
        const mean1 = prices1.reduce((sum, price) => sum + price, 0) / prices1.length;
        const mean2 = prices2.reduce((sum, price) => sum + price, 0) / prices2.length;
        
        const covariance = prices1.reduce((sum, price, index) => {
          return sum + ((price - mean1) * (prices2[index] - mean2));
        }, 0) / (prices1.length - 1);
        
        const stdDev1 = Math.sqrt(
          prices1.reduce((sum, price) => sum + Math.pow(price - mean1, 2), 0) / (prices1.length - 1)
        );
        const stdDev2 = Math.sqrt(
          prices2.reduce((sum, price) => sum + Math.pow(price - mean2, 2), 0) / (prices2.length - 1)
        );
        
        const correlation = covariance / (stdDev1 * stdDev2);
        
        correlations.push({
          stock1,
          stock2,
          correlation: parseFloat(correlation.toFixed(2))
        });
      }
    }

    return {
      stocks: stockSymbols,
      correlations
    };
  } catch (error) {
    console.error('Error fetching correlation data:', error);
    return {
      stocks: [],
      correlations: []
    };
  }
}; 