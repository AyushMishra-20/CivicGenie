import React, { useState, useRef } from 'react';
import './PhotoUpload.css';

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotosChange, 
  initialPhotos = [], 
  maxPhotos = 5 
}) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        continue;
      }

      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }

    Promise.all(promises).then(() => {
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
      setError(null);
    });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || photos.length >= maxPhotos) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    const updatedPhotos = [...photos, photoData];
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
    
    stopCamera();
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="photo-upload">
      <div className="photo-header">
        <h4>📸 Add Photos (Optional)</h4>
        <p>Photos help us understand the issue better</p>
      </div>

      {error && (
        <div className="photo-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!showCamera && photos.length < maxPhotos && (
        <div className="photo-options">
          <button
            type="button"
            onClick={startCamera}
            className="photo-btn primary"
          >
            📷 Take Photo
          </button>
          
          <button
            type="button"
            onClick={openFileDialog}
            className="photo-btn secondary"
          >
            📁 Choose from Gallery
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {showCamera && (
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-video"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="camera-controls">
            <button
              type="button"
              onClick={capturePhoto}
              className="photo-btn primary"
              disabled={photos.length >= maxPhotos}
            >
              📸 Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="photo-btn secondary"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="photo-gallery">
          <h5>Uploaded Photos ({photos.length}/{maxPhotos})</h5>
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`Photo ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="remove-photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length >= maxPhotos && (
        <div className="photo-limit">
          <p>Maximum {maxPhotos} photos allowed</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload; 