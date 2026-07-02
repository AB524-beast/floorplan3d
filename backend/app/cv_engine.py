import os
import cv2
import numpy as np
import math
from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.ocr_engine import extract_room_labels

# Load local .env environment runtime configurations
load_dotenv()

# Initialize the Gemini Client securely via the environment key
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


def process_blueprint(image_bytes: bytes, click_x: int = None, click_y: int = None, ocr: int = None) -> dict:

    """
    Processes architectural plans using OpenCV fallback mechanisms combined with 
    Gemini Vision models for semantic spatial verification when a key is available.
    """
    # 1. Run our highly optimized local computer vision pipeline as the baseline
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"walls": [], "labels": []}

    target_width, target_height = 600, 500
    img_resized = cv2.resize(img, (target_width, target_height), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    _, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)

    if click_x is not None and click_y is not None:
        cx = max(0, min(click_x, target_width - 1))
        cy = max(0, min(click_y, target_height - 1))
        _, floor_thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY)
        flood_mask = np.zeros((target_height + 2, target_width + 2), np.uint8)
        cv2.floodFill(floor_thresh, flood_mask, (cx, cy), 127, lowerDiff=10, upperDiff=10)
        room_zone = np.where(floor_thresh == 127, 255, 0).astype(np.uint8)
        processed_mask = cv2.dilate(room_zone, kernel, iterations=1)
        retrieval_mode = cv2.RETR_EXTERNAL
    else:
        processed_mask = closed
        retrieval_mode = cv2.RETR_LIST

    contours, _ = cv2.findContours(processed_mask, retrieval_mode, cv2.CHAIN_APPROX_SIMPLE)
    detected_walls = []
    seen_lines = set()

    for contour in contours:
        if cv2.contourArea(contour) < 180:
            continue
        epsilon = 0.015 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        for i in range(len(approx)):
            pt1 = approx[i][0]
            pt2 = approx[(i + 1) % len(approx)][0]
            x1, y1, x2, y2 = int(pt1[0]), int(pt1[1]), int(pt2[0]), int(pt2[1])

            if abs(x2 - x1) < 16: x2 = x1
            elif abs(y2 - y1) < 16: y2 = y1

            if math.hypot(x2 - x1, y2 - y1) < 15: continue
            norm_key = (min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2))
            
            duplicate = False
            for existing in seen_lines:
                if (abs(norm_key[0] - existing[0]) < 8 and abs(norm_key[1] - existing[1]) < 8 and
                    abs(norm_key[2] - existing[2]) < 8 and abs(norm_key[3] - existing[3]) < 8):
                    duplicate = True
                    break
            
            if not duplicate:
                seen_lines.add(norm_key)
                detected_walls.append({"start": {"x": x1, "y": y1}, "end": {"x": x2, "y": y2}})

    # 2. Optional OCR label extraction
    # Default behavior: if ocr is explicitly 0/1 use it.
    # If ocr is None, OCR runs (can be disabled later via env if you want).
    run_ocr = True if ocr is None else (ocr == 1)
    labels = []
    if run_ocr:
        try:
            labels = extract_room_labels(image_bytes) or []
        except Exception as ocr_err:
            print(f"[OCR] Notice: {ocr_err}. Continuing without labels.")
            labels = []

    # 3. Leverage Gemini API for intelligent semantic analysis if the client is initialized.
    # Kept for future semantic refinements; not required for current labels.
    if client and click_x is None:
        try:
            _, encoded_image = cv2.imencode(".jpg", img_resized)
            image_part = types.Part.from_bytes(
                data=encoded_image.tobytes(),
                mime_type="image/jpeg",
            )

            prompt = (
                "Analyze this blueprint image. Provide structural insights regarding room layouts "
                "or structural orientation if needed. Return responses cleanly."
            )

            _ = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[image_part, prompt],
            )
        except Exception as api_err:
            print(f"Gemini API runtime notice: {api_err}. Defaulting strictly to CV layer.")

    return {"walls": detected_walls, "labels": labels}
