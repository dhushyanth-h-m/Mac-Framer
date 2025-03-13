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
      
      // Draw frame with rounded corners
      const cornerRadius = 12; // Rounded corner radius
      
      ctx.fillStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(width - cornerRadius, 0);
      ctx.quadraticCurveTo(width, 0, width, cornerRadius);
      ctx.lineTo(width, height - cornerRadius);
      ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
      ctx.lineTo(cornerRadius, height);
      ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
      ctx.closePath();
      ctx.fill();
      
      // Draw top bar (with window controls) with rounded top corners
      const topBarHeight = 28;
      ctx.fillStyle = '#f8f8f8';
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(width - cornerRadius, 0);
      ctx.quadraticCurveTo(width, 0, width, cornerRadius);
      ctx.lineTo(width, topBarHeight);
      ctx.lineTo(0, topBarHeight);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
      ctx.closePath();
      ctx.fill();
      
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
      
      // Calculate image placement to fit inside the screen area with rounded corners
      const screenPadding = 2;
      const screenX = screenPadding;
      const screenY = topBarHeight;
      const screenWidth = width - (screenPadding * 2);
      const screenHeight = height - topBarHeight - screenPadding;
      const screenCornerRadius = 8; // Smaller corner radius for the screen

      // Create a clipping path for the screen with rounded corners
      ctx.beginPath();
      ctx.moveTo(screenX + screenCornerRadius, screenY);
      ctx.lineTo(screenX + screenWidth - screenCornerRadius, screenY);
      ctx.quadraticCurveTo(screenX + screenWidth, screenY, screenX + screenWidth, screenY + screenCornerRadius);
      ctx.lineTo(screenX + screenWidth, screenY + screenHeight - screenCornerRadius);
      ctx.quadraticCurveTo(screenX + screenWidth, screenY + screenHeight, screenX + screenWidth - screenCornerRadius, screenY + screenHeight);
      ctx.lineTo(screenX + screenCornerRadius, screenY + screenHeight);
      ctx.quadraticCurveTo(screenX, screenY + screenHeight, screenX, screenY + screenHeight - screenCornerRadius);
      ctx.lineTo(screenX, screenY + screenCornerRadius);
      ctx.quadraticCurveTo(screenX, screenY, screenX + screenCornerRadius, screenY);
      ctx.closePath();
      ctx.clip();

      // Draw the user image to fill the entire screen area
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight, drawX, drawY;
      
      // Always fill the entire screen area
      if (aspectRatio > screenWidth / screenHeight) {
        // Image is wider than screen
        drawHeight = screenHeight;
        drawWidth = drawHeight * aspectRatio;
        drawX = screenX + (screenWidth - drawWidth) / 2;
        drawY = screenY;
      } else {
        // Image is taller than screen
        drawWidth = screenWidth;
        drawHeight = drawWidth / aspectRatio;
        drawX = screenX;
        drawY = screenY + (screenHeight - drawHeight) / 2;
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
      <div className="aspect-[16/10] w-full">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full shadow-xl rounded-lg"
        />
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg h-96">
            <p className="text-gray-500 dark:text-gray-400">
              Upload an image to generate Mac Framer
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 