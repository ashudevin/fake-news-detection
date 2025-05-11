import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Fake News Detection Project | Powered by '}
          <Link
            color="inherit"
            href="https://ai.google.dev/gemini-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Gemini AI
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
