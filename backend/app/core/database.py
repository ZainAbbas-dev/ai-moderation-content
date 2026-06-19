from pymongo import MongoClient
from app.core.config import settings

# Initialize PyMongo Client
client = MongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Define Collections
users_collection = db["users"]
submissions_collection = db["submissions"]
appeals_collection = db["appeals"]
policies_collection = db["policies"]

# Create unique index for user emails
users_collection.create_index("email", unique=True)