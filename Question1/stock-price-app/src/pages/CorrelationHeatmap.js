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
  Tooltip as MuiTooltip,
} from '@mui/material';
import { fetchCorrelationData } from '../services/api';

function CorrelationHeatmap() {
  const [timeInterval, setTimeInterval] = useState(5);
  const [correlationData, setCorrelationData] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCorrelationData(timeInterval);
      setCorrelationData(data.correlations);
      setStocks(data.stocks);
    };

    loadData();
  }, [timeInterval]);

  const getColor = (value) => {
    // Convert correlation value (-1 to 1) to color
    const hue = value > 0 ? 240 : 0;
    const saturation = Math.abs(value) * 100;
    return `hsl(${hue}, ${saturation}%, 50%)`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Correlation Heatmap</Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Interval</InputLabel>
            <Select
              value={timeInterval}
              label="Time Interval"
              onChange={(e) => setTimeInterval(e.target.value)}
            >
              <MenuItem value={5}>5 minutes</MenuItem>
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Strong Negative</Typography>
            <Box
              sx={{
                width: 200,
                height: 20,
                background: 'linear-gradient(to right, #ff0000, #ffffff, #0000ff)',
              }}
            />
            <Typography>Strong Positive</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${stocks.length + 1}, 1fr)`, gap: 1 }}>
          {/* Header row */}
          <Box sx={{ p: 1 }}></Box>
          {stocks.map((stock) => (
            <Box key={stock} sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption">{stock}</Typography>
            </Box>
          ))}

          {/* Data rows */}
          {stocks.map((stock1) => (
            <React.Fragment key={stock1}>
              <Box sx={{ p: 1, textAlign: 'right' }}>
                <Typography variant="caption">{stock1}</Typography>
              </Box>
              {stocks.map((stock2) => {
                const correlation = correlationData.find(
                  (c) => c.stock1 === stock1 && c.stock2 === stock2
                )?.correlation || 0;

                return (
                  <MuiTooltip
                    key={`${stock1}-${stock2}`}
                    title={`Correlation: ${correlation.toFixed(2)}`}
                  >
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: getColor(correlation),
                        cursor: 'pointer',
                      }}
                    />
                  </MuiTooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}

export default CorrelationHeatmap; 