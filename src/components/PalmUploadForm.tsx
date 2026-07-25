'use client';

import React, { useState } from 'react';

export default function PalmUploadForm({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted palm:', file);
    // TODO: Upload image to FastAPI backend for vision processing
  };

  return (
    <div className="glass-card p-8 max-w-lg w-full relative animate-float">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
      >
        ← Back
      </button>
      
      <h2 className="text-3xl font-bold mt-4 mb-2 text-blue-400 text-center">Palm Vision AI</h2>
      <p className="text-slate-400 text-center mb-8 text-sm">Upload a clear photo of your dominant palm for geometric and line analysis.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-center">
        
        <div className="border-2 border-dashed border-blue-500/50 rounded-xl p-12 hover:bg-blue-500/5 transition-colors cursor-pointer relative group">
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
            required
          />
          <div className="text-slate-300 group-hover:text-white transition-colors">
            {file ? (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="font-medium text-blue-300">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-slate-400 mb-2 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="font-medium">Click to upload or drag and drop</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:transform-none"
          disabled={!file}
        >
          Analyze Palm
        </button>
      </form>
    </div>
  );
}
