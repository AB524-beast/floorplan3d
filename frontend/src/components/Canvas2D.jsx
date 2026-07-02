"use client";
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Cpu, Trash2 } from 'lucide-react';

export default function Canvas2D({ walls, setWalls, setLabels }) {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Standard canvas dimensions matching our aspect area constraints
  const width = 600;
  const height = 500;

  // Render loop: draws background plan image, grid, finalized walls, and active drawing previews
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear viewport frame
    ctx.clearRect(0, 0, width, height);

    // 1. Draw uploaded baseline floorplan image asset if initialized
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      // Background Grid Placeholder when empty
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
    }

    // 2. Draw all finalized structural walls inside the array state
    ctx.strokeStyle = '#1e1b4b'; // Dark Indigo
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    // 3. Draw transient preview trace line during active mouse drag sequences
    if (isDrawing && startPoint && currentMousePos) {
      ctx.strokeStyle = '#3b82f6'; // Interactive Blue
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // Dashed blueprint trace preview style
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash line configuration mapping
    }
  }, [walls, backgroundImage, isDrawing, startPoint, currentMousePos]);

  // Handle local blueprint asset selection upload mapping cleanly
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Save raw file payload safely right on the element reference for our API
    if (canvasRef.current) {
      canvasRef.current.filePayload = file;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Enforce React state update once the image object is fully ready in memory
        setBackgroundImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Trigger Computer Vision layout pipeline requests
  const handleAIAutoDetect = async () => {
    const file = canvasRef.current?.filePayload;
    if (!file) {
      alert("Please upload a floor plan blueprint image first!");
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
      } else {
        alert("AI detection completed with an empty parsing index array.");
      }
    } catch (error) {
      console.error("API Connection dropped:", error);
      alert("Failed to hit the local Python server module.");
    } finally {
      setUploading(false);
    }
  };

  // Capture canvas layout click-drag metrics
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
    
    // Ignore micro accidental clicks
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">2D Input Blueprint Canvas</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition">
            <Upload size={14} /> Upload Plan
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <button 
            onClick={handleAIAutoDetect}
            disabled={uploading}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${uploading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-medium rounded-lg transition`}
          >
            <Cpu size={14} /> {uploading ? "Processing..." : "AI Auto-Detect"}
          </button>
          <button 
            onClick={() => { setWalls([]); setLabels([]); setBackgroundImage(null); }}
            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Clear workspace state"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-gray-300 rounded-lg shadow-inner bg-slate-50 cursor-crosshair max-w-full"
      />
    </div>
  );
}