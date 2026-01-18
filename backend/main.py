"""
Bangla Braille to Voice Conversion System

Thesis Project: Deep Learning Based Bangla Braille to Voice Conversion System

This FastAPI application provides RESTful services for:
1. Image upload and validation
2. Bangla Braille recognition  
3. Text-to-speech synthesis
4. End-to-end conversion pipeline

Author: [Your Name]
Thesis Supervisor: [Supervisor Name]
University: [Your University]
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import time

# Import API routers
from api.upload import router as upload_router
from api.recognize import router as recognize_router
from api.synthesize import router as synthesize_router
from api.convert import router as convert_router

# Initialize FastAPI application
app = FastAPI(
    title="Bangla Braille to Voice Conversion API",
    description="""
    ## Deep Learning Based Bangla Braille to Voice Conversion System
    
    This API provides end-to-end conversion from Bangla Braille images to synthesized speech.
    
    **Features:**
    - 🖼️ Multi-format image support (PNG, JPG, BMP, TIFF, WEBP)
    - 🔤 Bangla Unicode text recognition from Braille
    - 🗣️ High-quality Bangla text-to-speech synthesis
    - 🚀 Modular architecture for easy model replacement
    
    **Thesis Components:**
    - Mock CNN/Transformer-based Braille recognition (ready for model integration)
    - gTTS-based text-to-speech with Bangla language support
    - RESTful API design for academic demonstration
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio output
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount frontend files
app.mount("/app", StaticFiles(directory="../frontend", html=True), name="frontend")

# Include API routers
app.include_router(upload_router)
app.include_router(recognize_router)  
app.include_router(synthesize_router)
app.include_router(convert_router)

@app.get("/")
async def root():
    """
    Root endpoint with system information.
    """
    return {
        "message": "Bangla Braille to Voice Conversion System",
        "version": "1.0.0",
        "status": "operational",
        "description": "Deep Learning Based Bangla Braille to Voice Conversion System",
        "endpoints": {
            "health": "/health",
            "documentation": "/docs",
            "api_upload": "/api/upload",
            "api_recognize": "/api/recognize", 
            "api_synthesize": "/api/synthesize",
            "api_convert": "/api/convert"
        },
        "frontend": {
            "web_app": "/app",
            "note": "Visit http://localhost:8000/app for the web interface"
        }
    }

@app.get("/health")
async def health_check():
    """
    System health check endpoint.
    Returns system status and readiness information.
    """
    try:
        # Check essential directories
        required_dirs = ["uploads", "static/audio"]
        dirs_status = all(os.path.exists(dir) for dir in required_dirs)
        
        return {
            "status": "healthy" if dirs_status else "degraded",
            "timestamp": time.time(),
            "version": "1.0.0",
            "components": {
                "upload_service": "operational",
                "recognition_service": "operational (mock)",
                "tts_service": "operational",
                "file_storage": "operational" if dirs_status else "error"
            },
            "thesis_status": {
                "braille_model": "mock_implementation",
                "tts_engine": "gtts_bengali",
                "ready_for_model_integration": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

@app.get("/api/info")
async def system_info():
    """
    Detailed system information for thesis documentation.
    """
    return {
        "system": {
            "name": "Bangla Braille to Voice Conversion System",
            "type": "RESTful API Service",
            "framework": "FastAPI",
            "language": "Python"
        },
        "supported_formats": {
            "image": ["PNG", "JPG/JPEG", "BMP", "TIFF", "WEBP"],
            "audio": ["WAV", "MP3 (converted from WAV)"],
            "text_encoding": "Unicode UTF-8 (Bangla)"
        },
        "model_status": {
            "braille_recognition": {
                "current": "Mock Implementation",
                "architecture": "CNN/Transformer Placeholder",
                "ready_for_training": True,
                "input_size": "224x224 grayscale",
                "output_classes": "Bangla Unicode characters"
            },
            "text_to_speech": {
                "engine": "Google Text-to-Speech (gTTS)",
                "language": "Bengali (bn)",
                "output_format": "WAV",
                "alternative_engines": ["Coqui TTS", "Tacotron2", "Azure Cognitive Services"]
            }
        },
        "api_endpoints": {
            "upload": "POST /api/upload - Upload and validate image",
            "recognize": "POST /api/recognize - Convert Braille image to text",
            "synthesize": "POST /api/synthesize - Convert text to speech",
            "convert": "POST /api/convert - End-to-end conversion pipeline"
        }
    }

# Global exception handler for consistent error responses
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for consistent error responses.
    """
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "details": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else None,
            "timestamp": time.time()
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Application startup tasks.
    """
    print("🚀 Starting Bangla Braille to Voice Conversion System")
    print("📚 Thesis Project: Deep Learning Based Bangla Braille to Voice Conversion")
    print("🔧 Initializing services...")
    
    # Ensure required directories exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("static/audio", exist_ok=True)
    
    print("✅ System ready for operation")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")

# Shutdown event  
@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown tasks.
    """
    print("🛑 Shutting down Bangla Braille to Voice Conversion System")
    print("📝 Cleaning up resources...")

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("BANGLA BRAILLE TO VOICE CONVERSION SYSTEM")
    print("Deep Learning Based Thesis Project")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )