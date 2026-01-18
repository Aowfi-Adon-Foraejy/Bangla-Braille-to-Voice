# Setup & Deployment Guide

## 🔧 Complete Setup Instructions

### System Requirements
- **Python**: 3.8 or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: 500MB free space
- **OS**: Windows, macOS, or Linux
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Installation Steps

#### 1. Install Python Dependencies

```bash
# Navigate to project directory
cd "Bangla Braille to Speech"

# Install all required packages
pip install -r requirements.txt
```

**What gets installed:**
- FastAPI: Web framework for backend API
- Uvicorn: ASGI server to run FastAPI
- Pillow: Image processing
- gTTS: Google Text-to-Speech
- Pydantic: Data validation
- Others: Supporting libraries

#### 2. Verify Installation

```bash
# Check Python version
python --version

# Check pip installation
pip list | grep -E "fastapi|uvicorn|pillow|gtts"
```

#### 3. Create Necessary Directories

```bash
# Backend will auto-create these, but verify:
mkdir -p backend/uploads
mkdir -p backend/static/audio
```

### 🚀 Running the Application

#### Method 1: Development Mode (Recommended for Testing)

```bash
# Navigate to backend directory
cd backend

# Start with auto-reload
python -m uvicorn main:app --reload
```

**Terminal Output Should Show:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [PID]
🚀 Starting Bangla Braille to Voice Conversion System
✅ System ready for operation
```

#### Method 2: Production Mode

```bash
cd backend

# Run without auto-reload
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Method 3: Using Python Directly

```bash
cd backend
python main.py
```

### 📱 Accessing the Application

**Option 1: Frontend through Frontend Directory**
- Open file: `frontend/index.html` in browser
- Pros: Instant, offline preview
- Cons: No CORS integration, local file access only

**Option 2: Frontend through Backend Server (Best)**
- URL: `http://localhost:8000/app`
- Pros: Full integration, proper API communication
- Cons: Requires backend running

**Option 3: Interactive API Docs**
- URL: `http://localhost:8000/docs` (Swagger UI)
- URL: `http://localhost:8000/redoc` (ReDoc)
- Use to test endpoints directly

**Option 4: System Info**
- URL: `http://localhost:8000`
- URL: `http://localhost:8000/health`
- Check system status and component health

### 🧪 Testing the Setup

#### Test 1: Health Check
```bash
# Should return system status
curl http://localhost:8000/health
```

#### Test 2: API Documentation
```
Visit: http://localhost:8000/docs
- You should see all available API endpoints
- Can test each endpoint interactively
```

#### Test 3: File Upload & Conversion
```bash
# Create a test image or use existing
curl -X POST "http://localhost:8000/api/convert" \
  -F "file=@test_image.png"
```

#### Test 4: Frontend Upload
1. Open http://localhost:8000/app
2. Click "Select File"
3. Choose an image (PNG, JPG, etc.)
4. Click "Convert to Voice"
5. Wait for results
6. Check audio playback and text display

## 🎯 Verification Checklist

Before moving forward, verify:

- [ ] Python installed and correct version
- [ ] All dependencies installed successfully
- [ ] `backend/uploads` directory exists
- [ ] `backend/static/audio` directory exists
- [ ] Backend starts without errors
- [ ] `http://localhost:8000/health` returns 200 OK
- [ ] `http://localhost:8000/docs` loads API documentation
- [ ] `http://localhost:8000/app` loads frontend interface
- [ ] Can select and upload an image
- [ ] Conversion produces results (text + audio)
- [ ] Downloaded files work correctly

## 📊 Development Workflow

### Start a Development Session

```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 2: View Frontend (Optional - Python server)
cd frontend
python -m http.server 8001
```

### During Development

1. **Backend Changes**: Uvicorn auto-reloads on file changes
2. **Frontend Changes**: Refresh browser to see updates
3. **API Testing**: Use http://localhost:8000/docs

### Logs & Debugging

**Backend Logs Location:**
- Console where uvicorn is running
- Shows request/response details
- Model inference messages

**Browser Console:**
- Press F12 → Console tab
- JavaScript errors
- Network request details

**Check Specific Issues:**

```bash
# View recent uploads
ls -la backend/uploads/

# View generated audio files
ls -la backend/static/audio/

# Check specific log level
python -m uvicorn main:app --log-level debug
```

## 🔄 Redeploying After Changes

### After Modifying Backend Code
```bash
# Uvicorn auto-reloads with --reload flag
# Just save the file and refresh browser
```

### After Modifying Frontend Code
```bash
# Manually refresh browser (F5 or Ctrl+R)
# Or clear cache: Ctrl+Shift+Delete
```

