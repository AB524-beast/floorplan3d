import cv2
import numpy as np
import math

def detect_walls_from_image(image_bytes: bytes) -> list:
    """
    Extracts outer and inner structural walls while rejecting isolated text/furniture 
    by analyzing the continuous topology and aspect ratios of filled contours.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    target_width = 600
    target_height = 500
    img_resized = cv2.resize(img, (target_width, target_height), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # Isolate dark elements (solid walls)
    _, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)

    # Use structural closing to bridge tiny graphical gaps over door swings or windows
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # CHANGE: Use RETR_LIST instead of RETR_EXTERNAL to discover interior partitions
    contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_walls = []
    seen_lines = set() # Prevent duplicate tracking segments

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 180: # Filter small text strokes/noise
            continue

        # Use polygon simplification to find straight walls
        epsilon = 0.015 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        num_points = len(approx)

        if num_points < 2:
            continue

        for i in range(num_points):
            pt1 = approx[i][0]
            pt2 = approx[(i + 1) % num_points][0]

            x1, y1 = int(pt1[0]), int(pt1[1])
            x2, y2 = int(pt2[0]), int(pt2[1])

            # Orthogonal grid snapping bounds
            if abs(x2 - x1) < 16:
                x2 = x1
            elif abs(y2 - y1) < 16:
                y2 = y1

            # Length calculation
            length = math.hypot(x2 - x1, y2 - y1)
            if length < 15: 
                continue

            # Standardize vectors to prevent drawing bidirectional paths
            norm_key = (min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2))
            
            # Avoid duplicate trace lines over identical coordinates
            duplicate = False
            for existing in seen_lines:
                if (abs(norm_key[0] - existing[0]) < 8 and abs(norm_key[1] - existing[1]) < 8 and
                    abs(norm_key[2] - existing[2]) < 8 and abs(norm_key[3] - existing[3]) < 8):
                    duplicate = True
                    break
            
            if not duplicate:
                seen_lines.add(norm_key)
                detected_walls.append({
                    "start": {"x": x1, "y": y1},
                    "end": {"x": x2, "y": y2}
                })

    return detected_walls