# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd "Bangla Braille to Speech"
pip install -r requirements.txt
```

### Step 2: Start the Backend
```bash
cd backend
python -m uvicorn main:app --reload
```

You should see:
```
🚀 Starting Bangla Braille to Voice Conversion System
📚 Thesis Project: Deep Learning Based Bangla Braille to Voice Conversion
🔧 Initializing services...
✅ System ready for operation
📖 API Documentation: http://localhost:8000/docs
🔍 Health Check: http://localhost:8000/health
INFO:     Application startup complete.
```

### Step 3: Open the Frontend

**Option 1: Direct File (Offline)**
- Open `frontend/index.html` directly in your browser
- Works offline for UI preview

**Option 2: Through Backend Server (Recommended)**
- Visit: http://localhost:8000/app
- Full frontend with API integration

**Option 3: Live Preview**
- Visit: http://localhost:8000
- Redirects to root endpoint with system info

### Step 4: Test the System

1. **Check Health**
   ```
   Visit: http://localhost:8000/health
   ```

2. **View API Documentation**
   ```
   Visit: http://localhost:8000/docs
   ```

3. **Upload an Image**
   - Click "Select File" in the frontend
   - Choose a test image (PNG, JPG, etc.)
   - Click "Convert to Voice"

4. **See Results**
   - Recognized Bangla text displays
   - Audio player shows up
   - Download options available

## 📁 Project Structure at a Glance

```
Bangla Braille to Speech/
├── backend/
│   ├── api/
│   │   ├── upload.py       ← Handles file uploads
│   │   ├── recognize.py    ← Braille recognition
│   │   ├── synthesize.py   ← Text-to-speech
│   │   └── convert.py      ← Full pipeline
│   ├── models/
│   │   ├── braille_model.py    ← Recognition model
│   │   └── tts_model.py        ← TTS model
│   ├── main.py             ← FastAPI app entry
│   ├── uploads/            ← Temp image storage
│   └── static/audio/       ← Generated audio files
│
├── frontend/
│   ├── index.html          ← Main UI
│   ├── app.js              ← JavaScript logic
│   └── style.css           ← Styling
│
├── requirements.txt        ← Python dependencies
├── README.md              ← Full documentation
├── TESTING_GUIDE.md       ← How to test
└── MODEL_INTEGRATION_GUIDE.md ← Model setup

```

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the project root:

```
DEBUG=false
API_HOST=localhost
API_PORT=8000
UPLOAD_DIR=backend/uploads
AUDIO_DIR=backend/static/audio
```

### Frontend Configuration
Edit `API_BASE_URL` in `frontend/app.js`:

```javascript
// Change this line to match your backend
const API_BASE_URL = 'http://localhost:8000';
```

## 📊 System Status

### Check Health
```bash
curl http://localhost:8000/health
```

### View System Info
```bash
curl http://localhost:8000/api/info
```

### View API Endpoints
Visit: http://localhost:8000/docs

## 🎯 First Test

### Upload and Convert Test
```bash
# Find a test image or create one
# Then run:

curl -X POST "http://localhost:8000/api/convert" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_image.png"
```

Expected output:
```json
{
    "text": "বাংলা টেক্সট",
    "audio_url": "/static/audio/tts_abc123.mp3",
    "confidence": 0.87,
    "duration": 3.2
}
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Use a different port
python -m uvicorn main:app --reload --port 8001
```

### CORS Errors in Browser
- Check that frontend URL matches API URL
- Backend has CORS enabled for all origins
- Try opening from `http://localhost:8000/app`

### Dependencies Installation Issues
```bash
# Update pip first
pip install --upgrade pip

# Try installing with no cache
pip install --no-cache-dir -r requirements.txt
```

### No Audio Directory
```bash
# Backend creates these automatically, but if needed:
mkdir -p backend/static/audio
mkdir -p backend/uploads
```

## 📚 Next Steps

1. **Understand the System**: Read [README.md](README.md)
2. **Integrate Your Models**: Follow [MODEL_INTEGRATION_GUIDE.md](MODEL_INTEGRATION_GUIDE.md)
3. **Run Tests**: See [TESTING_GUIDE.md](TESTING_GUIDE.md)
4. **Deploy**: Prepare for production deployment

## 🎓 Frontend Features

### User Actions
- **Select Image**: Click button or drag & drop
- **View Preview**: See uploaded image with details
- **Convert**: Single button converts to speech
- **Copy Text**: Copy Bangla text to clipboard
- **Download**: Save text and audio files
- **Share**: Share results (if browser supports)

### Keyboard Shortcuts
- **Ctrl/Cmd + O**: Open file picker
- **Escape**: Reset the app
- **Enter** (with image): Start conversion

### Error Messages
- Invalid file format
- File too large
- Server not responding
- Recognition failed
- Synthesis failed

## 📞 Support

### API Documentation
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Format**: http://localhost:8000/redoc

### Backend Logs
- Check terminal where `uvicorn` is running
- Shows request/response details
- Model inference logs

### Browser Console
- Open browser developer tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API calls

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Requirements installed successfully
- [ ] Backend starts without errors
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:8000/docs
- [ ] Frontend loads (direct or through /app)
- [ ] Can select and upload image
- [ ] Conversion completes (shows results)
- [ ] Audio player works
- [ ] Can download files

## 🎉 Success!

If you've completed the checklist above, your system is working! 

### Now you can:
1. Test the system with different images
2. Review API documentation
3. Integrate your own trained models
4. Deploy to a server
5. Customize the UI/UX

For advanced setup and model integration, see [MODEL_INTEGRATION_GUIDE.md](MODEL_INTEGRATION_GUIDE.md)

---

**Questions?** Check the [README.md](README.md) or [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed information.
