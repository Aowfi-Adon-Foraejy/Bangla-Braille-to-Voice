from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from models.tts_model import TextToSpeech

router = APIRouter(prefix="/api", tags=["synthesize"])

class SynthesizeRequest(BaseModel):
    text: str

class SynthesizeResponse(BaseModel):
    audio_url: str
    duration: float

@router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_speech(request: SynthesizeRequest) -> SynthesizeResponse:
    """
    Convert Bangla text to speech.
    Returns audio file URL and duration.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        tts = TextToSpeech()
        result = tts.synthesize(request.text)
        
        return SynthesizeResponse(
            audio_url=result["audio_url"],
            duration=result["duration"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")