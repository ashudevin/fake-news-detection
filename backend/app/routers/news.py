from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import json
from ..services.gemini_service import classify_news, analyze_news_content
from ..services.report_service import add_news_to_report

router = APIRouter()

class NewsRequest(BaseModel):
    title: str
    content: str
    source: Optional[str] = None

class NewsResponse(BaseModel):
    is_fake: bool
    confidence: float
    explanation: str
    title: str
    content: str
    source: Optional[str] = None

@router.post("/detect", response_model=NewsResponse)
async def detect_fake_news(news: NewsRequest):
    """
    Detect if the provided news is fake or real using Gemini AI
    """
    try:
        # Process the news content with Gemini AI
        is_fake, confidence, explanation = await classify_news(news.title, news.content)
        
        # Create the response
        response = NewsResponse(
            is_fake=is_fake,
            confidence=confidence,
            explanation=explanation,
            title=news.title,
            content=news.content,
            source=news.source
        )
        
        # Add the result to the reports database
        await add_news_to_report(
            news.title, 
            news.content, 
            news.source, 
            is_fake, 
            confidence, 
            explanation
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing news: {str(e)}")

@router.post("/analyze")
async def analyze_news(text: str = Form(...)):
    """
    Analyze news content and provide detailed insights
    """
    try:
        analysis = await analyze_news_content(text)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing news: {str(e)}")

@router.post("/upload")
async def upload_news_file(file: UploadFile = File(...)):
    """
    Upload and analyze a news file (txt, doc, pdf)
    """
    try:
        content = await file.read()
        text_content = content.decode("utf-8")
        
        # Extract title from filename
        title = file.filename.split(".")[0].replace("_", " ").title()
        
        # Process with Gemini AI
        is_fake, confidence, explanation = await classify_news(title, text_content)
        
        # Add to reports
        await add_news_to_report(
            title, 
            text_content, 
            f"Uploaded file: {file.filename}", 
            is_fake, 
            confidence, 
            explanation
        )
        
        return {
            "is_fake": is_fake,
            "confidence": confidence,
            "explanation": explanation,
            "title": title,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}") 