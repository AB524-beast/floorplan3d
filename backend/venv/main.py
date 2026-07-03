import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Initialize FastAPI Application
app = FastAPI(
    title="FloorPlan3D Computer Vision Service",
    description="REST API endpoint for image preprocessing, line detection, and OCR extraction."
)

# Enable CORS so your Next.js local frontend (typically port 3000) can securely make API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your specific Vercel deployment URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Data Validation
class RoomData(BaseModel):
    label: str
    dimensions: str
    confidence: float

class FloorPlanAnalysisResponse(BaseModel):
    rooms: List[RoomData]
    status: str

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "FloorPlan3D CV Service is running!"}

@app.post("/analyze", response_model=FloorPlanAnalysisResponse)
async def analyze_floorplan(file: UploadFile = File(...)):
    """
    Endpoint to receive a floorplan image file, run CV contour/line detection,
    and utilize OCR to parse room names and dimensions.
    """
    # 1. Validate that the uploaded file is a supported image format
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG and PNG images are supported."
        )
    
    try:
        # 2. Read the binary file stream into a NumPy buffer for OpenCV processing
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode the uploaded image file.")

        # 3. OpenCV Structural Processing (Placeholder)
        # Convert to grayscale to prep for contour analysis and skeletonization
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # TODO: Add your cv2.HoughLinesP or cv2.findContours logic here to extract walls.

        # 4. EAST DNN & Tesseract OCR Processing (Placeholder)
        # TODO: Implement EAST text detector model parsing to isolate text bounding boxes.
        # TODO: Feed bounding boxes into Tesseract OCR to read labels/dimensions.
        
        # Mock structural output matching the Pydantic schema for testing the frontend pipeline
        mock_detected_rooms = [
            RoomData(label="Living Room", dimensions="4.5m x 5.0m", confidence=0.94),
            RoomData(label="Kitchen", dimensions="3.0m x 3.5m", confidence=0.89),
            RoomData(label="Master Bedroom", dimensions="4.0m x 4.2m", confidence=0.96)
        ]

        return FloorPlanAnalysisResponse(rooms=mock_detected_rooms, status="success")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during processing: {str(e)}")