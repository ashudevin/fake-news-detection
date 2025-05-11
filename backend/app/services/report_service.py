import json
import os
import io
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.io as pio
from datetime import datetime, timedelta
import asyncio
from ..models.report_models import NewsReport, StatCount, ConfidenceStats, ReportStatistics
from ..config.mongodb import reports_collection

# Path to static directory for charts
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

async def add_news_to_report(title, content, source, is_fake, confidence, explanation):
    """Add news analysis result to reports database"""
    # Create new report
    report = {
        "title": title,
        "content": content[:500] + ("..." if len(content) > 500 else ""),  # Truncate content for storage
        "source": source,
        "is_fake": is_fake,
        "confidence": confidence,
        "explanation": explanation,
        "timestamp": datetime.now()
    }
    
    # Insert into MongoDB
    result = await reports_collection.insert_one(report)
    report["id"] = str(result.inserted_id)
    
    return report

async def get_report_statistics(days=7):
    """Generate statistics from reports"""
    # Calculate cutoff date
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get all reports
    cursor = reports_collection.find({})
    reports = await cursor.to_list(length=None)
    
    # Filter for recent reports
    recent_reports = [r for r in reports if r["timestamp"] >= cutoff_date]
    
    # Calculate total counts
    total_real = sum(1 for r in reports if not r["is_fake"])
    total_fake = sum(1 for r in reports if r["is_fake"])
    
    # Calculate recent counts
    recent_real = sum(1 for r in recent_reports if not r["is_fake"])
    recent_fake = sum(1 for r in recent_reports if r["is_fake"])
    
    # Count by source
    sources = {}
    for report in reports:
        source = report.get("source", "Unknown")
        if source not in sources:
            sources[source] = {"real": 0, "fake": 0, "total": 0}
        
        sources[source]["total"] += 1
        if report["is_fake"]:
            sources[source]["fake"] += 1
        else:
            sources[source]["real"] += 1
    
    # Convert sources to StatCount objects
    by_source = {s: StatCount(**counts) for s, counts in sources.items()}
    
    # Calculate confidence statistics
    if reports:
        confidence_values = [r["confidence"] for r in reports]
        avg_confidence = sum(confidence_values) / len(confidence_values)
        min_confidence = min(confidence_values)
        max_confidence = max(confidence_values)
        
        # Distribution in ranges
        ranges = {"0.0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0}
        for c in confidence_values:
            if c < 0.2:
                ranges["0.0-0.2"] += 1
            elif c < 0.4:
                ranges["0.2-0.4"] += 1
            elif c < 0.6:
                ranges["0.4-0.6"] += 1
            elif c < 0.8:
                ranges["0.6-0.8"] += 1
            else:
                ranges["0.8-1.0"] += 1
    else:
        avg_confidence = 0
        min_confidence = 0
        max_confidence = 0
        ranges = {"0.0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0}
    
    # Daily counts
    daily_counts = {}
    for report in reports:
        date = report["timestamp"].strftime("%Y-%m-%d")
        if date not in daily_counts:
            daily_counts[date] = {"real": 0, "fake": 0, "total": 0}
        
        daily_counts[date]["total"] += 1
        if report["is_fake"]:
            daily_counts[date]["fake"] += 1
        else:
            daily_counts[date]["real"] += 1
    
    # Convert daily counts to StatCount objects
    daily_stats = {d: StatCount(**counts) for d, counts in daily_counts.items()}
    
    # Create statistics response
    stats = ReportStatistics(
        total_count=StatCount(real=total_real, fake=total_fake, total=total_real + total_fake),
        recent_count=StatCount(real=recent_real, fake=recent_fake, total=recent_real + recent_fake),
        by_source=by_source,
        confidence_stats=ConfidenceStats(
            average=avg_confidence,
            min=min_confidence,
            max=max_confidence,
            distribution=ranges
        ),
        daily_counts=daily_stats
    )
    
    return stats

async def get_recent_reports(limit=10, fake_only=False):
    """Get recent reports"""
    # Build query
    query = {"is_fake": True} if fake_only else {}
    
    try:
        # Get reports sorted by timestamp
        cursor = reports_collection.find(query).sort("timestamp", -1).limit(limit)
        reports = await cursor.to_list(length=limit)
        
        # Debug: print reports count
        print(f"Found {len(reports)} reports in MongoDB")
        if reports:
            print(f"First report sample fields: {list(reports[0].keys())}")
        
        # Convert ObjectId to string for JSON serialization
        processed_reports = []
        for report in reports:
            # Make a copy to avoid modifying the original
            processed_report = dict(report)
            # Convert _id to string and assign to id field
            processed_report["id"] = str(processed_report.pop("_id"))
            # Ensure timestamp is in ISO format
            if "timestamp" in processed_report and processed_report["timestamp"]:
                processed_report["timestamp"] = processed_report["timestamp"].isoformat()
            
            processed_reports.append(processed_report)
        
        # Convert to NewsReport objects
        return [NewsReport(**r) for r in processed_reports]
    
    except Exception as e:
        print(f"Error fetching reports from MongoDB: {str(e)}")
        # Fallback to empty list
        return []

async def generate_chart(chart_type, days=7, width=800, height=500):
    """Generate chart as PNG image"""
    stats = await get_report_statistics(days)
    
    # Prepare data based on chart type
    if chart_type == "pie":
        return await _generate_pie_chart(stats, width, height)
    elif chart_type == "trend":
        return await _generate_trend_chart(stats, width, height)
    elif chart_type == "sources":
        return await _generate_sources_chart(stats, width, height)
    elif chart_type == "confidence":
        return await _generate_confidence_chart(stats, width, height)
    else:
        raise ValueError(f"Unsupported chart type: {chart_type}")

async def _generate_pie_chart(stats, width, height):
    """Generate pie chart of fake vs real news"""
    # Run in thread to avoid blocking
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, _generate_pie_chart_sync, stats, width, height
    )

def _generate_pie_chart_sync(stats, width, height):
    df = pd.DataFrame([
        {"Category": "Real News", "Count": stats.total_count.real},
        {"Category": "Fake News", "Count": stats.total_count.fake}
    ])
    
    # Use plotly for better visualization
    fig = px.pie(
        df, 
        values="Count", 
        names="Category", 
        title="Fake vs Real News Distribution",
        color_discrete_map={"Real News": "green", "Fake News": "red"}
    )
    
    fig.update_layout(width=width, height=height)
    
    # Convert to PNG
    return pio.to_image(fig, format="png")

async def _generate_trend_chart(stats, width, height):
    """Generate trend chart of fake news over time"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, _generate_trend_chart_sync, stats, width, height
    )

def _generate_trend_chart_sync(stats, width, height):
    # Convert daily counts to DataFrame
    data = []
    for date, counts in stats.daily_counts.items():
        data.append({"Date": date, "Category": "Real News", "Count": counts.real})
        data.append({"Date": date, "Category": "Fake News", "Count": counts.fake})
    
    df = pd.DataFrame(data)
    if df.empty:
        # Create empty chart if no data
        fig = px.line(title="Fake News Trend (No Data)")
    else:
        # Sort by date
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date")
        
        fig = px.line(
            df, 
            x="Date", 
            y="Count", 
            color="Category",
            title="Fake vs Real News Trend",
            color_discrete_map={"Real News": "green", "Fake News": "red"}
        )
    
    fig.update_layout(width=width, height=height)
    
    # Convert to PNG
    return pio.to_image(fig, format="png")

async def _generate_sources_chart(stats, width, height):
    """Generate chart of fake news by source"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, _generate_sources_chart_sync, stats, width, height
    )

