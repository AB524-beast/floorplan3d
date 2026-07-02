"use client";
import React, { useState } from 'react';
import Canvas2D from '../components/Canvas2D';
import Viewer3D from '../components/Viewer3D';
import Cubes from '../components/Cubes';
import { Layers, Sparkles } from 'lucide-react';

export default function Home() {
  const [walls, setWalls] = useState([]);
  const [labels, setLabels] = useState([]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Universal Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">FloorPlan3D Workspace</h1>
              <p className="text-xs text-gray-500 font-medium">AI-Assisted 2D Blueprint Tracing & 3D Extrusion Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
              Core CV API Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body Context */}
      <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
        
        {/* If workspace is blank, print the creative layout header display stack */}
        {walls.length === 0 && (
          <div className="w-full rounded-2xl overflow-hidden relative shadow-lg bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[340px]">
            {/* Background design layer injection container hook */}
            <div className="absolute inset-0 z-0 opacity-40">
              <Cubes 
                gridSize={10}
                faceColor="#0f172a"
                borderColor="#6366f1"
                rippleColor="#ec4899"
                autoAnimate={true}
              />
            </div>

            {/* Typography Content Layer */}
            <div className="relative z-10 max-w-md text-left flex flex-col gap-2 p-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                <Sparkles size={12} /> Next-Gen Extrusion Engine
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Ready to transform blueprints into 3D models?
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload a physical blueprint plan to trigger our automated local OpenCV matrix parsing layers, or manually trace vectors directly on the editor canvas panel down below.
              </p>
            </div>
          </div>
        )}

        {/* Master Operational Columns Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="w-full">
            // Find where Canvas2D is invoked inside frontend/src/app/page.js and ensure both hooks map out:
            <Canvas2D 
              walls={walls} 
              setWalls={setWalls} 
              labels={labels}
              setLabels={setLabels} 
            />  
          </div>

          <div className="w-full">
            <Viewer3D 
              walls={walls} 
              labels={labels} 
            />
          </div>
        </div>

        {/* OCR Labels Footer Element */}
        {labels.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Detected Room Layers</h3>
            <div className="flex flex-wrap gap-2">
              {labels.map((lbl, i) => (
                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100 shadow-sm">
                  🏢 {lbl.text} <span className="text-indigo-400 ml-1">({lbl.position.x}, {lbl.position.y})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}