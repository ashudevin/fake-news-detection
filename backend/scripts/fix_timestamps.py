import asyncio
import os
import pytz
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fake_news_detection")

async def fix_timestamps():
    """Update existing reports with UTC timezone information"""
    print("Starting timestamp fix script...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    reports_collection = db.reports
    
    # Get all reports
    cursor = reports_collection.find({})
    reports = await cursor.to_list(length=None)
    
    print(f"Found {len(reports)} reports in the database")
    
    # Update counts
    updated_count = 0
    error_count = 0
    
    # Update each report with timezone information
    for report in reports:
        try:
            # Check if the report has a timestamp
            if "timestamp" in report and report["timestamp"]:
                # Get the current timestamp
                timestamp = report["timestamp"]
                
                # Check if it already has timezone info
                if not timestamp.tzinfo:
                    # Update with UTC timezone
                    utc_timestamp = timestamp.replace(tzinfo=pytz.UTC)
                    
                    # Update in MongoDB
                    result = await reports_collection.update_one(
                        {"_id": report["_id"]},
                        {"$set": {"timestamp": utc_timestamp}}
                    )
                    
                    if result.modified_count > 0:
                        updated_count += 1
        except Exception as e:
            print(f"Error updating report {report.get('_id')}: {e}")
            error_count += 1
    
    print(f"Updated {updated_count} reports with timezone information")
    print(f"Encountered {error_count} errors during update")
    print("Timestamp fix script completed")

if __name__ == "__main__":
    asyncio.run(fix_timestamps()) 