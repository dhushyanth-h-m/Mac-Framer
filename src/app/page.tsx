'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';
import MacbookFrame from '@/components/MacbookFrame';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setPreviewUrl(preview);
    // Reset generated image when a new image is selected
    setGeneratedImageUrl(null);
  };

  const handleGenerated = (dataUrl: string) => {
    setGeneratedImageUrl(dataUrl);
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `macbook-frame-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          MacBook Frame Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Turn your screenshots into beautiful MacBook mockups
        </p>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto gap-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              1. Upload Your Image
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a screenshot or any image you want to display in the MacBook frame.
            </p>
            <ImageUploader onImageSelect={handleImageSelect} />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              2. Preview Your MacBook Frame
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your image will be automatically fit into a MacBook frame.
            </p>
            <div className="mt-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <MacbookFrame imageUrl={previewUrl} onGenerated={handleGenerated} />
            </div>
          </div>
        </section>

        {generatedImageUrl && (
          <section className="mt-8 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              3. Download Your MacBook Mockup
            </h2>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </button>
          </section>
        )}
      </main>

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Created with Next.js, Canvas API, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
