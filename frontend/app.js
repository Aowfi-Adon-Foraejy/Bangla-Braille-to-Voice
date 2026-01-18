// Bangla Braille to Voice Conversion System - Frontend JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const statusSection = document.getElementById('statusSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const banglaText = document.getElementById('banglaText');
const audioPlayer = document.getElementById('audioPlayer');
const confidenceBadge = document.getElementById('confidenceBadge');
const durationBadge = document.getElementById('durationBadge');

// Global variables
let selectedFile = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkServerHealth();
});

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// File Handling Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
        showError('Invalid File Type', 'Please select a valid image file (PNG, JPG, BMP, TIFF, WEBP)');
        return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('File Too Large', 'Please select an image smaller than 10MB');
        return;
    }
    
    selectedFile = file;
    displayImagePreview(file);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        
        // Display file info
        const fileSize = (file.size / 1024).toFixed(2);  // Convert to KB
        const previewInfo = document.getElementById('previewInfo');
        previewInfo.textContent = `${file.name} • ${fileSize} KB`;
        
        uploadArea.querySelector('.upload-content').style.display = 'none';
        imagePreview.style.display = 'flex';
        imagePreview.classList.add('fade-in');
    };
    
    reader.readAsDataURL(file);
}

function clearImage() {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    uploadArea.querySelector('.upload-content').style.display = 'flex';
    imagePreview.style.display = 'none';
    hideAllSections();
}

// API Functions
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error('Server not responding');
        }
        console.log('✅ Server is healthy');
    } catch (error) {
        console.error('❌ Server health check failed:', error);
        showError('Server Error', 'Unable to connect to the server. Please ensure the backend is running on localhost:8000');
    }
}

async function convertImage() {
    if (!selectedFile) {
        showError('No File Selected', 'Please select an image file first');
        return;
    }
    
    // Disable button during conversion
    const convertBtn = document.getElementById('convertBtn');
    const originalText = convertBtn.textContent;
    convertBtn.disabled = true;
    convertBtn.textContent = '⏳ Processing...';
    
    showProcessing();
    updateStatus('Uploading Image', 'Processing your Braille image...');
    updateProgress(20);
    
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Call convert API (full pipeline)
        const response = await fetch(`${API_BASE_URL}/api/convert`, {
            method: 'POST',
            body: formData,
            timeout: 60000 // 60 second timeout
        });
        
        updateProgress(50);
        updateStatus('Recognizing Braille', 'Converting Braille patterns to Bangla text...');
        
        if (!response.ok) {
            let errorMessage = 'Conversion failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                // If response body is not JSON, use default message
            }
            throw new Error(errorMessage);
        }
        
        updateProgress(80);
        updateStatus('Synthesizing Speech', 'Generating Bangla speech from recognized text...');
        
        const result = await response.json();
        updateProgress(100);
        
        // Save to history
        saveToHistory(result);
        
        // Display results
        setTimeout(() => {
            displayResults(result);
        }, 500);
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError('Conversion Failed', error.message || 'An error occurred during image conversion. Please try again.');
    } finally {
        // Re-enable button
        convertBtn.disabled = false;
        convertBtn.textContent = originalText;
    }
}

function displayResults(result) {
    hideAllSections();
    
    // Update text result
    banglaText.textContent = result.text || 'No text recognized';
    confidenceBadge.textContent = `${Math.round((result.confidence || 0) * 100)}%`;
    
    // Update audio result
    if (result.audio_url) {
        audioPlayer.src = API_BASE_URL + result.audio_url;
        durationBadge.textContent = formatDuration(result.duration || 0);
    }
    
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.classList.add('slide-up');
}

function showProcessing() {
    hideAllSections();
    statusSection.style.display = 'block';
    statusSection.classList.add('fade-in');
    updateProgress(0);
}

function updateStatus(title, message) {
    document.getElementById('statusTitle').textContent = title;
    document.getElementById('statusMessage').textContent = message;
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
}

function showError(title, message) {
    hideAllSections();
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    errorSection.style.display = 'block';
    errorSection.classList.add('fade-in');
}

function hideAllSections() {
    statusSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// Utility Functions
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function resetApp() {
    clearImage();
    hideAllSections();
}

// Result Action Functions
function copyText() {
    const text = banglaText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text:', err);
        showNotification('Failed to copy text', 'error');
    });
}

function downloadText() {
    const text = banglaText.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bangla-braille-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Text downloaded successfully!');
}

function downloadAudio() {
    const audioSrc = audioPlayer.src;
    if (!audioSrc) {
        showNotification('No audio available to download', 'error');
        return;
    }
    
    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = 'bangla-speech.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('Audio downloaded successfully!');
}

function shareAudio() {
    const audioSrc = audioPlayer.src;
    if (!audioSrc) {
        showNotification('No audio available to share', 'error');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Bangla Braille to Voice Conversion',
            text: 'Check out this converted Bangla speech!',
            url: window.location.href
        }).then(() => {
            showNotification('Shared successfully!');
        }).catch(err => {
            console.error('Share failed:', err);
        });
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('URL copied to clipboard!');
        });
    }
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + O to open file
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInput.click();
    }
    
    // Escape to reset
    if (e.key === 'Escape') {
        resetApp();
    }
    
    // Enter to convert when file is selected
    if (e.key === 'Enter' && selectedFile && imagePreview.style.display !== 'none') {
        convertImage();
    }
});

// Auto-save to localStorage (for thesis demo purposes)
function saveToHistory(data) {
    const history = JSON.parse(localStorage.getItem('brailleHistory') || '[]');
    history.unshift({
        timestamp: new Date().toISOString(),
        text: data.text,
        confidence: data.confidence,
        duration: data.duration
    });
    
    // Keep only last 10 conversions
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('brailleHistory', JSON.stringify(history));
}

// Load history on page load (for demonstration)
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('brailleHistory') || '[]');
    console.log('Conversion History:', history);
}

// Initialize history
loadHistory();