import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Paper,
} from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BarChartIcon from '@mui/icons-material/BarChart';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InfoIcon from '@mui/icons-material/Info';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          mt: 2,
          borderRadius: 3,
          backgroundColor: 'primary.light',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h2" component="h1" gutterBottom>
              Fake News Detection
            </Typography>
            <Typography variant="h5" paragraph>
              Analyze news articles with AI to identify misinformation and fake news
            </Typography>
            <Typography variant="body1" paragraph>
              Our platform uses Google's Gemini AI to analyze news content, detect patterns 
              of misinformation, and provide detailed reports on news credibility.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/analyzer')}
              sx={{ 
                mt: 2, 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                } 
              }}
            >
              Try it Now
            </Button>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img"
              src="/fake-news-icon.png" 
              alt="Fake News Detection"
              sx={{ 
                width: '100%', 
                maxWidth: 300,
                display: { xs: 'none', md: 'block' } 
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mt: 6, mb: 4 }}>
        Key Features
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <FactCheckIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                AI-Powered Analysis
              </Typography>
              <Typography>
                Our system uses Google Gemini AI to analyze news content, language patterns,
                and factual consistency to identify potential fake news with high accuracy.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/analyzer')}>Try Analyzer</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <BarChartIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                Detailed Reports
              </Typography>
              <Typography>
                Get comprehensive reports with visualizations showing trends, 
                statistical analysis, and confidence levels for each analysis.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/dashboard')}>View Dashboard</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <TextSnippetIcon color="primary" sx={{ fontSize: 60 }} />
              </Box>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                Content Analysis
              </Typography>
              <Typography>
                Analyze news text for language manipulation, propaganda techniques, 
                and other indicators that help identify potentially misleading content.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/reports')}>View Reports</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works Section */}
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mt: 8, mb: 4 }}>
        How It Works
      </Typography>
      
      <Grid container spacing={2} alignItems="center" sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            1. Input News Content
          </Typography>
          <Typography paragraph>
            Enter the news headline and content you want to analyze, or upload a text file.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            2. AI Analysis
          </Typography>
          <Typography paragraph>
            Our Gemini AI engine analyzes the text for patterns of misinformation, factual inconsistencies,
            emotional manipulation, and other indicators of potentially fake news.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            3. Get Results
          </Typography>
          <Typography paragraph>
            Receive a detailed report with confidence scores, explanations, and recommendations
            about the credibility of the news content.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            4. View Statistics
          </Typography>
          <Typography>
            Access the dashboard to see trends and statistical analysis of all processed news content.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              width: '100%', 
              maxWidth: 450, 
              p: 2,
              border: '1px dashed grey',
              borderRadius: 2,
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper'
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              Workflow Diagram (Placeholder)
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home; 