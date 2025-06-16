// app/dashboard/page.js
import * as React from 'react';
import { Container, Typography, Box } from '@mui/material';

// Dashboard page for Aivestor app
export default function Dashboard() {
  // Mock data (replace with API call later)
  const holdings = [
    { ticker: 'AAPL', price: 203.92, change: '+1.64%' },
    { ticker: 'MSFT', price: 470.38, change: '+0.58%' },
  ];
  const totalGain = { value: 13756848.06, change: '+3.37%' };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h6">Total Gains: £{totalGain.value.toLocaleString()} ({totalGain.change})</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Holdings</Typography>
        {holdings.map((holding) => (
          <Box key={holding.ticker} sx={{ mb: 1 }}>
            <Typography>
              {holding.ticker}: £{holding.price.toLocaleString()} ({holding.change})
            </Typography>
          </Box>
        ))}
      </Box>
      {/* Graph will go here */}
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Graph of gains (coming tomorrow!)
      </Typography>
    </Container>
  );
}