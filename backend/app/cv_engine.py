import cv2
import numpy as np

def detect_walls_from_image(image_bytes: bytes) -> list:
    """
    Locally processes a floor plan image using adaptive thresholding, 
    morphological cleanup, and probabilistic Hough vector extraction. 
    """
    # 1. Convert raw incoming bytes into an OpenCV image matrix 
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        print("--- [ERROR] Failed to decode image bytes ---")
        return []

    # 2. Normalize Canvas Dimensions to match your 600x500 React Canvas aspect area
    target_width = 600
    target_height = 500
    img_resized = cv2.resize(img, (target_width, target_height), interpolation=cv2.INTER_AREA)

    # 3. Preprocessing: Convert to Grayscale 
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # 4. Adaptive Thresholding (Highlights solid dark structural walls) 
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 3
    )

    # 5. Morphological Operations (Cleans text, furniture lines, and connects small structural gaps) 
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

    # 6. Extract Line Vector Segments 
    # minLineLength keeps small symbols out; maxLineGap bridges broken wall segments 
    min_line_length = 25
    max_line_gap = 15
    lines = cv2.HoughLinesP(
        thresh, 
        rho=1, 
        theta=np.pi/180, 
        threshold=40, 
        minLineLength=min_line_length, 
        maxLineGap=max_line_gap
    )

    detected_walls = []

    if lines is not None:
        print(f"\n--- [LOCAL CV ENGINE] Successfully extracted {len(lines)} raw line vectors ---")
        for line in lines:
            x1, y1, x2, y2 = line[0]
            
            # Snap lines perfectly straight (Orthogonal Snapping)
            # This makes sure walls match up perfectly on a clean 90-degree 3D grid
            if abs(x2 - x1) < 15:
                x2 = x1
            elif abs(y2 - y1) < 15:
                y2 = y1

            detected_walls.append({
                "start": {"x": int(x1), "y": int(y1)},
                "end": {"x": int(x2), "y": int(y2)}
            })
    else:
        print("\n--- [LOCAL CV ENGINE] Warning: No lines detected in the processed image ---")

    print(f"--- [ENGINE COMPLETION] Dispatching {len(detected_walls)} walls to front-end UI ---\n")
    return detected_walls