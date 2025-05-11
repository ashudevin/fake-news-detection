import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Analyze news content for fake news detection
 * @param {Object} data - News data with title, content, and optional source
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeNews = async (data) => {
  try {
    const response = await api.post('/api/detect', data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Upload and analyze a news file
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} - Analysis result
 */
export const uploadNewsFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get statistics about fake news detection
 * @param {number} days - Number of days to include in statistics
 * @returns {Promise<Object>} - Statistics data
 */
export const getStatistics = async (days = 7) => {
  try {
    const response = await api.get(`/api/statistics?days=${days}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get recent news reports
 * @param {number} limit - Maximum number of reports to retrieve
 * @param {boolean} fakeOnly - Whether to return only fake news reports
 * @returns {Promise<Object>} - Reports data
 */
export const getReports = async (limit = 10, fakeOnly = false) => {
  try {
    const response = await api.get(`/api/recent?limit=${limit}&fake_only=${fakeOnly}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Analyze text content for detailed insights
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzeTextContent = async (text) => {
  try {
    const formData = new FormData();
    formData.append('text', text);

    const response = await api.post('/api/analyze', formData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Handle API errors
 * @param {Error} error - The error object
 * @throws {Error} - Rethrows a more user-friendly error
 */
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data.detail || 'An error occurred on the server.';
    
    if (status === 429) {
      throw new Error(`429 Rate limit exceeded: ${message}`);
    } else if (status === 404) {
      throw new Error('The requested resource was not found.');
    } else if (status === 401 || status === 403) {
      throw new Error('You are not authorized to perform this action.');
    } else {
      throw new Error(message);
    }
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Could not connect to the server. Please check your internet connection.');
  } else {
    // Error in setting up the request
    throw new Error('An error occurred while processing your request.');
  }
};

export default api; 