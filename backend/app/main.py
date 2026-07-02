import os
import uuid
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn

from app.cv_engine import process_blueprint

app = FastAPI(title="Architectural AI Extrusion Engine", version="1.0.0")

# CORS: configurable for local dev + production.
# - Set CORS_ORIGINS="http://localhost:3000,https://your-domain.com"
# - If missing, allow localhost:3000 by default.
_default_origins = ["http://localhost:3000"]
_cors_origins_env = os.getenv("CORS_ORIGINS")
_allow_origins = (
    [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
    if _cors_origins_env
    else _default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auto-detect")
async def auto_detect_blueprint(
    file: UploadFile = File(...),
    click_x: Optional[int] = Query(None, description="X coordinate for region flood fill"),
    click_y: Optional[int] = Query(None, description="Y coordinate for region flood fill"),
    ocr: Optional[int] = Query(None, description="Enable OCR labels (1/0). If omitted, uses server default."),
):
    request_id = str(uuid.uuid4())
    try:
        image_bytes = await file.read()
        result = process_blueprint(image_bytes, click_x, click_y, ocr=ocr)

        # Robust response shape
        return {
            "success": True,
            "request_id": request_id,
            "walls": result.get("walls", []) or [],
            "labels": result.get("labels", []) or [],
        }
    except Exception as e:
        return {
            "success": False,
            "request_id": request_id,
            "error": str(e),
        }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
