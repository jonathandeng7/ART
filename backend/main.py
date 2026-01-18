import os
from datetime import datetime
from typing import Optional, List
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId

# Load environment variables
load_dotenv() 

# MongoDB Setup
mongodb_password = os.getenv('MONGODB_PASSWORD')
uri = f"mongodb+srv://elinakocarslan_db_user:{mongodb_password}@gallery.adiobn2.mongodb.net/?appName=gallery"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["sight_data"]
collection = db["artifacts"]
doc = collection.find_one()
print("Doc", doc)

# Pydantic Models for API validation
class ImageAnalysisRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    image_name: str
    analysis_type: str  # "museum", "text", "general", etc.
    descriptions: List[str]  # List of generated descriptions
    metadata: Optional[dict] = {}  # Additional metadata like location, tags, etc.

class ImageAnalysisResponse(BaseModel):
    id: str
    image_name: str
    analysis_type: str
    descriptions: List[str]
    metadata: dict
    created_at: datetime
    updated_at: datetime

class ImageAnalysisUpdate(BaseModel):
    descriptions: Optional[List[str]] = None
    metadata: Optional[dict] = None

# FastAPI App
app = FastAPI(title="Art Beyond Sight API", version="1.0.0")

# Enable CORS for your Expo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc:
        doc['id'] = str(doc['_id'])
        doc.pop('_id', None)
        # Convert datetime objects to ISO format strings for JSON serialization
        if 'created_at' in doc and doc['created_at']:
            if hasattr(doc['created_at'], 'isoformat'):
                doc['created_at'] = doc['created_at'].isoformat()
        if 'updated_at' in doc and doc['updated_at']:
            if hasattr(doc['updated_at'], 'isoformat'):
                doc['updated_at'] = doc['updated_at'].isoformat()
    return doc

# API Endpoints

@app.post("/api/image-analysis", response_model=ImageAnalysisResponse)
async def create_image_analysis(analysis: ImageAnalysisRequest):
    """
    Endpoint for your teammate's TSX code to submit image analysis data
    """
    try:
        # Prepare document for MongoDB
        doc = {
            "image_name": analysis.image_name,
            "analysis_type": analysis.analysis_type,
            "descriptions": analysis.descriptions,
            "metadata": analysis.metadata or {},
            "image_url": analysis.image_url,
            "image_base64": analysis.image_base64,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into MongoDB
        result = collection.insert_one(doc)
        
        # Retrieve the inserted document
        created_doc = collection.find_one({"_id": result.inserted_id})
        return serialize_doc(created_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save analysis: {str(e)}")

@app.get("/api/image-analysis", response_model=List[ImageAnalysisResponse])
async def get_all_analyses(analysis_type: Optional[str] = None, limit: int = 50):
    """
    Get all image analyses, optionally filtered by analysis type
    """
    try:
        query = {}
        if analysis_type:
            query["analysis_type"] = analysis_type
            
        cursor = collection.find(query).sort("created_at", -1).limit(limit)
        analyses = [serialize_doc(doc) for doc in cursor]
        return analyses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analyses: {str(e)}")

@app.get("/api/image-analysis/{analysis_id}", response_model=ImageAnalysisResponse)
async def get_analysis_by_id(analysis_id: str):
    """
    Get a specific image analysis by ID
    """
    try:
        doc = collection.find_one({"_id": ObjectId(analysis_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return serialize_doc(doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")

@app.get("/api/image-analysis/search/{image_name}", response_model=List[ImageAnalysisResponse])
async def search_analyses_by_name(image_name: str):
    """
    Search for analyses by image name (fuzzy search)
    """
    try:
        query = {"image_name": {"$regex": image_name, "$options": "i"}}
        cursor = collection.find(query).sort("created_at", -1)
        analyses = [serialize_doc(doc) for doc in cursor]
        return analyses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search analyses: {str(e)}")

@app.put("/api/image-analysis/{analysis_id}", response_model=ImageAnalysisResponse)
async def update_analysis(analysis_id: str, update_data: ImageAnalysisUpdate):
    """
    Update an existing image analysis
    """
    try:
        update_doc = {"updated_at": datetime.utcnow()}
        
        if update_data.descriptions is not None:
            update_doc["descriptions"] = update_data.descriptions
        if update_data.metadata is not None:
            update_doc["metadata"] = update_data.metadata
            
        result = collection.update_one(
            {"_id": ObjectId(analysis_id)}, 
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        updated_doc = collection.find_one({"_id": ObjectId(analysis_id)})
        return serialize_doc(updated_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update analysis: {str(e)}")

@app.post("/api/image-analysis", response_model=ImageAnalysisResponse)
async def create_or_update_image_analysis(analysis: ImageAnalysisRequest):
    """
    Insert new analysis or update existing one if image_name already exists.
    """
    try:
        query = {"image_name": analysis.image_name, "analysis_type": analysis.analysis_type}
        existing = collection.find_one(query)
        
        doc = {
            "image_name": analysis.image_name,
            "analysis_type": analysis.analysis_type,
            "descriptions": analysis.descriptions,
            "metadata": analysis.metadata or {},
            "image_url": analysis.image_url,
            "image_base64": analysis.image_base64,
            "updated_at": datetime.now(datetime.timezone.utc),
        }

        if existing:
            # Update existing record
            collection.update_one(query, {"$set": doc})
            updated_doc = collection.find_one(query)
            return serialize_doc(updated_doc)
        else:
            # Create new record
            doc["created_at"] = datetime.utcnow()
            result = collection.insert_one(doc)
            created_doc = collection.find_one({"_id": result.inserted_id})
            return serialize_doc(created_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save or update analysis: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Test MongoDB connection on startup
@app.on_event("startup")
async def startup_event():
    try:
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

