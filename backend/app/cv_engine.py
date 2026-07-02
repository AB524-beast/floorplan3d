import cv2
import numpy as np

def detect_walls_from_image(image_bytes: bytes) -> list:
    """
    Finds thick wall areas, traces their outlines, and simplifies them 
    into clean, connected architectural vectors.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    target_width = 600
    target_height = 500
    img_resized = cv2.resize(img, (target_width, target_height), interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # Threshold to isolate black wall structures
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 21, 4
    )

    # Use a large kernel morph operation to fuse separate inner/outer wall faces into solid shapes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_walls = []

    for contour in contours:
        area = cv2.contourArea(contour)
        # Drop text character noise and tiny artifacts safely
        if area < 400:
            continue

        # Douglas-Peucker simplification to turn jagged pixel outlines into crisp straight vertices
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # Walk through the simplified vertices and create connecting structural spans
        num_points = len(approx)
        if num_points < 2:
            continue

        for i in range(num_points):
            pt1 = approx[i][0]
            pt2 = approx[(i + 1) % num_points][0] # Loop back to close the shape profile

            x1, y1 = int(pt1[0]), int(pt1[1])
            x2, y2 = int(pt2[0]), int(pt2[1])

            # Snap to straight 90-degree lines if they are nearly horizontal or vertical
            if abs(x2 - x1) < 20:
                x2 = x1
            elif abs(y2 - y1) < 20:
                y2 = y1

            # Only add lines that have a meaningful length to prevent overlapping clusters
            if Math.hypot(x2 - x1, y2 - y1) > 25:
                detected_walls.append({
                    "start": {"x": x1, "y": y1},
                    "end": {"x": x2, "y": y2}
                })

    return detected_walls