import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, TextField, Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/system';
import sha256 from 'crypto-js/sha256';

const GradientBackground = styled(Box)({
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(210deg, #A472CB, #5883F2)',
});

const StyledAvatar = styled(Avatar)({
  width: '100px',
  height: '100px',
  backgroundColor: '#ffffff33',
  color: '#FFFFFF',
});

const StyledTextField = styled(TextField)({
  backgroundColor: '#FFFFFFCC',
  borderRadius: '50px',
  maxWidth: '500px',
  marginBottom: '20px',
});

const FLASK_BASE_URL = window.api.flaskUrl;

const API_ENDPOINTS = {
  INIT_DB: `${FLASK_BASE_URL}/init_db`,
  CHECK_SETUP: `${FLASK_BASE_URL}/check_setup_complete`,
  ADD_MASTER_PASSWORD: `${FLASK_BASE_URL}/add_master_password`,
};

const TestPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetupComplete = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CHECK_SETUP);
        if (response.ok) {
          const result = await response.json();
          if (result.setup_complete) {
            navigate('/LoginPage'); // Redirect to login if setup is complete
          }
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setErrorMessage('An error occurred while checking the setup status.');
      } finally {
        setLoading(false); // Stop loading after the check
      }
    };

    const initializeDatabase = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INIT_DB, { method: 'POST' });
        if (!response.ok) {
          setErrorMessage('Failed to initialize the database. Please restart the app.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while initializing the database.');
      }
    };

    // Initialize the database and check setup status
    (async () => {
      await initializeDatabase();
      await checkSetupComplete();
    })();
  }, [navigate]);

  const handleSetup = async () => {
    setErrorMessage('');
    if (password.length <= 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrorMessage('Password must be longer than 8 characters, include a number, and a special character.');
      return;
    }

    const hashedPassword = sha256(password).toString();
    setIsProcessing(true);

    try {
      const response = await fetch(API_ENDPOINTS.ADD_MASTER_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: hashedPassword }),
      });

      if (response.ok) {
        alert('Setup successful!');
        navigate('/LoginPage');
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Error during setup. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during setup. Please check your internet connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <Container maxWidth="sm">
          <CircularProgress />
          <Typography mt={2}>Initializing...</Typography>
        </Container>
      </GradientBackground>
    );
  }

  if (errorMessage) {
    return (
      <GradientBackground>
        <Container maxWidth="sm">
          <Alert severity="error">{errorMessage}</Alert>
        </Container>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" mb={4}>
          <StyledAvatar>
            <Typography variant="h1">🔐</Typography>
          </StyledAvatar>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <StyledTextField
            variant="outlined"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <StyledTextField
            variant="outlined"
            label="Master Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSetup} disabled={isProcessing}>
            {isProcessing ? <CircularProgress size={24} /> : 'Set Up Account'}
          </Button>
        </Box>
      </Container>
    </GradientBackground>
  );
};

export default TestPage;


