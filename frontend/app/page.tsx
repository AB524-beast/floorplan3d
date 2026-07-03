'use client';

import React, { useState } from 'react';

// Define the interface matching the Pydantic schema from the FastAPI backend
interface RoomData {
  label: string;
  dimensions: string;
  confidence: number;
}

export default function Home() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // App states with explicit TypeScript types
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Toggle Dark Mode globally
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Drag and Drop handlers with explicit React event mapping
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcessing(e.target.files[0]);
    }
  };

  // Connect to FastAPI Backend
  const handleFileProcessing = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    setRooms([]);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      
      // Simulate a slight delay for a smoother loader transition animation
      setTimeout(() => {
        setRooms(data.rooms);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Error connecting to CV service:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-colors duration-500">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse" />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            FloorPlan3D
          </span>
        </div>
        
        {/* Modern Dark/Light Toggle Switch */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm flex items-center justify-center group"
          aria-label="Toggle Theme"
        >
          {darkMode ? (
            <svg className="w-5 h-5 text-amber-400 transition-transform group-hover:rotate-45 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 5.757a5 5 0 1110 0 5 5 0 01-10 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-indigo-600 transition-transform group-hover:-rotate-12 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* DASHBOARD BODY */}
      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-85px)]">
        
        {/* LEFT PANEL: CONTROLS & PARSED DATA */}
        <section className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* File Upload Component */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group min-h-[220px] ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]' 
                : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            
            {file ? (
              <div>
                <p className="font-semibold text-sm truncate max-w-[250px]">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-sm">Drag and drop your plan, or <span className="text-indigo-500 font-semibold group-hover:underline">browse</span></p>
                <p className="text-xs text-slate-400 mt-2">Supports high-res PNG or JPEG blueprints</p>
              </div>
            )}
          </div>

          {/* Data Extraction Section */}
          <div className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-2xl p-6 shadow-sm overflow-y-auto min-h-[300px]">
            <h3 className="font-semibold text-sm tracking-wide uppercase text-slate-400 mb-4">Detected Layout Data</h3>
            
            {isUploading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400 animate-pulse">Running computer vision models...</p>
              </div>
            )}

            {!isUploading && rooms.length === 0 && (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">Upload a blueprint to view structured analytics.</p>
              </div>
            )}

            {!isUploading && rooms.length > 0 && (
              <div className="space-y-3">
                {rooms.map((room, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 rounded-xl flex justify-between items-center hover:translate-x-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{room.label}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{room.dimensions}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        {(room.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: 3D VIEWPORT CONTAINER */}
        <section className="lg:col-span-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-2xl relative shadow-sm overflow-hidden flex flex-col group">
          
          {/* Utility Badge overlays over 3D canvas */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md shadow-md">
              3D Viewport
            </span>
            {rooms.length > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500 text-white shadow-md animate-bounce">
                Model Ready
              </span>
            )}
          </div>

          {/* Interactive Placeholder Area for your Three.js / React Three Fiber Canvas */}
          <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-center p-8 transition-colors duration-500 relative">
            
            {/* Blueprint grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-70" />
            
            <div className="z-10 max-w-sm pointer-events-none">
              <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M10 21l2-1 2 1m-2-1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <p className="font-semibold text-base mb-1">Interactive WebGL Environment</p>
              <p className="text-sm text-slate-400">Three.js scene with OrbitControls will hook into this zone to render extruded structural polygons.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}