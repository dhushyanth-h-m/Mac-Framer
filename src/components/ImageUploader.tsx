'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageSelect: (imageFile: File, previewUrl: string) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Pass the file and preview URL to parent component
    onImageSelect(file, previewUrl);
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative p-6 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center justify-center h-64 
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        {preview ? (
          <div className="relative w-full h-full">
            <Image 
              src={preview} 
              alt="Preview" 
              fill
              style={{ objectFit: 'contain' }}
            />
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
              Supports: JPEG, PNG, WebP, GIF
            </p>
          </>
        )}
      </div>
      
      <button
        type="button"
        onClick={onButtonClick}
        className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
      >
        {preview ? 'Change Image' : 'Select Image'}
      </button>
    </div>
  );
} 