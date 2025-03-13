'use client';

import { useState, useRef, useEffect } from 'react';

interface TextOverlayProps {
  onTextChange: (text: string, style: TextStyle) => void;
  imageLoaded: boolean;
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

const fontFamilies = [
  { name: 'Modern', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Elegant', value: 'Georgia, serif' },
  { name: 'Creative', value: 'Comic Sans MS, cursive' },
  { name: 'Bold', value: 'Impact, Haettenschweiler, sans-serif' },
  { name: 'Minimal', value: 'Courier New, monospace' },
];

export default function TextOverlay({ onTextChange, imageLoaded }: TextOverlayProps) {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<TextStyle>({
    fontSize: 48,
    fontFamily: fontFamilies[0].value,
    color: '#ffffff',
    shadowColor: '#000000',
    shadowBlur: 4,
    x: 50,
    y: 50,
  });
  
  // Debounce mechanism to prevent excessive updates
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Only trigger the onTextChange when text or style actually changes
  useEffect(() => {
    if (!imageLoaded) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout to update after a short delay
    timeoutRef.current = setTimeout(() => {
      onTextChange(text, style);
    }, 300);
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, style, imageLoaded, onTextChange]);

  const handleStyleChange = (property: keyof TextStyle, value: string | number) => {
    setStyle(prevStyle => ({ ...prevStyle, [property]: value }));
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  return (
    <div className="w-full space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your text here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Font Style
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {fontFamilies.map((font) => (
            <option key={font.name} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Size
          </label>
          <input
            type="range"
            min="12"
            max="120"
            value={style.fontSize}
            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shadow Blur
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={style.shadowBlur}
            onChange={(e) => handleStyleChange('shadowBlur', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={style.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
            className="w-full h-10 p-1 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shadow Color
          </label>
          <input
            type="color"
            value={style.shadowColor}
            onChange={(e) => handleStyleChange('shadowColor', e.target.value)}
            className="w-full h-10 p-1 rounded-md"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Position your text by dragging it directly on the image
        </p>
      </div>
    </div>
  );
} 