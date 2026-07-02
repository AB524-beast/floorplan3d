"use client";
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Cpu, Trash2, Volume2 } from 'lucide-react';

export default function Canvas2D({ walls, setWalls, labels, setLabels }) {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [uploading, setUploading] = useState(false);

  const width = 600;
  const height = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
    }

    ctx.strokeStyle = '#1e1b4b'; 
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    if (isDrawing && startPoint && currentMousePos) {
      ctx.strokeStyle = '#3b82f6'; 
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]); 
    }
  }, [walls, backgroundImage, isDrawing, startPoint, currentMousePos]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (canvasRef.current) {
      canvasRef.current.filePayload = file; 
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAIAutoDetect = async () => {
    const file = canvasRef.current?.filePayload;
    if (!file) {
      alert("Please upload a blueprint plan first!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/auto-detect", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setWalls(response.data.walls);
        setLabels(response.data.labels);
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Failed to reach local backend server.");
    } finally {
      setUploading(false);
    }
  };

  const speakRoomLabel = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(`Reading section: ${text}`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    };
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPoint(pos);
    setCurrentMousePos(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    setCurrentMousePos(getMousePos(e));
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    const endPoint = getMousePos(e);
    const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    if (distance > 5) {
      setWalls([...walls, { start: startPoint, end: endPoint }]);
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMousePos(null);
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between w-full mb-3 gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">2D Blueprint Workspace</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition">
            <Upload size={14} /> Upload Plan
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <button 
            onClick={handleAIAutoDetect}
            disabled={uploading}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${uploading ? 'bg-indigo-300' : 'bg-indigo-600'} text-white text-xs font-medium rounded-lg transition`}
          >
            <Cpu size={14} /> {uploading ? "Analyzing..." : "AI Auto-Detect"}
          </button>
          <button onClick={() => { setWalls([]); setLabels([]); setBackgroundImage(null); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="relative border border-gray-300 rounded-lg overflow-hidden max-w-full">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="bg-slate-50 cursor-crosshair"
        />

        {labels && labels.map((lbl, idx) => (
          <button
            key={idx}
            onClick={() => speakRoomLabel(lbl.text)}
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-indigo-600/90 hover:bg-emerald-600 text-white font-bold rounded shadow-md text-[10px] tracking-wide flex items-center gap-1 border border-white/40 transition active:scale-95"
            style={{
              left: `${lbl.position.x}px`,
              top: `${lbl.position.y}px`
            }}
            title={`Click to read: ${lbl.text}`}
          >
            <Volume2 size={10} />
            {lbl.text}
          </button>
        ))}
      </div>
    </div>
  );
}