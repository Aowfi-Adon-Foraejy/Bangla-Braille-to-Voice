"""
Bangla Text-to-Speech Model

THESIS IMPLEMENTATION: Converts Bangla Unicode text to synthesized speech.
Uses gTTS (Google Text-to-Speech) for Bangla language support.

Alternative options for thesis enhancement:
1. Coqui TTS with Bangla language model
2. Microsoft Azure Cognitive Services (Bangla voice)
3. Custom-trained Tacotron2 for Bangla
4. Festival with Bangla voice addon
"""

import os
import uuid
import time
from typing import Dict
from gtts import gTTS

class TextToSpeech:
    """
    Bangla Text-to-Speech conversion using gTTS.
    
    TODO: For thesis enhancement, consider:
    1. Fine-tuned Tacotron2 model for better Bangla pronunciation
    2. Voice cloning for personalized output
    3. Prosody control for natural speech patterns
    4. Multiple voice options (male/female/child)
    """
    
    def __init__(self):
        self.output_dir = "static/audio"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # gTTS language code for Bengali
        self.language = 'bn'
        
        print("🔊 INITIALIZING: Bangla Text-to-Speech Engine")
        print("🌐 Using gTTS with Bengali language support")
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess Bangla text for better TTS output.
        
        ENHANCEMENTS FOR THESIS:
        1. Number to words conversion
        2. Abbreviation expansion  
        3. Punctuation normalization
        4. Text normalization for Bangla script
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Ensure text is not empty after preprocessing
        if not text.strip():
            raise ValueError("Text cannot be empty after preprocessing")
        
        return text
    
    def synthesize_with_gtts(self, text: str, output_filename: str) -> Dict[str, any]:
        """
        Generate speech using gTTS library.
        
        THESIS ALTERNATIVE - Custom TTS:
        ```python
        def synthesize_with_tacotron2(self, text, output_path):
            # Load your trained Tacotron2 model
            model = torch.load('bangla_tacotron2.pth')
            model.eval()
            
            # Text preprocessing for neural TTS
            processed_text = self.text_processor(text)
            
            with torch.no_grad():
                mel_output = model.inference(processed_text)
                audio = self.vocoder(mel_output)
                torchaudio.save(output_path, audio, 22050)
            
            return {"duration": len(audio) / 22050}
        ```
        """
        try:
            # Create gTTS object with Bangla language
            tts = gTTS(text=text, lang=self.language, slow=False)
            
            # Save directly as MP3 for maximum compatibility
            output_path = os.path.join(self.output_dir, output_filename)
            tts.save(output_path)
            
            # Estimate duration (rough estimate: 0.1 seconds per character)
            duration = len(text) * 0.1
            
            return {
                "output_path": output_path,
                "duration": duration
            }
            
        except Exception as e:
            raise RuntimeError(f"gTTS synthesis failed: {str(e)}")
    
    def synthesize(self, text: str) -> Dict[str, any]:
        """
        Main text-to-speech synthesis pipeline.
        
        Args:
            text: Bangla Unicode text to convert to speech
            
        Returns:
            {
                "audio_url": "/static/audio/filename.mp3",
                "duration": 3.45  # Duration in seconds
            }
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        try:
            # Step 1: Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Step 2: Generate unique filename
            filename = f"tts_{uuid.uuid4().hex[:8]}.mp3"
            
            # Step 3: Synthesize speech
            start_time = time.time()
            result = self.synthesize_with_gtts(processed_text, filename)
            processing_time = time.time() - start_time
            
            # Step 4: Generate accessible URL
            audio_url = f"/static/audio/{filename}"
            
            print(f"🎵 Speech Generated: '{processed_text[:20]}...' ({result['duration']:.2f}s)")
            print(f"⏱️ Processing Time: {processing_time:.2f}s")
            
            return {
                "audio_url": audio_url,
                "duration": round(result["duration"], 2)
            }
            
        except Exception as e:
            raise RuntimeError(f"Speech synthesis failed: {str(e)}")
    
    def batch_synthesize(self, texts: list) -> list:
        """
        Batch processing for multiple text inputs.
        Useful for thesis performance evaluation.
        """
        results = []
        for i, text in enumerate(texts):
            try:
                result = self.synthesize(text)
                results.append(result)
            except Exception as e:
                results.append({"error": str(e), "index": i})
        return results
    
    def get_supported_languages(self) -> list:
        """
        Return supported languages for thesis documentation.
        """
        return [
            {"code": "bn", "name": "Bengali (Bangla)", "native_name": "বাংলা"},
            {"code": "en", "name": "English", "native_name": "English"}
        ]
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Clean up old audio files to manage storage.
        Important for production deployment.
        """
        try:
            current_time = time.time()
            for filename in os.listdir(self.output_dir):
                filepath = os.path.join(self.output_dir, filename)
                file_age = current_time - os.path.getctime(filepath)
                
                if file_age > max_age_hours * 3600:  # Convert hours to seconds
                    os.remove(filepath)
                    print(f"🗑️ Cleaned up old file: {filename}")
                    
        except Exception as e:
            print(f"⚠️ Cleanup failed: {str(e)}")


# THESIS ENHANCEMENT NOTES:
"""
1. ADVANCED TTS OPTIONS:
   - Fine-tuned Tacotron2 + WaveGlow for Bangla
   - FastSpeech2 for real-time synthesis
   - Voice conversion for multiple speaker characteristics
   - Prosody and intonation control

2. QUALITY IMPROVEMENTS:
   - Text normalization for numbers, dates, abbreviations
   - Phoneme-based pronunciation correction
   - Contextual stress and intonation patterns
   - Voice cloning for personalized output

3. EVALUATION METRICS:
   - Mean Opinion Score (MOS) for naturalness
   - Real-time factor (RTF) for performance
   - Word Error Rate (WER) for intelligibility
   - Audio quality metrics (MCD, STOI)

4. DEPLOYMENT STRATEGIES:
   - ONNX export for cross-platform deployment
   - Model quantization for mobile devices
   - Streaming synthesis for long texts
   - Caching for frequently used phrases
"""