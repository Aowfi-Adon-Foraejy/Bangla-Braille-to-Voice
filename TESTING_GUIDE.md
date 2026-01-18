# Frontend-Backend Integration Tests

## Prerequisites
1. Backend running: `python -m uvicorn backend.main:app --reload`
2. Frontend accessible at: `file:///path/to/frontend/index.html` or through `http://localhost:8000`

## Test Cases

### 1. Health Check
```bash
curl http://localhost:8000/health
```
**Expected Response**: 
```json
{
    "status": "healthy",
    "version": "1.0.0",
    "components": {
        "upload_service": "operational",
        "recognition_service": "operational (mock)",
        "tts_service": "operational",
        "file_storage": "operational"
    }
}
```

### 2. System Info
```bash
curl http://localhost:8000/api/info
```
**Expected**: Returns system information and model status

### 3. File Upload
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.png"
```
**Expected Response**:
```json
{
    "file_id": "uuid-string",
    "filename": "uuid-string.png",
    "size_bytes": 12345,
    "message": "File uploaded successfully"
}
```

### 4. Complete Conversion Pipeline
```bash
curl -X POST "http://localhost:8000/api/convert" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.png"
```
**Expected Response**:
```json
{
    "text": "বাংলা",
    "audio_url": "/static/audio/tts_abcd1234.mp3",
    "confidence": 0.87,
    "duration": 2.5
}
```

### 5. Frontend Testing Checklist

#### Upload Section
- [ ] Can select file with button click
- [ ] Can drag and drop files
- [ ] Shows file preview after selection
- [ ] Displays file name and size
- [ ] Shows error for invalid file types
- [ ] Shows error for files > 10MB

#### Conversion Process
- [ ] Conversion button is clickable
- [ ] Shows processing animation
- [ ] Updates progress bar
- [ ] Updates status messages
- [ ] Completes without errors

#### Results Display
- [ ] Shows recognized Bangla text
- [ ] Shows confidence score
- [ ] Audio player works with controls
- [ ] Can copy text to clipboard
- [ ] Can download text file
- [ ] Can download audio file

#### Error Handling
- [ ] Shows error messages clearly
- [ ] Provides "Try Again" button
- [ ] Maintains user data after error
- [ ] Network error handling

#### Browser Compatibility
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 6. Performance Testing

#### Benchmark Tests
```python
import time
import requests

# Test API response time
start = time.time()
response = requests.post('http://localhost:8000/api/convert', 
                        files={'file': open('test.png', 'rb')})
elapsed = time.time() - start
print(f"API Response Time: {elapsed:.2f}s")
```

**Target**: < 6 seconds total

### 7. Error Scenarios

#### Invalid File Format
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@document.txt"
```
**Expected**: 400 error - "Unsupported file format"

#### File Too Large
```bash
# Create a large file > 10MB
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@large_file.png"
```
**Expected**: 413 error - "File too large"

#### Empty File
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@empty.png"
```
**Expected**: 400 error

#### Missing File ID in Recognize
```bash
curl -X POST "http://localhost:8000/api/recognize" \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected**: 400 error - "File ID cannot be empty"

### 8. Logging and Debugging

#### Enable Debug Mode
Set environment variable:
```bash
export DEBUG=true
python -m uvicorn backend.main:app --reload --log-level=debug
```

#### Check Logs
- Server startup messages
- Request/response timing
- Error stack traces
- Model inference logs

### 9. Load Testing

#### Simple Load Test
```bash
# Using Apache Bench (ab)
ab -n 10 -c 2 http://localhost:8000/health

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8000/health
```

### 10. API Documentation Testing

1. Visit: `http://localhost:8000/docs`
2. Test each endpoint interactively
3. Verify request/response schemas
4. Check error responses

## Troubleshooting

### Issue: CORS Errors
**Solution**: Backend has CORS enabled for all origins
- Check browser console for specific errors
- Verify API URL matches backend host

### Issue: File Upload Fails
**Solution**: Check upload directory
```bash
# Verify directory exists
ls -la backend/uploads/
ls -la backend/static/audio/
```

### Issue: Audio Not Playing
**Solution**: 
- Check static files are served correctly
- Verify audio file format is supported
- Check browser console for errors

### Issue: Slow Response Time
**Solution**:
- Mock models are intentionally simple
- Actual trained models may be slower
- Consider async processing for large files

## Integration Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Health check returns 200 OK
- [ ] File upload works
- [ ] Complete pipeline works end-to-end
- [ ] Error messages display correctly
- [ ] UI responds to all inputs
- [ ] Audio playback works
- [ ] Export functions work
- [ ] Keyboard shortcuts work (Ctrl+O, Escape, Enter)

## Next Steps After Models Are Ready

1. Replace mock models with trained models
2. Update model paths in braille_model.py and tts_model.py
3. Adjust preprocessing parameters
4. Rerun all tests with actual models
5. Benchmark performance with real models
6. Deploy to production server

## Resources

- **API Docs**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health
- **System Info**: http://localhost:8000/api/info