### After Modifying Dependencies
```bash
# Stop backend (Ctrl+C)
pip install -r requirements.txt
# Restart backend
python -m uvicorn main:app --reload
```

## 🚨 Troubleshooting Common Issues

### Issue: "Port 8000 already in use"
```bash
# Solution 1: Use different port
python -m uvicorn main:app --port 8001

# Solution 2: Kill process using port
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Issue: "Module not found" errors
```bash
# Reinstall packages
pip install --upgrade pip
pip install -r requirements.txt

# Check installation
python -c "import fastapi; print('FastAPI OK')"
```

### Issue: "Cannot connect to localhost:8000"
```bash
# Check if backend is running
# Check firewall settings
# Try: http://127.0.0.1:8000 instead

# Windows specific - check if Python is in PATH
python --version
```

### Issue: Frontend gets CORS errors
```bash
# Backend already has CORS enabled
# Try accessing from: http://localhost:8000/app
# Not from: file://path/to/frontend/index.html
```

### Issue: Audio files not generated
```bash
# Check directory permissions
ls -la backend/static/audio/

# Check gTTS internet connection (required)
# gTTS needs internet to generate speech
```

### Issue: Uploaded images disappear
```bash
# Check uploads directory
ls -la backend/uploads/

# Files are stored temporarily
# Delete manually or wait for cleanup:
python -c "from models.tts_model import TextToSpeech; TextToSpeech().cleanup_old_files()"
```

## 📈 Performance Tuning

### For Better Performance

```bash
# Use multiple workers
python -m uvicorn main:app --workers 4

# Adjust chunk size for uploads
# (Edit in upload.py if needed)

# Enable caching (for static files)
# Already configured in main.py
```

### Monitor Resource Usage

```bash
# Windows - Task Manager
taskmgr

# macOS - Activity Monitor
open /Applications/Utilities/Activity\ Monitor.app

# Linux - top or htop
top
# or
htop
```

## 🔐 Security Notes

### For Local Development (Current Setup)
- CORS is open to all origins (development only)
- No authentication required (development only)
- File uploads limited to 10MB
- Allowed file types: PNG, JPG, BMP, TIFF, WEBP

### For Production Deployment
1. Enable authentication
2. Restrict CORS to specific origins
3. Use HTTPS/SSL certificates
4. Implement rate limiting
5. Add request validation
6. Set up logging and monitoring
7. Use environment variables for sensitive data

See [Production Deployment Tips](#production-deployment-tips)

## 📦 Production Deployment Tips

### Before Production

1. **Install Production Server**
   ```bash
   pip install gunicorn
   ```

2. **Create .env file**
   ```
   DEBUG=false
   WORKERS=4
   ```

3. **Use Gunicorn + Uvicorn**
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

4. **Setup Reverse Proxy**
   - Use Nginx or Apache
   - SSL/TLS certificates
   - Load balancing

5. **Database & Storage**
   - Move uploads to cloud storage (AWS S3, etc.)
   - Setup proper backup strategy

6. **Monitoring**
   ```bash
   pip install prometheus-client
   # Add monitoring endpoints
   ```

### Deployment Platforms

**Heroku:**
```bash
pip freeze > requirements.txt
echo "web: gunicorn main:app" > Procfile
git push heroku main
```

**AWS:**
- Elastic Beanstalk
- EC2 + Docker
- Lambda + API Gateway

**Docker:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

## 🎓 Integration with Models

### When Ready with Your Models

1. **Stop backend** (Ctrl+C)
2. **Update model files** per [MODEL_INTEGRATION_GUIDE.md](MODEL_INTEGRATION_GUIDE.md)
3. **Modify braille_model.py** with your CNN/Transformer
4. **Modify tts_model.py** with your TTS engine
5. **Update requirements.txt** if new dependencies
6. **Reinstall** `pip install -r requirements.txt`
7. **Restart backend**
8. **Run tests** from [TESTING_GUIDE.md](TESTING_GUIDE.md)

## 📝 Next Steps

1. ✅ **Setup Complete** - Run the application
2. 📖 **Read Docs** - Check [QUICKSTART.md](QUICKSTART.md)
3. 🧪 **Test System** - Follow [TESTING_GUIDE.md](TESTING_GUIDE.md)
4. 🤖 **Add Models** - Use [MODEL_INTEGRATION_GUIDE.md](MODEL_INTEGRATION_GUIDE.md)
5. 🚀 **Deploy** - Follow deployment tips above

## ✅ Setup Complete!

Your system is now ready for:
- ✨ Development and testing
- 📊 API experimentation
- 🎓 Model integration
- 🔬 Research and evaluation

Start the backend and visit **http://localhost:8000/app** to begin!

---

**Need Help?** Check the troubleshooting section or review the other documentation files.
