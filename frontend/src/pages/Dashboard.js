import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { getStatistics } from '../services/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState(7);
  const [chartTab, setChartTab] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStatistics(timeRange);
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  const getChartUrl = (chartType) => {
    return `/api/chart/${chartType}?days=${timeRange}`;
  };

  const chartTypes = ['pie', 'trend', 'sources', 'confidence'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
        <Typography variant="h3" component="h1">
          Dashboard
        </Typography>
        <FormControl sx={{ width: 200 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 3 months</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
            <MenuItem value={-1}>All time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total News Analyzed
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats.total_count.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In selected time period: {stats.recent_count.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fake News Detected
                  </Typography>
                  <Typography variant="h3" color="error">
                    {stats.total_count.fake}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.total_count.fake > 0
                      ? `${((stats.total_count.fake / stats.total_count.total) * 100).toFixed(1)}% of total`
                      : '0% of total'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Real News Confirmed
                  </Typography>
                  <Typography variant="h3" color="success">
                    {stats.total_count.real}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.total_count.real > 0
                      ? `${((stats.total_count.real / stats.total_count.total) * 100).toFixed(1)}% of total`
                      : '0% of total'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Average Confidence
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats.confidence_stats.average
                      ? `${(stats.confidence_stats.average * 100).toFixed(1)}%`
                      : '0%'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Min: {(stats.confidence_stats.min * 100).toFixed(1)}% | Max:{' '}
                    {(stats.confidence_stats.max * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={chartTab}
              onChange={handleChartTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Distribution" />
              <Tab label="Trends" />
              <Tab label="Sources" />
              <Tab label="Confidence" />
            </Tabs>
            <Divider />
            <Box p={3} sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {chartTypes.map((type, index) => (
                <Box
                  key={type}
                  sx={{
                    display: chartTab === index ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={getChartUrl(type)}
                    alt={`${type} chart`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ display: 'none', mt: 2 }}
                  >
                    Chart could not be loaded. Please try again later.
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Sources Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Top Sources
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(stats.by_source)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 6)
                .map(([source, counts]) => (
                  <Grid item xs={12} sm={6} md={4} key={source}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {source}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Total: {counts.total}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="error">
                              Fake: {counts.fake} (
                              {counts.total > 0
                                ? `${((counts.fake / counts.total) * 100).toFixed(1)}%`
                                : '0%'}
                              )
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                height: 6,
                                width: '100%',
                                backgroundColor: '#e0e0e0',
                                borderRadius: 3,
                                mt: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${counts.total > 0 ? (counts.fake / counts.total) * 100 : 0}%`,
                                  backgroundColor: 'error.main',
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Paper>

          {/* Confidence Distribution */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Confidence Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(stats.confidence_stats.distribution).map(([range, count]) => (
                <Grid item xs={6} sm={4} md={2.4} key={range}>
                  <Card
                    variant="outlined"
                    sx={{
                      textAlign: 'center',
                      backgroundColor:
                        range === '0.0-0.2'
                          ? '#e8f5e9'
                          : range === '0.2-0.4'
                          ? '#c8e6c9'
                          : range === '0.4-0.6'
                          ? '#ffecb3'
                          : range === '0.6-0.8'
                          ? '#ffccbc'
                          : '#ffcdd2',
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {range === '0.0-0.2'
                          ? 'Very Confident Real'
                          : range === '0.2-0.4'
                          ? 'Somewhat Confident Real'
                          : range === '0.4-0.6'
                          ? 'Uncertain'
                          : range === '0.6-0.8'
                          ? 'Somewhat Confident Fake'
                          : 'Very Confident Fake'}
                      </Typography>
                      <Typography variant="h5">{count}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {stats.total_count.total > 0
                          ? `${((count / stats.total_count.total) * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default Dashboard; 