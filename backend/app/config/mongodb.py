import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "fake_news_detection")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
reports_collection = db.reports 