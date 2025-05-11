import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';

function About() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
        About This Project
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Fake News Detection System
        </Typography>
        <Typography variant="body1" paragraph>
          This project is a comprehensive fake news detection system built to help users identify
          potentially misleading or false news content. Leveraging the power of Google's Gemini AI,
          the application analyzes news text for patterns of misinformation, linguistic cues, and
          factual inconsistencies.
        </Typography>
        <Typography variant="body1" paragraph>
          The system is designed not only to classify news as potentially fake or likely real but also
          to provide detailed explanations of the reasoning behind the classification. This helps users
          understand why certain content might be considered suspicious or trustworthy.
        </Typography>
        <Typography variant="body1" paragraph>
          Additionally, the application maintains a database of all analyzed content, allowing users
          to view trends and statistics about fake news detection over time.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Technologies Used
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SmartToyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Google Gemini AI"
                    secondary="Advanced AI model for natural language understanding and content analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CloudIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="FastAPI"
                    secondary="High-performance Python web framework for building APIs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="React"
                    secondary="JavaScript library for building user interfaces"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DataObjectIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Material-UI"
                    secondary="React component library implementing Google's Material Design"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Visualization"
                    secondary="Charts and graphs powered by Plotly and Matplotlib"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                How It Works
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Content Analysis"
                    secondary="The system analyzes news text for linguistic patterns, factual claims, and other indicators of misinformation."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI Classification"
                    secondary="Gemini AI evaluates the content and assigns a confidence score indicating the likelihood of the news being fake or real."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Detailed Explanation"
                    secondary="For each analysis, the system provides a detailed explanation of why the content was classified as it was."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Statistical Reporting"
                    secondary="The system maintains statistics on analyzed content, allowing users to see trends in fake news detection."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="User-Friendly Interface"
                    secondary="An intuitive interface makes it easy for users to submit content for analysis and view results."
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Disclaimer
        </Typography>
        <Typography variant="body1" paragraph>
          This system is designed as an educational tool and should not be considered as a definitive arbiter
          of truth. The AI's analysis is based on patterns it has learned, but it may not always be correct.
          Users should always exercise critical thinking and verify information through multiple reliable sources.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()} Fake News Detection Project
        </Typography>
      </Paper>
    </Container>
  );
}

export default About; 