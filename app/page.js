// app/page.js
import { Typography, Container } from '@mui/material';

// Home page for Aivestor app
export default HomePage() ;{
  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to Aivestor!
      </Typography>
      <Typography variant="body1" align="center" >
        Your AI-powered investment advisor. Log in or register to get stock predictions and portfolio recommendations.
      </Typography>
    </Container>
  );
}