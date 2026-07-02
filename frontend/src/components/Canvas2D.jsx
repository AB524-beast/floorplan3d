"use client";
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, Crosshair, Sparkles, FileImage, Layers3 } from 'lucide-react';

export default function Canvas2D({ walls, setWalls, setLabels }) {
  const canvasRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileName, setFileName] = useState("");

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
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
    }

    ctx.strokeStyle = '#4f46e5'; 
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });
  }, [walls, backgroundImage]);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("Invalid file format. Please upload a standard image asset.");
      return;
    }
    if (canvasRef.current) canvasRef.current.filePayload = file; 
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = async (e) => {
    const file = canvasRef.current?.filePayload;
    if (!file) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = Math.round(e.clientX - rect.left);
    const clickY = Math.round(e.clientY - rect.top);

    setProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/auto-detect?click_x=${clickX}&click_y=${clickY}&ocr=1`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        // Replace by default for deterministic results; avoid uncontrolled wall accumulation.
        setWalls(response.data.walls);
        setLabels(response.data.labels || []);
      }


    } catch (err) {
      console.error("Region processing breakdown:", err);
      alert("Region processing failed. Check backend logs and ensure OCR/tesseract is configured if OCR is enabled.");
    } finally {
      setProcessing(false);
    }

  };

  const handleFullAIAnalysis = async () => {
    const file = canvasRef.current?.filePayload;
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/auto-detect", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setWalls(response.data.walls);
      }
    } catch (err) {
      alert("Pipeline connectivity failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); processFile(e.dataTransfer.files[0]); }}
        className={`w-full mb-5 p-4 border-2 border-dashed rounded-xl transition-all duration-200 ${
          isDraggingOver ? 'border-indigo-500 bg-indigo-50/40 scale-[0.99]' : 'border-slate-200 bg-slate-50/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg transition-colors ${fileName ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              <FileImage size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[240px]">
                {fileName ? fileName : "Drag & drop plan blueprint here"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Standard floor plan image format context</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm cursor-pointer transition">
              <Upload size={13} /> Browse
              <input type="file" accept="image/*" className="hidden" onChange={(e) => processFile(e.target.files[0])} />
            </label>
            <button 
              onClick={handleFullAIAnalysis}
              disabled={processing || !fileName}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-sm shadow-indigo-100 transition ${
                processing || !fileName ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Sparkles size={13} /> Analyze All
            </button>
            <button 
              onClick={() => { setWalls([]); setLabels([]); setBackgroundImage(null); setFileName(""); }} 
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          className={`transition-opacity duration-300 ${processing ? 'opacity-40' : 'opacity-100'} ${fileName ? 'cursor-crosshair' : 'cursor-default'}`}
        />
        {!fileName && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <Layers3 size={24} className="text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-400">Viewport Inactive</p>
            <p className="text-[10px] text-slate-400/80 mt-0.5">Please populate a blueprint configuration above</p>
          </div>
        )}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xl animate-pulse">
              <Crosshair size={13} className="animate-spin text-indigo-400" /> Computing Extrusions...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}