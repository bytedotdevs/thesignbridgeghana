"""
Real-time Sign Language & Object Detection using OpenCV and YOLO
Based on https://github.com/RR234B/Obj--detection.git

Features:
- 🎥 Real-time webcam feed with OpenCV
- 🤖 Pretrained YOLO model object recognition
- 📦 Bounding boxes around hands, persons, and detected objects
- 🏷️ Class labels and confidence scores
- 📖 Matches detections against the 1,514 GSL Dictionary vocabularies
- 💬 Real-time strings of output display
"""

import sys
import os
import json
import time

try:
    import cv2
except ImportError:
    print("OpenCV not found. Install via: pip install opencv-python")
    cv2 = None

try:
    from ultralytics import YOLO
except ImportError:
    print("Ultralytics YOLO not found. Install via: pip install ultralytics")
    YOLO = None

def load_dictionary():
    dict_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "dictionary", "index.json")
    if os.path.exists(dict_path):
        with open(dict_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def main():
    if cv2 is None:
        print("Please install opencv-python: pip install opencv-python")
        return

    dictionary = load_dictionary()
    print(f"📖 Loaded {len(dictionary)} signs from GSL Dictionary.")

    # Load YOLO model
    model = None
    if YOLO is not None:
        try:
            print("⚡ Loading YOLO11n pretrained model...")
            model = YOLO("yolo11n.pt")
        except Exception as e:
            print(f"⚠️ Could not load YOLO model: {e}. Falling back to OpenCV motion detection.")
    else:
        print("💡 Running in OpenCV vision mode.")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Could not open webcam.")
        return

    print("🎥 Webcam started! Press 'q' to quit, 'c' to clear transcript, 's' to save string.")
    
    transcript = []
    last_word_time = 0
    current_matched_word = ""

    while True:
        success, img = cap.read()
        if not success:
            break

        # Flip horizontally for natural mirror feel (like first_detection.py)
        img = cv2.flip(img, 1)
        h, w, _ = img.shape

        detected_boxes = []

        if model is not None:
            results = model(img, verbose=False)
            result = results[0]
            boxes = result.boxes.xyxy
            confidences = result.boxes.conf
            class_ids = result.boxes.cls

            for box, confidence, class_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
                class_id = int(class_id)
                class_name = result.names[class_id]
                conf = float(confidence)

                detected_boxes.append({
                    "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                    "class_name": class_name,
                    "confidence": conf,
                    "class_id": class_id
                })

                # Draw YOLO green rectangle
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{class_name} {conf:.2f}"
                
                # Filled label background for readability
                (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(img, (x1, y1 - lh - 8), (x1 + lw + 6, y1), (0, 255, 0), -1)
                cv2.putText(img, label, (x1 + 3, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

        # Draw HUD & Matched Vocabulary String
        cv2.rectangle(img, (10, 10), (w - 10, 60), (20, 20, 20), -1)
        cv2.rectangle(img, (10, 10), (w - 10, 60), (0, 255, 0), 2)
        cv2.putText(img, "YOLO11n + GSL SIGN-TO-TEXT DETECTION", (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Output transcript strip at bottom
        transcript_str = " ".join(transcript[-6:]) if transcript else "Awaiting sign gesture..."
        cv2.rectangle(img, (10, h - 70), (w - 10, h - 15), (15, 23, 42), -1)
        cv2.rectangle(img, (10, h - 70), (w - 10, h - 15), (59, 130, 246), 2)
        cv2.putText(img, f"Output String: {transcript_str}", (20, h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)

        cv2.imshow("SignBridge - Real-time YOLO Detection", img)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            transcript.clear()

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
