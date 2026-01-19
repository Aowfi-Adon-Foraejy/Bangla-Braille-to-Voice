from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
import time
from typing import Dict

router = APIRouter(prefix="/api", tags=["upload"])

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'}
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_FILE_AGE_HOURS = 24  # Clean up files older than 24 hours

os.makedirs(UPLOAD_DIR, exist_ok=True)

def cleanup_old_files():
    """Remove files older than MAX_FILE_AGE_HOURS from uploads directory."""
    try:
        current_time = time.time()
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > MAX_FILE_AGE_HOURS * 3600:
                    os.remove(file_path)
                    print(f"Cleaned up old file: {filename}")
    except Exception as e:
        print(f"Error during cleanup: {e}")

# Run cleanup on module import
cleanup_old_files()

@router.delete("/cleanup")
async def cleanup_files() -> Dict[str, str]:
    """
    Manually trigger cleanup of old uploaded files.
    """
    try:
        cleanup_old_files()
        return {"message": "File cleanup completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Upload and validate image file.
    Returns file_id for subsequent processing.
    
    Supported formats: PNG, JPG, BMP, TIFF, WEBP
    Max file size: 10MB
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size first before reading content
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: 10MB, received: {file_size / (1024*1024):.2f}MB"
        )
    
    # Read file content
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: 10MB, received: {len(content) / (1024*1024):.2f}MB"
        )
    
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        return {
            "file_id": file_id,
            "filename": filename,
            "size_bytes": str(len(content)),
            "message": "File uploaded successfully"
        }
    except Exception as e:
        # Cleanup on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")