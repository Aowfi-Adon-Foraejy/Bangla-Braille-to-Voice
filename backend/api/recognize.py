from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
import os
from models.braille_model import BrailleRecognizer

router = APIRouter(prefix="/api", tags=["recognize"])

class RecognizeRequest(BaseModel):
    file_id: str

class RecognizeResponse(BaseModel):
    text: str
    confidence: float

@router.post("/recognize", response_model=RecognizeResponse)
async def recognize_braille(request: RecognizeRequest) -> RecognizeResponse:
    """
    Recognize Bangla Braille from uploaded image.
    Returns recognized Bangla text and confidence score.
    """
    if not request.file_id.strip():
        raise HTTPException(status_code=400, detail="File ID cannot be empty")
    
    upload_dir = "uploads"
    
    if not os.path.exists(upload_dir):
        raise HTTPException(status_code=500, detail="Upload directory not found")
    
    files = os.listdir(upload_dir)
    
    matching_file = None
    for file in files:
        if file.startswith(request.file_id):
            matching_file = os.path.join(upload_dir, file)
            break
    
    if not matching_file:
        raise HTTPException(status_code=404, detail=f"File with ID '{request.file_id}' not found")
    
    try:
        recognizer = BrailleRecognizer()
        result = recognizer.recognize(matching_file)
        
        return RecognizeResponse(
            text=result["text"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")