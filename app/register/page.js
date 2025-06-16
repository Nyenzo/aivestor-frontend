// app/register/page.js
import * as React from 'react';
import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Register page for new user signup
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        risk_tolerance: parseFloat(riskTolerance) || 0.5,
      });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Risk Tolerance (0.0 to 1.0)"
          type="number"
          fullWidth
          margin="normal"
          value={riskTolerance}
          onChange={(e) => setRiskTolerance(e.target.value)}
          inputProps={{ step: 0.1, min: 0, max: 1 }}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </Container>
  );
}