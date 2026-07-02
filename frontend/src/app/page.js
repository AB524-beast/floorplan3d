"use client";
import React, { useState } from 'react';
import Canvas2D from '../components/Canvas2D';
import Viewer3D from '../components/Viewer3D';
import { Layers } from 'lucide-react';

export default function Home() {
  // Shared structural coordinate state vectors
  const [walls, setWalls] = useState([]);
  const [labels, setLabels] = useState([]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Universal Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-200">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">FloorPlan3D Workspace</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Assisted 2D Blueprint Tracing & 3D Extrusion Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Core CV API Connected</span>
          </div>
        </div>
      </header>

      {/* Main Interactive Grid Space */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* 2D Input Blueprint Tracer Canvas */}
        <div className="w-full">
          <Canvas2D 
            walls={walls} 
            setWalls={setWalls} 
            setLabels={setLabels} 
          />
        </div>

        {/* 3D Viewport Area */}
        <div className="w-full h-[560px]">
          <Viewer3D 
            walls={walls} 
            labels={labels} 
          />
        </div>

      </div>

      {/* OCR Spatial Label Dashboard Track list overlay */}
      {labels.length > 0 && (
        <footer className="max-w-7xl mx-auto px-6 pb-12">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Detected Room Meta-Layers</h3>
            <div className="flex flex-wrap gap-2">
              {labels.map((lbl, i) => (
                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100 shadow-sm">
                  🏢 {lbl.text} <span className="text-indigo-400 ml-1">({lbl.position.x}, {lbl.position.y})</span>
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}