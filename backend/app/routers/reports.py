from fastapi import APIRouter, HTTPException, Query, Response
from typing import List, Optional
from datetime import datetime, timedelta
import json
import logging
import traceback
from ..services.report_service import get_report_statistics, get_recent_reports, generate_chart
from ..models.report_models import ReportStatistics, NewsList

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/statistics", response_model=ReportStatistics)
async def get_statistics(
    days: Optional[int] = Query(7, description="Number of days to include in statistics")
):
    """
    Get statistics about fake news detection results
    """
    try:
        stats = await get_report_statistics(days)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

@router.get("/recent", response_model=NewsList)
async def get_latest_reports(
    limit: int = Query(10, description="Number of reports to return"),
    fake_only: bool = Query(False, description="Return only fake news reports")
):
    """
    Get the most recent news reports processed by the system
    """
    try:
        logger.info(f"Fetching recent reports. Limit: {limit}, Fake only: {fake_only}")
        reports = await get_recent_reports(limit, fake_only)
        logger.info(f"Retrieved {len(reports)} reports")
        
        # Log the first report for debugging (if available)
        if reports and len(reports) > 0:
            logger.info(f"First report sample: {reports[0].dict()}")
        
        return {"items": reports}
    except Exception as e:
        logger.error(f"Error retrieving reports: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error retrieving reports: {str(e)}")

@router.get("/chart/{chart_type}")
async def get_chart(
    chart_type: str,
    days: int = Query(7, description="Number of days to include in chart"),
    width: int = Query(800, description="Chart width"),
    height: int = Query(500, description="Chart height")
):
    """
    Generate a chart of fake news statistics
    
    Chart types:
    - pie: Pie chart of fake vs real news
    - trend: Line chart showing trend of fake news over time
    - sources: Bar chart of fake news by source
    - confidence: Histogram of confidence distribution
    """
    try:
        valid_types = ["pie", "trend", "sources", "confidence"]
        if chart_type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid chart type. Must be one of: {', '.join(valid_types)}"
            )
            
        chart_data = await generate_chart(chart_type, days, width, height)
        return Response(content=chart_data, media_type="image/png")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chart: {str(e)}") 