import asyncio
import json
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "fake_news_detection")

# Path to reports.json
REPORTS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "data", "reports.json")

async def migrate_data():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    reports_collection = db.reports
    
    # Load existing reports
    if not os.path.exists(REPORTS_FILE):
        print("No existing reports file found.")
        return
    
    with open(REPORTS_FILE, 'r') as file:
        reports = json.load(file)
    
    # Convert timestamps to datetime objects
    for report in reports:
        report["timestamp"] = datetime.fromisoformat(report["timestamp"])
        # Remove the old id as MongoDB will generate a new one
        report.pop("id", None)
    
    # Insert reports into MongoDB
    if reports:
        result = await reports_collection.insert_many(reports)
        print(f"Successfully migrated {len(result.inserted_ids)} reports to MongoDB")
    else:
        print("No reports to migrate")

if __name__ == "__main__":
    asyncio.run(migrate_data()) 