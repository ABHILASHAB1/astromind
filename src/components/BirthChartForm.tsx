'use client';

import React, { useState } from 'react';

export default function BirthChartForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    // TODO: Send to FastAPI backend
  };

  return (
    <div className="glass-card p-8 max-w-lg w-full relative animate-float">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
      >
        ← Back
      </button>
      
      <h2 className="text-3xl font-bold mt-4 mb-2 text-purple-400 text-center">Birth Details</h2>
      <p className="text-slate-400 text-center mb-8 text-sm">Enter your cosmic coordinates to initialize the analysis.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <input 
            type="text" 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
            <input 
              type="date" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [color-scheme:dark]"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Time of Birth</label>
            <input 
              type="time" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [color-scheme:dark]"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Location of Birth</label>
          <input 
            type="text" 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all transform hover:-translate-y-1"
        >
          Generate Chart
        </button>
      </form>
    </div>
  );
}
