from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.cv_engine import detect_walls_from_image

app = FastAPI(title="FloorPlan3D Computer Vision API")

# Enable CORS so your frontend development server can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic data schemas to validate coordinates sent back to Three.js
class Point2D(BaseModel):
    x: float
    y: float

class WallSegment(BaseModel):
    start: Point2D
    end: Point2D

class DetectionResponse(BaseModel):
    success: bool
    walls: List[WallSegment]

@app.get("/")
def read_root():
    return {"message": "FloorPlan3D Computer Vision Service is running."}

@app.post("/api/auto-detect", response_model=DetectionResponse)
async def auto_detect_floorplan(file: UploadFile = File(...)):
    """
    Receives an uploaded floor plan image, passes it down to the OpenCV 
    matrix pipelines, and returns clean coordinate lists.
    """
    try:
        # Read the raw file stream into memory
        contents = await file.read()
        
        # Execute the computer vision line processing
        detected_walls = detect_walls_from_image(contents)
        
        return DetectionResponse(success=True, walls=detected_walls)
    except Exception as e:
        print(f"Server Error during parsing: {str(e)}")
        return DetectionResponse(success=False, walls=[])