import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { getReports } from '../services/api';

function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterFakeOnly, setFilterFakeOnly] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterFakeOnly]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReports(rowsPerPage, filterFakeOnly);
      setReports(data.items || []);
    } catch (err) {
      setError('Failed to load reports. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenReportDialog = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    setFilterFakeOnly(event.target.checked);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function getConfidenceText(confidence) {
    if (confidence < 0.2) return 'Very Low';
    if (confidence < 0.4) return 'Low';
    if (confidence < 0.6) return 'Moderate';
    if (confidence < 0.8) return 'High';
    return 'Very High';
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
        <Typography variant="h3" component="h1">
          News Reports
        </Typography>
        <FormControlLabel
          control={
            <Switch checked={filterFakeOnly} onChange={handleFilterChange} color="primary" />
          }
          label="Show Fake News Only"
        />
      </Box>
      <Typography variant="body1" sx={{ mb: 4 }}>
        View all analyzed news articles and their classification results.
      </Typography>

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

      {!loading && reports.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No reports found.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Start analyzing news to see reports here.
          </Typography>
        </Paper>
      )}

      {reports.length > 0 && (
        <Paper sx={{ width: '100%', mb: 4 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="reports table">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Chip
                          icon={report.is_fake ? <CancelIcon /> : <CheckCircleIcon />}
                          label={report.is_fake ? 'Fake' : 'Real'}
                          color={report.is_fake ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{truncateText(report.title, 50)}</TableCell>
                      <TableCell>{report.source || 'Unknown'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 60 }}>
                            {(report.confidence * 100).toFixed(0)}%
                          </Box>
                          <Box sx={{ width: 100, mr: 1 }}>
                            <Box
                              sx={{
                                height: 6,
                                width: '100%',
                                backgroundColor: '#e0e0e0',
                                borderRadius: 3,
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${report.confidence * 100}%`,
                                  backgroundColor: report.is_fake ? '#f44336' : '#4caf50',
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {getConfidenceText(report.confidence)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {report.timestamp ? formatDate(report.timestamp) : 'Unknown'}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleOpenReportDialog(report)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Report Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div">
                  News Report Details
                </Typography>
                <Chip
                  icon={selectedReport.is_fake ? <CancelIcon /> : <CheckCircleIcon />}
                  label={selectedReport.is_fake ? 'Potentially Fake News' : 'Likely Real News'}
                  color={selectedReport.is_fake ? 'error' : 'success'}
                />
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
                sx={{ mb: 2 }}
              >
                <Tab label="Summary" />
                <Tab label="Content" />
                <Tab label="Analysis" />
              </Tabs>

              {/* Summary Tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                      {selectedReport.title}
                    </Typography>
                    {selectedReport.source && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Source: {selectedReport.source}
                      </Typography>
                    )}
                    {selectedReport.timestamp && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Date: {formatDate(selectedReport.timestamp)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Classification Results
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Classification:</strong>{' '}
                          {selectedReport.is_fake ? 'Fake News' : 'Real News'}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Confidence Score:</strong>{' '}
                          {(selectedReport.confidence * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Confidence Level:</strong> {getConfidenceText(selectedReport.confidence)}
                        </Typography>
                        <Box
                          sx={{
                            height: 10,
                            width: '100%',
                            backgroundColor: '#e0e0e0',
                            borderRadius: 5,
                            mt: 2,
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${selectedReport.confidence * 100}%`,
                              backgroundColor: selectedReport.is_fake ? '#f44336' : '#4caf50',
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Brief Explanation
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {truncateText(selectedReport.explanation, 300)}
                        </Typography>
                        {selectedReport.explanation.length > 300 && (
                          <Button
                            size="small"
                            onClick={() => setTabValue(2)}
                            sx={{ mt: 1 }}
                          >
                            Read Full Analysis
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Content Tab */}
              {tabValue === 1 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    News Content
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      maxHeight: 400,
                      overflow: 'auto',
                      backgroundColor: '#f8f9fa',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography variant="body1">{selectedReport.content}</Typography>
                  </Paper>
                </Box>
              )}

              {/* Analysis Tab */}
              {tabValue === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Analysis
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      maxHeight: 400,
                      overflow: 'auto',
                      backgroundColor: '#f8f9fa',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography variant="body1">{selectedReport.explanation}</Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Reports; 