# Art Beyond Sight - Backend API

A FastAPI-based backend for managing image analysis data from computer vision processing and serving it to the Expo mobile app.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create/update `.env` file with:
   ```
   MONGODB_PASSWORD=your_mongodb_password_here
   ```

3. **Start the server:**
   ```bash
   python main.py
   ```
   
   The API will be available at: `http://localhost:8000`

4. **Test the API:**
   ```bash
   python test_api.py
   ```

## 📖 API Documentation

Once the server is running, visit:
- **Interactive API docs:** http://localhost:8000/docs
- **ReDoc documentation:** http://localhost:8000/redoc

## 🛠️ API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/image-analysis` | Submit new image analysis data |
| GET | `/api/image-analysis` | Get all analyses (with filters) |
| GET | `/api/image-analysis/{id}` | Get specific analysis by ID |
| GET | `/api/image-analysis/search/{name}` | Search analyses by image name |
| PUT | `/api/image-analysis/{id}` | Update existing analysis |
| DELETE | `/api/image-analysis/{id}` | Delete analysis |
| GET | `/api/health` | Health check |

### Example Usage

**Submitting image analysis (for your teammate's TSX code):**
```javascript
const analysisData = {
  "image_name": "starry_night.jpg",
  "analysis_type": "museum",
  "descriptions": [
    "A swirling night sky filled with bright stars",
    "A small village beneath rolling hills",
    "Post-impressionist painting with bold brushstrokes"
  ],
  "metadata": {
    "artist": "Vincent van Gogh",
    "year": "1889",
    "location": "MoMA",
    "tags": ["post-impressionist", "famous", "night scene"]
  }
}

// Submit to API
fetch('http://localhost:8000/api/image-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analysisData)
})
```

**Getting data for your Expo app:**
```javascript
// Get all museum analyses
fetch('http://localhost:8000/api/image-analysis?analysis_type=museum')

// Search for specific artwork
fetch('http://localhost:8000/api/image-analysis/search/starry_night')

// Get specific analysis
fetch('http://localhost:8000/api/image-analysis/60f7b2b5e4b0a3d5c8e9f1a2')
```

## 📊 Data Structure

### ImageAnalysisRequest (Input)
```json
{
  "image_name": "artwork.jpg",
  "analysis_type": "museum | text | general",
  "descriptions": ["description1", "description2"],
  "metadata": {
    "artist": "Artist Name",
    "year": "2024",
    "location": "Museum Name",
    "tags": ["tag1", "tag2"]
  },
  "image_url": "https://example.com/image.jpg",
  "image_base64": "base64_encoded_image_data"
}
```

### ImageAnalysisResponse (Output)
```json
{
  "id": "mongodb_object_id",
  "image_name": "artwork.jpg",
  "analysis_type": "museum",
  "descriptions": ["description1", "description2"],
  "metadata": {...},
  "created_at": "2024-10-25T12:00:00Z",
  "updated_at": "2024-10-25T12:00:00Z"
}
```

## 🗄️ Database Schema

**Collection:** `image_analyses`
**Database:** `art_beyond_sight`

Each document contains:
- `image_name`: Original image filename
- `analysis_type`: Type of analysis performed
- `descriptions`: Array of generated descriptions
- `metadata`: Additional information (artist, location, tags, etc.)
- `image_url`: Optional URL to the image
- `image_base64`: Optional base64 encoded image data
- `created_at`: When the analysis was created
- `updated_at`: When the analysis was last modified

## 🔧 Development

### Adding New Endpoints
1. Add your endpoint function in `main.py`
2. Use Pydantic models for request/response validation
3. Include proper error handling
4. Update this README

### Testing
- Use the interactive docs at `/docs` for manual testing
- Run `python test_api.py` for automated testing
- Check logs for debugging information

## 🚀 Deployment Considerations

1. **Environment Variables:** Ensure all sensitive data is in `.env`
2. **CORS:** Update CORS settings for production domains
3. **Database:** Consider MongoDB Atlas for production
4. **Monitoring:** Add logging and monitoring for production use
5. **Security:** Add authentication/authorization as needed

## 🤝 Integration Guide

### For Computer Vision Team (TSX)
See `example_usage.ts` for complete integration examples.

### For Expo Frontend Team
The API is designed to work seamlessly with your React Native app:
```javascript
// In your Expo app
const fetchArtworkDescriptions = async (artworkName) => {
  const response = await fetch(`${API_BASE_URL}/api/image-analysis/search/${artworkName}`);
  return await response.json();
};
```

## 📝 Notes

- The API automatically handles MongoDB ObjectId serialization
- All timestamps are in UTC
- Image data can be stored as URLs or base64 strings
- Metadata field is flexible for additional information
- Built-in validation ensures data consistency