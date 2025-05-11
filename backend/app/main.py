from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from .routers import news, reports
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Fake News Detection API",
    description="API for detecting fake news using Gemini AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(news.router, prefix="/api", tags=["News"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

# Mount static directory for charts
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to Fake News Detection API"}

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run("app.main:app", host=host, port=port, reload=debug) 