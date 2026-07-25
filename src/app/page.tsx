/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { promptCategories, quickActions } from '../data/prompts';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const triggerHaptic = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (err) {
    // Ignore error if not running on native device
  }
};

// Crisp Outline SVGs matching the Figma
const PlanetIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0A1128" strokeWidth="1.5"><circle cx="12" cy="12" r="8"/><path d="M4 12c0-4 8-8 16-4M4 12c0 4 8 8 16 4"/></svg>;
const MoonIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const GridIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const UserIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>;
const StarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2L15 9l8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></svg>;
const SparkleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2L13.1 10.9L22 12L13.1 13.1L12 22L10.9 13.1L2 12L10.9 10.9Z"/></svg>;
const CameraIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M15 7l-2-4H11l-2 4"/></svg>;

// Client-side image compression to prevent ECONNRESET from massive phone camera files
const compressImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

export default function App() {
  const [view, setView] = useState<'welcome' | 'traditions' | 'birth_details' | 'permissions' | 'home' | 'chat' | 'birth_chart' | 'timeline' | 'palm' | 'daily_reading'>('welcome');
  const [profile, setProfile] = useState({
    name: '',
    birthPlace: '',
    birthDate: '',
    birthTime: '',
    timeZone: ''
  });
  const [errors, setErrors] = useState<{name?: string, birthPlace?: string, birthDate?: string, birthTime?: string, timeZone?: string}>({});

  const handleProfileSubmit = () => {
    const newErrors: any = {};
    if (!profile.name.trim()) newErrors.name = 'Full name is required';
    if (!profile.birthPlace.trim()) newErrors.birthPlace = 'Birth place is required';
    if (!profile.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!profile.birthTime) newErrors.birthTime = 'Birth time is required';
    if (!profile.timeZone) newErrors.timeZone = 'Please select a time zone';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setView('permissions');
    }
  };

  // Backend Integration States
  const [chatMessages, setChatMessages] = useState<{sender: 'ai'|'user', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('career');

  const [palmData, setPalmData] = useState<any>(null);
  const [isPalmLoading, setIsPalmLoading] = useState(false);
  const [palmError, setPalmError] = useState<string | null>(null);

  const [astrologyData, setAstrologyData] = useState<any>(null);
  const [isAstrologyLoading, setIsAstrologyLoading] = useState(false);

  const [dailyData, setDailyData] = useState<{score: number, summary: string, readingTitle: string, readingBody: string} | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(false);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    
    // Defensive check: Modern browsers disable mediaDevices entirely on insecure HTTP connections.
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Camera API not available (likely an insecure HTTP context).");
      setCameraError("Live camera requires a secure HTTPS connection. Please use the fallback upload button.");
      setIsCameraOpen(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setCameraError("Camera access denied. You can still upload a photo.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      stopCamera();
      setIsPalmLoading(true);
      setPalmError(null);
      
      // We do the compression right on this canvas
      let maxWidth = 1000;
      let width = canvas.width;
      let height = canvas.height;
      if (width > height && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else if (height > maxWidth) {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }
      
      const resizeCanvas = document.createElement('canvas');
      resizeCanvas.width = width;
      resizeCanvas.height = height;
      const resizeCtx = resizeCanvas.getContext('2d');
      resizeCtx?.drawImage(canvas, 0, 0, width, height);
      
      const dataUrl = resizeCanvas.toDataURL('image/jpeg', 0.8);
      
      try {
        const res = await fetch('/api/palm-reader', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl })
        });
        const data = await res.json();
        if (data.success) {
          setPalmData(data.reading);
        } else {
          setPalmError(data.error || 'Failed to analyze palm.');
        }
      } catch (err) {
        setPalmError('Network error occurred.');
      }
      setIsPalmLoading(false);
    }
  };

  // Chat Submission Handler
  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;
    
    setChatMessages(prev => [...prev, {sender: 'user', text: textToSend}]);
    if (!overrideText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          category: selectedCategory,
          context: {
            profile,
            astrology: astrologyData,
            palmReading: palmData
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, {sender: 'ai', text: data.response}]);
      } else {
        setChatMessages(prev => [...prev, {sender: 'ai', text: data.error || 'Sorry, I encountered an error.'}]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, {sender: 'ai', text: 'Network error occurred.'}]);
    }
    setIsChatLoading(false);
  };

  // Palm Scan Handler
  const handleScanPalm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPalmError(null);
    setIsPalmLoading(true);

    try {
      // Compress the image before uploading to avoid Next.js payload limits
      const base64String = await compressImage(file, 1000);
      
      const res = await fetch('/api/palm-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64String })
      });
      const data = await res.json();
      if (data.success) {
        setPalmData(data.reading);
      } else {
        setPalmError(data.error || 'Failed to analyze palm.');
      }
    } catch (err) {
      setPalmError('Network error occurred while uploading. Please try a smaller image.');
    }
    setIsPalmLoading(false);
  };

  // Astrology Fetch Handler
  const fetchAstrology = async () => {
    if (astrologyData) return;
    setIsAstrologyLoading(true);
    try {
      const res = await fetch('/api/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setAstrologyData(data.chart);
      }
    } catch (e) {
      console.error(e);
    }
    setIsAstrologyLoading(false);
  };

  const fetchDaily = async () => {
    if (dailyData || !astrologyData) return;
    setIsDailyLoading(true);
    try {
      const res = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, astrologyData })
      });
      const data = await res.json();
      if (data.success) {
        setDailyData(data.daily);
      }
    } catch (e) {
      console.error(e);
    }
    setIsDailyLoading(false);
  };

  React.useEffect(() => {
    if (view === 'birth_chart' || view === 'timeline' || view === 'home' || view === 'daily_reading') {
      fetchAstrology();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  React.useEffect(() => {
    if (astrologyData && (view === 'home' || view === 'daily_reading')) {
      fetchDaily();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astrologyData, view]);

  return (
    <div className="mobile-container flex flex-col font-sans text-[#0A1128] bg-[#F8F9FB]">
      
      {/* 1. WELCOME SCREEN */}
      {view === 'welcome' && (
        <div className="flex-1 bg-white flex flex-col items-center justify-between p-8 text-center w-full overflow-y-auto">
          <div className="flex flex-col items-center justify-center flex-1 w-full shrink-0">
            <div className="mb-6"><PlanetIcon /></div>
            <h1 className="text-[32px] font-bold mb-4 tracking-tight leading-tight">Welcome to<br/>AstroMind</h1>
            <p className="text-[#64748B] text-sm px-4 leading-relaxed">
              Discover the mysteries of the universe and unlock your cosmic potential with advanced AI.
            </p>
          </div>
          <div className="w-full flex flex-col items-center mt-8 shrink-0 relative z-50">
            <button type="button" className="primary-button bg-[#0A1128] w-full cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setView('traditions')}>Next</button>
            <button type="button" className="mt-4 text-[#64748B] text-sm font-semibold p-4 cursor-pointer hover:text-slate-900" onClick={() => setView('home')}>Log In</button>
          </div>
        </div>
      )}

      {/* 2. TRADITIONS SCREEN */}
      {view === 'traditions' && (
        <div className="flex-1 bg-white flex flex-col p-6 w-full overflow-y-auto">
          <button type="button" className="mt-8 mb-6 text-[#0A1128] self-start cursor-pointer p-2 -ml-2 shrink-0" onClick={() => setView('welcome')}><ChevronLeftIcon /></button>
          <div className="shrink-0">
            <h1 className="text-2xl font-bold mb-1">Choose Traditions</h1>
            <p className="text-[#64748B] text-sm mb-8">Choose your preferred traditions</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0 mb-8">
            <div className="border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">
              <div className="mb-4 text-[#0A1128]"><MoonIcon /></div>
              <span className="font-semibold text-sm">Vedic</span>
            </div>
            <div className="border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">
              <div className="mb-4 text-[#0A1128]"><MoonIcon /></div>
              <span className="font-semibold text-sm">Western</span>
            </div>
            <div className="border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">
              <div className="mb-4 text-[#0A1128]"><MoonIcon /></div>
              <span className="font-semibold text-sm">Chinese</span>
            </div>
            <div className="border border-slate-100 shadow-sm rounded-[24px] p-6 flex flex-col items-center cursor-pointer hover:bg-slate-50">
              <div className="mb-4 text-[#0A1128]"><MoonIcon /></div>
              <span className="font-semibold text-sm">Palmistry</span>
            </div>
          </div>
          
          <div className="w-full flex flex-col items-center mt-8 shrink-0 mb-4 pt-4 bg-white sticky bottom-0 border-t border-slate-100 z-50">
             <div className="flex justify-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#0A1128]"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
             </div>
             <button type="button" className="primary-button bg-[#0A1128] w-full cursor-pointer shadow-sm hover:bg-slate-800 transition-colors" onClick={() => setView('birth_details')}>Next</button>
          </div>
        </div>
      )}

      {/* 2.5 BIRTH DETAILS SCREEN */}
      {view === 'birth_details' && (
        <div className="flex-1 bg-white flex flex-col p-6 w-full overflow-y-auto">
          <button type="button" className="mt-8 mb-6 text-[#0A1128] self-start cursor-pointer p-2 -ml-2 shrink-0" onClick={() => setView('traditions')}><ChevronLeftIcon /></button>
          
          <div className="shrink-0 mb-6">
            <h1 className="text-2xl font-bold mb-1">Your Cosmic Profile</h1>
            <p className="text-[#64748B] text-sm mb-2">Accurate birth details are essential for precise astrological and palm readings.</p>
          </div>
          
          <div className="flex flex-col gap-4 shrink-0 mb-8">
            <div>
              <label className="block text-sm font-semibold text-[#0A1128] mb-1">Full Name</label>
              <input type="text" placeholder="Enter your name" className={`w-full bg-[#F8F9FB] border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl p-4 text-[#0A1128] focus:outline-none focus:border-[#635BFF] transition-colors`} value={profile.name} onChange={e => {setProfile({...profile, name: e.target.value}); setErrors({...errors, name: ''});}} />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#0A1128] mb-1">Birth Place</label>
              <input type="text" placeholder="City, Country" className={`w-full bg-[#F8F9FB] border ${errors.birthPlace ? 'border-red-500' : 'border-slate-200'} rounded-xl p-4 text-[#0A1128] focus:outline-none focus:border-[#635BFF] transition-colors`} value={profile.birthPlace} onChange={e => {setProfile({...profile, birthPlace: e.target.value}); setErrors({...errors, birthPlace: ''});}} />
              {errors.birthPlace && <p className="text-red-500 text-xs mt-1 font-medium">{errors.birthPlace}</p>}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#0A1128] mb-1">Birth Date</label>
                <input type="date" className={`w-full bg-[#F8F9FB] border ${errors.birthDate ? 'border-red-500' : 'border-slate-200'} rounded-xl p-4 text-[#0A1128] focus:outline-none focus:border-[#635BFF] transition-colors`} value={profile.birthDate} onChange={e => {setProfile({...profile, birthDate: e.target.value}); setErrors({...errors, birthDate: ''});}} />
                {errors.birthDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.birthDate}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#0A1128] mb-1">Birth Time</label>
                <input type="time" className={`w-full bg-[#F8F9FB] border ${errors.birthTime ? 'border-red-500' : 'border-slate-200'} rounded-xl p-4 text-[#0A1128] focus:outline-none focus:border-[#635BFF] transition-colors`} value={profile.birthTime} onChange={e => {setProfile({...profile, birthTime: e.target.value}); setErrors({...errors, birthTime: ''});}} />
                {errors.birthTime && <p className="text-red-500 text-xs mt-1 font-medium">{errors.birthTime}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A1128] mb-1">Time Zone</label>
              <select className={`w-full bg-[#F8F9FB] border ${errors.timeZone ? 'border-red-500' : 'border-slate-200'} rounded-xl p-4 text-[#0A1128] focus:outline-none focus:border-[#635BFF] transition-colors appearance-none`} value={profile.timeZone} onChange={e => {setProfile({...profile, timeZone: e.target.value}); setErrors({...errors, timeZone: ''});}}>
                <option value="" disabled>Select Time Zone based on Birth Place</option>
                <option value="UTC-8">Pacific Time (PT) - UTC-8</option>
                <option value="UTC-5">Eastern Time (ET) - UTC-5</option>
                <option value="UTC+0">Greenwich Mean Time (GMT) - UTC+0</option>
                <option value="UTC+1">Central European Time (CET) - UTC+1</option>
                <option value="UTC+5.5">India Standard Time (IST) - UTC+5:30</option>
                <option value="UTC+8">China Standard Time (CST) - UTC+8</option>
                <option value="UTC+9">Japan Standard Time (JST) - UTC+9</option>
                <option value="UTC+10">Australian Eastern Time (AET) - UTC+10</option>
              </select>
              {errors.timeZone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.timeZone}</p>}
            </div>
          </div>
          
          <div className="w-full flex flex-col items-center mt-auto shrink-0 mb-4 pt-4 relative z-50">
             <div className="flex justify-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-[#0A1128]"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
             </div>
             <button type="button" className="primary-button bg-[#0A1128] w-full cursor-pointer shadow-sm hover:bg-slate-800 transition-colors" onClick={handleProfileSubmit}>Next</button>
          </div>
        </div>
      )}

      {/* 3. PERMISSIONS MODAL */}
      {view === 'permissions' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/60 w-full">
            <div className="bg-white rounded-[24px] w-full p-6 flex flex-col items-center text-center shadow-2xl relative">
              <div className="mb-4"><CameraIcon /></div>
              <h2 className="font-bold text-lg mb-2">Camera Access</h2>
              <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
                You must grant camera access to scan your hand geometry, lines, and mounts.
              </p>
              <button className="text-[#635BFF] font-semibold border-t border-slate-100 w-full pt-4 cursor-pointer hover:opacity-80" onClick={() => setView('home')}>
                Confirm
              </button>
            </div>
        </div>
      )}

      {/* 4. HOME SCREEN */}
      {view === 'home' && (
        <div className="flex-1 flex flex-col bg-[#F8F9FB] pb-24 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start p-6 pt-12 relative z-10">
            <div>
              <h1 className="text-xl text-[#0A1128] font-semibold">Good Evening,</h1>
              <h2 className="text-3xl font-bold text-[#0A1128]">Sarah.</h2>
            </div>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              <BellIcon />
            </button>
          </div>
          
          {/* 3D Planet Image from public folder (absolute positioned to match Figma) */}
          <img src="/planet.jpg" className="absolute right-[-40px] top-[60px] w-56 h-56 object-cover rounded-full shadow-lg" style={{zIndex: 0, clipPath: 'circle(40%)'}} alt="Planet" />

          {/* Today's Energy */}
          <div className="px-6 mt-16 relative z-10">
            <div className="beige-gradient rounded-[24px] p-6 shadow-sm flex justify-between items-center relative overflow-hidden cursor-pointer" onClick={() => { triggerHaptic(); setView('daily_reading'); }}>
              <div>
                <p className="text-[#0A1128] text-sm font-semibold mb-1">Today&apos;s Energy</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[#0A1128]">{dailyData ? dailyData.score : '--'}</span>
                  <span className="text-sm font-medium text-[#0A1128]">/ 100</span>
                </div>
                <p className="text-xs text-[#0A1128]/70 mt-1">{dailyData ? dailyData.summary : 'Calculating...'}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-yellow-300 shadow-inner mr-4 flex items-center justify-center text-3xl">✨</div>
            </div>
          </div>

          {/* AstroGPT Feature Grid */}
          <div className="px-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#0A1128]">Discover Your Path</h3>
              <button className="text-xs font-semibold text-[#635BFF]" onClick={() => setView('timeline')}>View Timeline</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Tarot Insights */}
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" onClick={() => { triggerHaptic(); setSelectedCategory('traditional'); setView('chat'); }}>
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl mb-3">🃏</div>
                <h4 className="font-bold text-sm text-[#0A1128]">Tarot Insights</h4>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium leading-tight">AI spiritual card reading</p>
              </div>

              {/* Love Compatibility */}
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" onClick={() => { triggerHaptic(); setSelectedCategory('love'); setView('chat'); }}>
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl mb-3">❤️</div>
                <h4 className="font-bold text-sm text-[#0A1128]">Compatibility</h4>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium leading-tight">Check relationship harmony</p>
              </div>

              {/* Numerology */}
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" onClick={() => { triggerHaptic(); setSelectedCategory('traditional'); setView('chat'); }}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl mb-3">🔢</div>
                <h4 className="font-bold text-sm text-[#0A1128]">Numerology</h4>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium leading-tight">Your life path numbers</p>
              </div>

              {/* Spiritual Guidance */}
              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" onClick={() => { triggerHaptic(); setSelectedCategory('growth'); setView('chat'); }}>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl mb-3">🧘</div>
                <h4 className="font-bold text-sm text-[#0A1128]">Spiritual Guide</h4>
                <p className="text-[10px] text-[#64748B] mt-1 font-medium leading-tight">Connect with inner wisdom</p>
              </div>
            </div>
          </div>

          {/* Palm Scanner & Birth Chart Hero Cards */}
          <div className="px-6 mt-6 flex flex-col gap-4">
            <div className="bg-[#0A1128] rounded-[24px] p-6 shadow-xl flex justify-between items-center cursor-pointer relative overflow-hidden" onClick={() => { triggerHaptic(); setView('palm'); }}>
              <div className="relative z-10">
                <h4 className="font-bold text-lg text-white">Live Palm Scanner</h4>
                <p className="text-sm font-medium text-white/70 mt-1">AI decodes your palm lines</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/10 relative z-10 flex justify-center items-center text-2xl">✋</div>
              <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#635BFF] rounded-full blur-2xl opacity-40"></div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex justify-between items-center cursor-pointer relative overflow-hidden" onClick={() => { triggerHaptic(); setView('birth_chart'); }}>
              <div className="relative z-10">
                <h4 className="font-bold text-lg text-[#0A1128]">Full Birth Chart</h4>
                <p className="text-sm font-medium text-[#64748B] mt-1">Detailed cosmic blueprint</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#F8F9FB] border border-slate-100 relative z-10 flex justify-center items-center text-2xl">🪐</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI CHAT INTERFACE */}
      {view === 'chat' && (
        <div className="flex-1 flex flex-col bg-white z-20 overflow-hidden">
          <div className="flex items-center p-6 border-b border-slate-50 pt-12 shrink-0">
            <button className="w-8 h-8 bg-[#F8F9FB] rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {
              if (chatMessages.length > 0) {
                setChatMessages([]);
              } else {
                setView('home');
              }
            }}><ChevronLeftIcon /></button>
            <h2 className="flex-1 text-center font-bold text-[#0A1128] mr-8">AI Chat</h2>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8F9FB]">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col flex-1">
                {/* Hero */}
                <div className="p-6 pb-2 text-center">
                  <h3 className="text-2xl font-bold text-[#0A1128] mb-2">Ask AstroMind AI</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">Get personalized guidance based on your selected traditions, birth chart, and palm analysis.</p>
                </div>
                
                {/* Quick Actions (Horizontal Scroll) */}
                <div className="w-full overflow-x-auto no-scrollbar py-4 px-6">
                  <div className="flex gap-3">
                    {quickActions.map(action => (
                      <button key={action.id} onClick={() => {
                        if (action.id === 'palm') setView('palm');
                        else if (action.id === 'birth_chart') setView('birth_chart');
                        else if (action.id === 'daily_horoscope') setView('daily_reading');
                        else if (action.id === 'timeline') setView('timeline');
                      }} className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-sm font-semibold text-[#0A1128] whitespace-nowrap shadow-sm hover:bg-slate-50 transition-colors">
                        <span>{action.icon}</span> {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories (Horizontal Scroll) */}
                <div className="w-full overflow-x-auto no-scrollbar py-2 px-6">
                  <div className="flex gap-2">
                    {promptCategories.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-[#0A1128] text-white' : 'bg-[#E2E8F0] text-[#64748B] hover:bg-slate-300'}`}>
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompts Grid */}
                <div className="p-6 grid grid-cols-2 gap-3 pb-32">
                  {promptCategories.find(c => c.id === selectedCategory)?.prompts.map((prompt, idx) => (
                    <button key={idx} onClick={() => handleSendMessage(prompt)} className="bg-white border border-slate-100 rounded-[16px] p-4 text-left text-xs font-medium text-[#0A1128] shadow-sm hover:border-[#635BFF] transition-colors leading-relaxed flex flex-col justify-between min-h-[90px]">
                      <span>{promptCategories.find(c => c.id === selectedCategory)?.icon}</span>
                      <span className="mt-2 line-clamp-3">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 flex flex-col gap-4 pb-32">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] ${msg.sender === 'ai' ? 'bg-white text-[#64748B] rounded-tl-sm self-start' : 'bg-[#E2E8F0] text-[#0A1128] font-medium rounded-tr-sm self-end'}`}>
                    {msg.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm text-sm text-[#64748B] max-w-[85%] shadow-sm self-start flex gap-2 items-center">
                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                     <div className="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 bg-white border-t border-slate-50 flex items-center gap-4 shrink-0 absolute bottom-0 left-0 right-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
             <input type="text" placeholder="Ask a question..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="bg-[#F8F9FB] flex-1 py-4 px-6 rounded-full text-[#0A1128] font-medium text-sm focus:outline-none focus:border-[#635BFF] border border-slate-100" />
             <button onClick={() => handleSendMessage()} disabled={isChatLoading} className="w-12 h-12 rounded-full bg-[#0A1128] text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0 cursor-pointer transition-transform active:scale-95 hover:bg-slate-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
             </button>
          </div>
        </div>
      )}

      {/* 6. BIRTH CHART */}
      {view === 'birth_chart' && (
        <div className="flex-1 flex flex-col bg-[#F8F9FB] z-20">
          <div className="flex items-center p-6 pt-12 justify-between">
            <button className="text-[#0A1128]" onClick={() => setView('home')}><ChevronLeftIcon /></button>
            <h2 className="font-bold text-lg text-[#0A1128]">Birth Chart</h2>
            <button className="text-[#0A1128]"><MoonIcon /></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-between p-6 pb-32">
            <div className="flex-1 w-full flex items-center justify-center">
              <img src="/chart.jpg" alt="Chart" className="w-full max-w-[350px] h-auto object-contain mix-blend-multiply" />
            </div>
            
            <div className="bg-white w-full rounded-[24px] p-6 flex justify-around shadow-sm mt-8">
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-sm text-[#0A1128] mb-1">Natal</span>
                <span className="text-[11px] text-[#64748B] font-medium">Chart</span>
                <span className="text-[10px] text-slate-400 mt-1">Primary</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-sm text-[#0A1128] mb-1">Dasha</span>
                <span className="text-[11px] text-[#64748B] font-medium">Period</span>
                <span className="text-[10px] text-slate-400 mt-1">Active</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-sm text-[#0A1128] mb-1">Daily</span>
                <span className="text-[11px] text-[#64748B] font-medium">Reading</span>
                <span className="text-[10px] text-slate-400 mt-1">Moon</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. HERO'S JOURNEY (TIMELINE) */}
      {view === 'timeline' && (
        <div className="flex-1 flex flex-col bg-[#F8F9FB] z-20">
          <div className="flex items-center p-6 pt-12 bg-white">
            <button className="text-[#0A1128]" onClick={() => setView('home')}><ChevronLeftIcon /></button>
            <h2 className="flex-1 text-center font-bold text-lg mr-6 text-[#0A1128]">Hero&apos;s Journey</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
             <div className="relative w-full py-12 pb-32">
                <div className="absolute left-1/2 top-8 bottom-12 w-[2px] bg-slate-300 -translate-x-1/2"></div>
                
                {isAstrologyLoading && (
                  <div className="text-center text-slate-500 text-sm mt-8">Calculating your transits...</div>
                )}
                
                {astrologyData?.currentTransits?.map((transit: any, idx: number) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className="flex w-full items-start justify-center mb-12 relative">
                      <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : 'pr-8 opacity-0'} flex flex-col items-end`}>
                        {isLeft && (
                          <>
                            <h4 className="font-bold text-sm text-[#0A1128]">{transit.planet}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">Current Transit</p>
                          </>
                        )}
                      </div>
                      
                      <div className={`absolute left-1/2 -translate-x-1/2 top-0 w-6 h-6 rounded-full flex items-center justify-center border-[4px] border-[#F8F9FB] ${isLeft ? 'bg-[#635BFF]' : 'bg-[#FBBF24]'}`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>

                      <div className={`w-1/2 ${isLeft ? 'pl-8 opacity-0' : 'pl-8'} flex flex-col items-start`}>
                        {!isLeft && (
                          <>
                            <h4 className="font-bold text-sm text-[#0A1128]">{transit.planet}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">Current Transit</p>
                          </>
                        )}
                        <h4 className="font-bold text-sm text-[#0A1128] mt-1 mb-1">{transit.status}</h4>
                        <div className="bg-[#EEF2FF] text-[#635BFF] text-[10px] font-bold px-2 py-1 rounded w-fit mt-1 text-left leading-tight">
                          {transit.meaning}
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}

      {/* 8. PALM ANALYSIS */}
      {view === 'palm' && (
        <div className="flex-1 flex flex-col bg-white z-20">
          <div className="flex items-center p-6 pt-12 border-b border-slate-50">
            <button className="text-[#0A1128]" onClick={() => setView('home')}><ChevronLeftIcon /></button>
            <h2 className="flex-1 text-center font-bold text-lg mr-6 text-[#0A1128]">Palm Analysis</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-start bg-[#F8F9FB] p-6 pt-8 overflow-y-auto pb-32">
            {profile.name && profile.birthPlace && (
              <div className="bg-[#EEF2FF] text-[#635BFF] px-4 py-3 rounded-2xl text-sm font-semibold w-full text-center mb-6 border border-[#E0E7FF] shrink-0">
                ✨ Calibrated for {profile.name} ({profile.birthPlace})
              </div>
            )}
            <img src="/palm.jpg" className="w-[80%] h-auto max-w-[300px] rounded-3xl mix-blend-multiply shadow-sm mb-8 shrink-0" alt="Palm" />
            
            {palmError && (
              <div className="text-red-500 text-sm font-medium mb-4 text-center bg-red-50 p-3 rounded-xl border border-red-100 shrink-0 w-full">
                {palmError}
              </div>
            )}
            {!palmData ? (
              <div className="flex flex-col gap-3 w-full shrink-0">
                <button onClick={async () => {
                  triggerHaptic();
                  import('@capacitor/core').then(async ({ Capacitor }) => {
                    if (Capacitor.isNativePlatform()) {
                      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
                      try {
                        const image = await Camera.getPhoto({
                          quality: 80,
                          allowEditing: false,
                          resultType: CameraResultType.Base64,
                          source: CameraSource.Camera
                        });
                        setIsPalmLoading(true);
                        setPalmError(null);
                        const base64String = `data:image/jpeg;base64,${image.base64String}`;
                        const res = await fetch('/api/palm-reader', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ imageBase64: base64String })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setPalmData(data.reading);
                        } else {
                          setPalmError(data.error || 'Failed to analyze palm.');
                        }
                      } catch (e) {
                        console.error(e);
                      }
                      setIsPalmLoading(false);
                    } else {
                      startCamera();
                    }
                  });
                }} disabled={isPalmLoading} className={`w-full bg-[#0A1128] text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 ${isPalmLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'} transition-colors`}>
                  <CameraIcon /> {isPalmLoading ? 'Scanning...' : 'Open Scanner'}
                </button>
                {cameraError && (
                  <div className="text-red-500 text-xs text-center px-4">
                    {cameraError}
                  </div>
                )}
                <label className="text-sm font-medium text-[#64748B] underline text-center cursor-pointer w-full mt-2 hover:text-[#0A1128] transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleScanPalm} disabled={isPalmLoading} />
                  Or upload from photo library
                </label>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-[24px] w-full shadow-sm text-left mb-8 shrink-0">
                <h3 className="font-bold text-lg mb-4 text-[#0A1128]">Palm Reading Results</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#635BFF] uppercase tracking-wider mb-1">Life Line</h4>
                    <p className="text-sm font-medium text-[#0A1128]">{palmData.lifeLine.length}</p>
                    <p className="text-xs text-slate-500 mt-1">{palmData.lifeLine.meaning}</p>
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  <div>
                    <h4 className="text-xs font-bold text-[#635BFF] uppercase tracking-wider mb-1">Heart Line</h4>
                    <p className="text-sm font-medium text-[#0A1128]">{palmData.heartLine.length}</p>
                    <p className="text-xs text-slate-500 mt-1">{palmData.heartLine.meaning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. DAILY READING */}
      {view === 'daily_reading' && (
        <div className="flex-1 flex flex-col bg-[#F8F9FB] z-20">
          <div className="flex items-center p-6 pt-12 bg-[#F8F9FB]">
            <button className="text-[#0A1128]" onClick={() => setView('home')}><ChevronLeftIcon /></button>
            <h2 className="flex-1 text-center font-bold text-lg mr-6 text-[#0A1128]">Daily Reading</h2>
          </div>
          <div className="p-6">
             <div className="bg-white rounded-[24px] shadow-sm overflow-hidden p-0 mb-20">
                <div className="bg-white rounded-[24px] p-6 shadow-sm w-full shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full opacity-50"></div>
              <h3 className="text-2xl font-bold text-[#0A1128] mb-4 relative z-10">{dailyData ? dailyData.readingTitle : 'Cosmic Energy Reading'}</h3>
              
              {isDailyLoading ? (
                <p className="text-sm text-[#64748B] leading-relaxed mb-6 animate-pulse">
                  Consulting the cosmos for your daily alignment...
                </p>
              ) : (
                <p className="text-sm text-[#64748B] leading-relaxed mb-6 relative z-10">
                  {dailyData ? dailyData.readingBody : 'Complete your cosmic profile to receive daily insights.'}
                </p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 relative z-10">
                <span className="text-xs font-bold text-[#0A1128] uppercase tracking-wider">Overall Energy</span>
                <span className="text-[#635BFF] font-bold text-lg">{dailyData ? dailyData.score : '--'}/100</span>
              </div>
            </div>
             </div>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR */}
      {['home', 'birth_chart', 'timeline', 'palm', 'daily_reading'].includes(view) && (
        <div className="absolute bottom-0 w-full h-[90px] bg-white rounded-t-[32px] flex justify-between items-center px-8 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] z-50">
          <button className="text-[#0A1128]" onClick={() => setView('home')}><HomeIcon /></button>
          <button className="text-[#A0AEC0]" onClick={() => setView('birth_chart')}><GridIcon /></button>
          
          <div className="relative bottom-8">
             <button className="floating-button" onClick={() => setView('chat')}><SparkleIcon /></button>
          </div>

          <button className="text-[#A0AEC0]"><BellIcon /></button>
          <button className="text-[#A0AEC0]"><UserIcon /></button>
        </div>
      )}

      {/* FULL SCREEN CAMERA OVERLAY */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
          <button onClick={stopCamera} className="absolute top-12 left-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm z-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Viewfinder Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-[80vw] max-w-[320px] h-[60vh] max-h-[500px] border-2 border-dashed border-white/50 rounded-[40px] flex items-center justify-center bg-white/5">
               <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"><path d="M18 10V5a2 2 0 0 0-4 0v4H14V3a2 2 0 0 0-4 0v6H10V4a2 2 0 0 0-4 0v7a2 2 0 0 0-2 2v4c0 3 2 6 5 6h4c4 0 7-4 7-8v-5h-2z"/></svg>
            </div>
          </div>
          
          <div className="absolute bottom-12 w-full flex justify-center z-20">
            <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform">
              <div className="w-full h-full bg-white rounded-full"></div>
            </button>
          </div>
          
          <div className="absolute top-12 right-0 left-0 text-center text-white text-sm font-medium tracking-wide z-20 pointer-events-none drop-shadow-md">
            Align your palm inside the outline
          </div>
        </div>
      )}

    </div>
  );
}
