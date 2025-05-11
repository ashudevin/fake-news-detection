# Fake News Detection System

A full-stack application that uses AI to detect fake news articles. Built with FastAPI, React, and Google's Gemini AI.

## Features

- Real-time fake news detection using Gemini AI
- Detailed analysis and confidence scoring
- Interactive dashboard with statistics and charts
- MongoDB database for storing analysis results
- RESTful API for easy integration

## Tech Stack

### Backend
- FastAPI
- MongoDB
- Google Gemini AI
- Python 3.8+

### Frontend
- React
- Material-UI
- Chart.js
- Axios

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- MongoDB
- Google Gemini AI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fake-news-detection.git
cd fake-news-detection
```

2. Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend Setup:
```bash
cd frontend
npm install
```

4. Environment Variables:
Create a `.env` file in the backend directory with:
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=fake_news_detection
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

3. Start the Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Endpoints

- `POST /api/analyze` - Analyze news content
- `GET /api/reports` - Get analysis reports
- `GET /api/statistics` - Get analysis statistics
- `GET /api/charts/{type}` - Get visualization charts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 