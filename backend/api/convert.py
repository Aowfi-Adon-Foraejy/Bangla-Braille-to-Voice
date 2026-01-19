from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict
import os
import uuid
import time
from models.braille_model import BrailleRecognizer
from models.tts_model import TextToSpeech

router = APIRouter(prefix="/api", tags=["convert"])

# Constants for file management
UPLOAD_DIR = "uploads"
MAX_FILE_AGE_HOURS = 24

def cleanup_old_files():
    """Remove files older than MAX_FILE_AGE_HOURS from uploads directory."""
    try:
        current_time = time.time()
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                file_path = os.path.join(UPLOAD_DIR, filename)
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getctime(file_path)
                    if file_age > MAX_FILE_AGE_HOURS * 3600:
                        os.remove(file_path)
                        print(f"Cleaned up old file: {filename}")
    except Exception as e:
        print(f"Error during cleanup: {e}")

class ConvertResponse(BaseModel):
    text: str
    audio_url: str
    confidence: float
    duration: float

@router.post("/convert", response_model=ConvertResponse)
async def convert_image_to_speech(file: UploadFile = File(...)) -> ConvertResponse:
    """
    Full pipeline: Image → Bangla Text → Speech
    Upload image, recognize Braille, and synthesize speech.
    """
    # Run cleanup before processing
    cleanup_old_files()
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Validate image format
    allowed_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format. Allowed: {', '.join(allowed_extensions)}"
        )
    
# Save uploaded file
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    upload_path = os.path.join("uploads", filename)
    
    try:
        # Check file size before reading
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: 10MB, received: {file_size / (1024*1024):.2f}MB"
            )
        
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Step 1: Braille Recognition
        recognizer = BrailleRecognizer()
        recognition_result = recognizer.recognize(upload_path)
        
        # Step 2: Text-to-Speech
        tts = TextToSpeech()
        synthesis_result = tts.synthesize(recognition_result["text"])
        
        return ConvertResponse(
            text=recognition_result["text"],
            audio_url=synthesis_result["audio_url"],
            confidence=recognition_result["confidence"],
            duration=synthesis_result["duration"]
        )
        
    except Exception as e:
        # Cleanup on failure
        if os.path.exists(upload_path):
            os.remove(upload_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")