def _generate_sources_chart_sync(stats, width, height):
    # Convert source data to DataFrame
    data = []
    for source, counts in stats.by_source.items():
        if counts.total > 0:  # Only include sources with data
            data.append({"Source": source, "Category": "Real News", "Count": counts.real})
            data.append({"Source": source, "Category": "Fake News", "Count": counts.fake})
    
    df = pd.DataFrame(data)
    if df.empty:
        # Create empty chart if no data
        fig = px.bar(title="News by Source (No Data)")
    else:
        fig = px.bar(
            df,
            x="Source",
            y="Count",
            color="Category",
            title="News by Source",
            barmode="group",
            color_discrete_map={"Real News": "green", "Fake News": "red"}
        )
    
    fig.update_layout(width=width, height=height)
    
    # Convert to PNG
    return pio.to_image(fig, format="png")

async def _generate_confidence_chart(stats, width, height):
    """Generate confidence distribution histogram"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, _generate_confidence_chart_sync, stats, width, height
    )

def _generate_confidence_chart_sync(stats, width, height):
    # Convert confidence distribution to DataFrame
    df = pd.DataFrame([
        {"Range": k, "Count": v} 
        for k, v in stats.confidence_stats.distribution.items()
    ])
    
    if df["Count"].sum() == 0:
        # Create empty chart if no data
        fig = px.bar(title="Confidence Distribution (No Data)")
    else:
        # Define custom order for ranges
        custom_order = ["0.0-0.2", "0.2-0.4", "0.4-0.6", "0.6-0.8", "0.8-1.0"]
        df["Range"] = pd.Categorical(df["Range"], categories=custom_order, ordered=True)
        df = df.sort_values("Range")
        
        # Create meaning labels for ranges
        range_labels = {
            "0.0-0.2": "Highly Confident Real",
            "0.2-0.4": "Somewhat Confident Real",
            "0.4-0.6": "Uncertain",
            "0.6-0.8": "Somewhat Confident Fake",
            "0.8-1.0": "Highly Confident Fake"
        }
        df["Label"] = df["Range"].map(range_labels)
        
        fig = px.bar(
            df,
            x="Label",
            y="Count",
            title="Confidence Distribution",
            color="Label",
            color_discrete_map={
                "Highly Confident Real": "darkgreen",
                "Somewhat Confident Real": "lightgreen",
                "Uncertain": "yellow",
                "Somewhat Confident Fake": "orange",
                "Highly Confident Fake": "red"
            }
        )
    
    fig.update_layout(width=width, height=height)
    
    # Convert to PNG
    return pio.to_image(fig, format="png") 