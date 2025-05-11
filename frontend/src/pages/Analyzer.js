import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate } from 'react-router-dom';
import { analyzeNews, uploadNewsFile } from '../services/api';

function Analyzer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Clear previous results
    setResult(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Please provide both title and content.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await analyzeNews(formData);
      setResult(data);
    } catch (err) {
      // Check if it's a rate limit error
      const errorMsg = err.message.toLowerCase();
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        setError(
          'The Gemini AI API rate limit has been exceeded. This can happen with the free tier API key. ' +
          'The application will now use a simple rule-based fallback that is less accurate but allows you to continue using the app. ' +
          'For best results, try again later or upgrade to a paid API tier.'
        );
      } else {
        setError(err.message || 'An error occurred during analysis. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await uploadNewsFile(file);
      setResult(data);
    } catch (err) {
      // Check if it's a rate limit error
      const errorMsg = err.message.toLowerCase();
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        setError(
          'The Gemini AI API rate limit has been exceeded. This can happen with the free tier API key. ' +
          'The application will now use a simple rule-based fallback that is less accurate but allows you to continue using the app. ' +
          'For best results, try again later or upgrade to a paid API tier.'
        );
      } else {
        setError(err.message || 'An error occurred during file processing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLevelText = (confidence) => {
    if (confidence < 0.2) return 'Very Low';
    if (confidence < 0.4) return 'Low';
    if (confidence < 0.6) return 'Moderate';
    if (confidence < 0.8) return 'High';
    return 'Very High';
  };

  const getConfidenceColor = (confidence, isFake) => {
    if (isFake) {
      // For fake news, higher confidence = more red
      if (confidence < 0.6) return 'warning';
      return 'error';
    } else {
      // For real news, higher confidence = more green
      if (confidence < 0.6) return 'info';
      return 'success';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mt: 2 }}>
        News Analyzer
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Analyze news content using our Gemini AI-powered tool to detect potential fake news.
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Analyze Text" />
          <Tab label="Upload File" />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <form onSubmit={handleTextSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="News Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="News Content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    multiline
                    rows={6}
                    variant="outlined"
                    placeholder="Paste the news article content here..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={24} /> : <AnalyticsIcon />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze News'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {activeTab === 1 && (
            <form onSubmit={handleFileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    {!file ? (
                      <>
                        <input
                          accept=".txt,.doc,.docx,.pdf"
                          style={{ display: 'none' }}
                          id="upload-file"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="upload-file">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadFileIcon />}
                          >
                            Select File
                          </Button>
                        </label>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                          Supported formats: .txt, .doc, .docx, .pdf
                        </Typography>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                          {file.name}
                        </Typography>
                        <IconButton size="small" onClick={clearFile}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading || !file}
                    startIcon={loading ? <CircularProgress size={24} /> : <AnalyticsIcon />}
                  >
                    {loading ? 'Analyzing...' : 'Upload and Analyze'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>

      {result && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Analysis Results
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {result.title}
              </Typography>
              {result.source && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Source: {result.source}
                </Typography>
              )}
              <Box sx={{ mt: 2, mb: 3 }}>
                <Chip
                  icon={result.is_fake ? <CancelIcon /> : <CheckCircleIcon />}
                  label={result.is_fake ? 'Potentially Fake News' : 'Likely Real News'}
                  color={result.is_fake ? 'error' : 'success'}
                  sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2, px: 1 }}
                />
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}% (
                {getConfidenceLevelText(result.confidence)})
              </Typography>
              <Box
                sx={{
                  height: 10,
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: 5,
                  mt: 1,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${result.confidence * 100}%`,
                    backgroundColor: result.is_fake ? '#f44336' : '#4caf50',
                    borderRadius: 5,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Explanation
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.explanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/reports')}
              sx={{ mx: 1 }}
            >
              View All Reports
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setResult(null);
                setError('');
                setFormData({ title: '', content: '', source: '' });
                setFile(null);
              }}
              sx={{ mx: 1 }}
            >
              Analyze Another
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Analyzer; 