import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchStockData, fetchStocks } from '../services/api';

function StockPage() {
  const [timeInterval, setTimeInterval] = useState(5);
  const [stockData, setStockData] = useState([]);
  const [average, setAverage] = useState(0);
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const stocksData = await fetchStocks();
        setStocks(stocksData);
        if (Object.keys(stocksData).length > 0) {
          const firstStock = Object.values(stocksData)[0];
          setSelectedStock(firstStock);
        }
      } catch (err) {
        setError('Failed to load stocks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (selectedStock) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchStockData(selectedStock, timeInterval);
          if (data.prices && data.prices.length > 0) {
            const pricesWithAverage = data.prices.map(point => ({
              ...point,
              average: data.average
            }));
            setStockData(pricesWithAverage);
            setAverage(data.average);
          } else {
            setStockData([]);
            setAverage(0);
          }
        } catch (err) {
          setError(`Failed to load data for ${selectedStock}. Please try again later.`);
          setStockData([]);
          setAverage(0);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [timeInterval, selectedStock]);

  const formatTooltip = (value, name) => {
    if (name === 'price') {
      return [`$${value.toFixed(2)}`, 'Price'];
    }
    return [`$${value.toFixed(2)}`, 'Average'];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Stock Price Chart</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Stock</InputLabel>
              <Select
                value={selectedStock}
                label="Select Stock"
                onChange={(e) => setSelectedStock(e.target.value)}
                disabled={loading}
              >
                {Object.entries(stocks).map(([name, symbol]) => (
                  <MenuItem key={symbol} value={symbol}>
                    {name} ({symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Interval</InputLabel>
              <Select
                value={timeInterval}
                label="Time Interval"
                onChange={(e) => setTimeInterval(e.target.value)}
                disabled={loading}
              >
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 400, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Price"
                  stroke="#1976d2"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Average"
                  stroke="#dc004e"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography>No data available</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default StockPage; 