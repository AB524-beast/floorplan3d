from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.cv_engine import detect_walls_from_image
from app.ocr_engine import extract_room_labels

app = FastAPI(title="FloorPlan3D Computer Vision API")

# Enable CORS parameters for Next.js app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Coordinates Data Schemas
class Point2D(BaseModel):
    x: float
    y: float

class WallSegment(BaseModel):
    start: Point2D
    end: Point2D

class RoomLabel(BaseModel):
    text: str
    position: Point2D

# Unified Response Object Schema
class DetectionResponse(BaseModel):
    success: bool
    walls: List[WallSegment]
    labels: List[RoomLabel]

@app.get("/")
def read_root():
    return {"message": "FloorPlan3D Computer Vision Service is running."}

@app.post("/api/auto-detect", response_model=DetectionResponse)
async def auto_detect_floorplan(file: UploadFile = File(...)):
    """
    Receives an uploaded floor plan image, processes vectors through 
    OpenCV, captures room layout labels via Tesseract OCR, and yields 
    a unified response object.
    """
    try:
        # Read file payload safely into buffer streams
        contents = await file.read()
        
        # 1. Pipeline execution layers
        detected_walls = detect_walls_from_image(contents)
        detected_labels = extract_room_labels(contents)
        
        # 2. Return data vectors matching our schema interface specifications
        return DetectionResponse(
            success=True, 
            walls=detected_walls,
            labels=detected_labels
        )
    except Exception as e:
        print(f"Server Error during parsing pipeline execution: {str(e)}")
        return DetectionResponse(success=False, walls=[], labels=[])