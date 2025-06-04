const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT = 500;
const BASE_URL = 'http://20.244.56.144/evaluation-service';

const numberWindows = {
  p: [],
  f: [],
  e: [],
  r: []
};

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`${BASE_URL}/${type}`, { timeout: TIMEOUT });
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${type} numbers:`, error.message);
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
};

const updateWindow = (type, newNumbers) => {
  const window = numberWindows[type];
  const prevState = [...window];
  
  newNumbers.forEach(num => {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift();
      }
      window.push(num);
    }
  });

  return {
    windowPrevState: prevState,
    windowCurrState: window,
    numbers: newNumbers,
    avg: calculateAverage(window)
  };
};

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  
  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  const typeMap = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
  };

  const newNumbers = await fetchNumbers(typeMap[type]);
  const result = updateWindow(type, newNumbers);
  
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 