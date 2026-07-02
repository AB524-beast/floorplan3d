"use client";
import React, { useState } from 'react';
import Canvas2D from '../components/Canvas2D';
import Viewer3D from '../components/Viewer3D';
import { Layers } from 'lucide-react';

export default function Home() {
  const [walls, setWalls] = useState([]);
  const [labels, setLabels] = useState([]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Structural Header Navigation */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Blueprint Engine Pro</h1>
            <p className="text-xs text-slate-400 font-medium">Production-Ready AI Vectorizer & 3D Extruder</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Core Processing Node Active
        </div>
      </header>

      {/* Main Structural App Split Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full">
          <Canvas2D walls={walls} setWalls={setWalls} setLabels={setLabels} />
        </div>
        <div className="w-full h-full">
          <Viewer3D walls={walls} />
        </div>
      </div>
    </main>
  );
}