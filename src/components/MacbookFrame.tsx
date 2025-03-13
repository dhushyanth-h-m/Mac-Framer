'use client';

import React, { useRef, useEffect } from 'react';

interface MacbookFrameProps {
  imageUrl: string | null;
  onGenerated?: (dataUrl: string) => void;
}

export default function MacbookFrame({ imageUrl, onGenerated }: MacbookFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas dimensions with a fixed ratio similar to MacBook screen
      const width = 1200;
      const height = 750;
      
      canvas.width = width;
      canvas.height = height;
      
      // Fill with background color (macbook silver)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // Draw frame
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 0, width, height);
      
      // Draw top bar (with window controls)
      const topBarHeight = 28;
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(0, 0, width, topBarHeight);
      
      // Draw window control buttons (red, yellow, green)
      const buttonRadius = 6;
      const buttonPadding = 8;
      
      // Red button (close)
      ctx.beginPath();
      ctx.arc(buttonPadding + buttonRadius, topBarHeight/2, buttonRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff5f57';
      ctx.fill();
      
      // Yellow button (minimize)
      ctx.beginPath();
      ctx.arc(buttonPadding * 2 + buttonRadius * 3, topBarHeight/2, buttonRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#febc2e';
      ctx.fill();
      
      // Green button (maximize)
      ctx.beginPath();
      ctx.arc(buttonPadding * 3 + buttonRadius * 5, topBarHeight/2, buttonRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#28c840';
      ctx.fill();
      
      // Calculate image placement to fit inside the screen area
      const screenPadding = 2;
      const screenX = screenPadding;
      const screenY = topBarHeight;
      const screenWidth = width - (screenPadding * 2);
      const screenHeight = height - topBarHeight - screenPadding;

      // Draw the user image to fit the screen area
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight, drawX, drawY;
      
      if (aspectRatio > screenWidth / screenHeight) {
        // Image is wider than screen
        drawWidth = screenWidth;
        drawHeight = drawWidth / aspectRatio;
        drawX = screenX;
        drawY = screenY + (screenHeight - drawHeight) / 2;
      } else {
        // Image is taller than screen
        drawHeight = screenHeight;
        drawWidth = drawHeight * aspectRatio;
        drawX = screenX + (screenWidth - drawWidth) / 2;
        drawY = screenY;
      }
      
      // Draw the image
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      // Generate data URL and send it to parent if callback provided
      if (onGenerated) {
        const dataUrl = canvas.toDataURL('image/png');
        onGenerated(dataUrl);
      }
    };
    
    img.src = imageUrl;
  }, [imageUrl, onGenerated]);
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto shadow-xl rounded-lg"
      />
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            Upload an image to generate MacBook frame
          </p>
        </div>
      )}
    </div>
  );
} 