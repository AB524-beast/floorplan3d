import cv2
import numpy as np
import pytesseract

# Explicitly link pytesseract to your physical computer application location
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_room_labels(image_bytes: bytes) -> list:
    """
    Processes image bytes to isolate text regions using OpenCV and 
    extracts string metadata using Tesseract OCR.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    # Target dimensions required by standard EAST models (must be multiples of 32)
    target_w, target_h = 320, 320
    h, w, _ = img.shape
    rW = w / float(target_w)
    rH = h / float(target_h)

    # Preprocessing: Grayscale & Otsu Thresholding for standard local fallback
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # Find text contours/bounding boxes (local structural analysis fallback)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    extracted_labels = []

    for contour in contours:
        x, y, w_box, h_box = cv2.boundingRect(contour)
        
        # Filter for typical text/label bounding box ratios
        if 10 < w_box < 150 and 10 < h_box < 40:
            # Crop the word snippet out of the gray image channel
            roi = gray[y:y+h_box, x:x+w_box]
            
            # Run Tesseract OCR configuration engine on the localized region snippet
            # --psm 6 assumes a single uniform block of text
            config = ("-l eng --oem 3 --psm 6")
            try:
                text = pytesseract.image_to_string(roi, config=config).strip()
                if len(text) > 2: # Keep clean strings
                    extracted_labels.append({
                        "text": text,
                        "position": {"x": int(x + w_box/2), "y": int(y + h_box/2)}
                    })
            except Exception:
                # Fallback if tesseract path isn't globally bound locally yet
                continue

    print(f"--- [OCR ENGINE] Located {len(extracted_labels)} floor plan room labels ---")
    return extracted_labels