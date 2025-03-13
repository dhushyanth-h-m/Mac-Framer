'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import NextImage from 'next/image';
import TextOverlay from './TextOverlay';

interface ImageUploaderProps {
  onImageSelect: (imageFile: File, previewUrl: string) => void;
}

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  shadowColor: string;
  shadowBlur: number;
  x: number;
  y: number;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textPositionRef = useRef<{ x: number, y: number }>({ x: 50, y: 50 });
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing processing timeout
  const clearProcessingTimeout = () => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearProcessingTimeout();
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Reset text and style when uploading a new image
    setOverlayText('');
    setTextStyle(null);
    setIsProcessing(true);
    setImageLoaded(false);
    clearProcessingTimeout();
    
    // Create a high-quality preview using the native HTML Image constructor
    const img = new window.Image();
    const previewUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        // Set canvas size to match image dimensions for maximum quality
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Enable high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw the image
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // Convert to high-quality data URL
          const highQualityUrl = canvas.toDataURL('image/png', 1.0);
          setOriginalImage(highQualityUrl); // Store the original image without text
          setPreview(highQualityUrl);
          
          // Convert data URL to File object for saving
          fetch(highQualityUrl)
            .then(res => res.blob())
            .then(blob => {
              const processedFile = new File([blob], file.name, { type: 'image/png' });
              onImageSelect(processedFile, highQualityUrl);
              setImageLoaded(true);
              setIsProcessing(false);
            });
        }
      }
    };
    
    img.src = previewUrl;
  };

  const processImageWithText = () => {
    if (!originalImage || !textStyle || isProcessing) return;
    
    // Clear any existing timeout to prevent multiple processing
    clearProcessingTimeout();
    
    // Set a small delay before processing to avoid rapid consecutive updates
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(true);
      
      const img = new window.Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw the original image (without any text)
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // Apply text overlay at the dragged position
            if (overlayText) {
              ctx.font = `${textStyle.fontSize}px ${textStyle.fontFamily}`;
              ctx.fillStyle = textStyle.color;
              ctx.shadowColor = textStyle.shadowColor;
              ctx.shadowBlur = textStyle.shadowBlur;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Calculate actual position based on percentage
              const xPos = (textPositionRef.current.x / 100) * canvas.width;
              const yPos = (textPositionRef.current.y / 100) * canvas.height;
              
              ctx.fillText(overlayText, xPos, yPos);
            }
            
            // Update preview
            const highQualityUrl = canvas.toDataURL('image/png', 1.0);
            setPreview(highQualityUrl);
            
            // Update file
            fetch(highQualityUrl)
              .then(res => res.blob())
              .then(blob => {
                const processedFile = new File([blob], 'processed-image.png', { type: 'image/png' });
                onImageSelect(processedFile, highQualityUrl);
                setIsProcessing(false);
              });
          }
        }
      };
      img.src = originalImage; // Always start with the original image
    }, 300);
  };

  const handleTextChange = (text: string, style: TextStyle) => {
    setOverlayText(text);
    setTextStyle(style);
    // Processing will be triggered by the useEffect below
  };

  // Process image when text or style changes
  useEffect(() => {
    if (imageLoaded && textStyle && !isProcessing) {
      processImageWithText();
    }
  }, [overlayText, textStyle, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!preview || !imageContainerRef.current) return;
    
    setIsDraggingText(true);
    updateTextPosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingText) {
      updateTextPosition(e);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingText) {
      setIsDraggingText(false);
      processImageWithText();
    }
  };

  const updateTextPosition = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    textPositionRef.current = { x, y };
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="aspect-[16/10] w-full">
        <div 
          className={`relative p-0 border-2 border-dashed rounded-lg overflow-hidden transition-colors flex flex-col items-center justify-center w-full h-full
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          ref={imageContainerRef}
          onMouseDown={preview ? handleMouseDown : undefined}
          onMouseMove={preview ? handleMouseMove : undefined}
          onMouseUp={preview ? handleMouseUp : undefined}
          onMouseLeave={preview ? handleMouseUp : undefined}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <canvas ref={canvasRef} className="hidden" />
          
          {preview ? (
            <div className="relative w-full h-full">
              <NextImage 
                src={preview} 
                alt="Preview" 
                fill
                style={{ objectFit: 'cover' }}
                quality={100}
                className="rounded-lg"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              {/* Visual indicator for text position during dragging */}
              {isDraggingText && overlayText && textStyle && (
                <div 
                  className="absolute pointer-events-none select-none"
                  style={{
                    left: `${textPositionRef.current.x}%`,
                    top: `${textPositionRef.current.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: textStyle.color,
                    fontFamily: textStyle.fontFamily,
                    fontSize: `${textStyle.fontSize / 3}px`,
                    textShadow: `0 0 ${textStyle.shadowBlur}px ${textStyle.shadowColor}`,
                    cursor: 'grabbing'
                  }}
                >
                  {overlayText}
                </div>
              )}
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your image here, or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports: JPEG, PNG, WebP (High Quality)
              </p>
            </>
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={onButtonClick}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
      >
        {preview ? 'Change Image' : 'Select Image'}
      </button>

      {preview && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Add Text Overlay
          </h3>
          <TextOverlay onTextChange={handleTextChange} imageLoaded={imageLoaded} />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Click and drag anywhere on the image to position your text
          </p>
        </div>
      )}
    </div>
  );
} 