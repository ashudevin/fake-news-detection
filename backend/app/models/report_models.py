from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class NewsReport(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    source: Optional[str] = None
    is_fake: bool
    confidence: float
    explanation: str
    timestamp: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class NewsList(BaseModel):
    items: List[NewsReport]
    
class StatCount(BaseModel):
    real: int
    fake: int
    total: int

class ConfidenceStats(BaseModel):
    average: float
    min: float
    max: float
    distribution: Dict[str, int]  # ranges like "0-0.2", "0.2-0.4", etc. with counts

class ReportStatistics(BaseModel):
    total_count: StatCount
    recent_count: StatCount
    by_source: Dict[str, StatCount]
    confidence_stats: ConfidenceStats
    daily_counts: Dict[str, StatCount]  # date string to counts
    
class ChartData(BaseModel):
    chart_type: str
    data: Any
    days: int 