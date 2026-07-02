"use client";
import React, { useState, useEffect } from 'react';

export default function Cubes({ 
  gridSize = 8, 
  faceColor = "#1a1a2e", 
  borderColor = "#B497CF", 
  rippleColor = "#ff6b6b",
  autoAnimate = true 
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pulseWave, setPulseWave] = useState(0);

  // Auto-animate wave loops to mimic the background ripple effects
  useEffect(() => {
    if (!autoAnimate) return;
    const interval = setInterval(() => {
      setPulseWave((prev) => (prev + 1) % (gridSize * 2));
    }, 300);
    return () => clearInterval(interval);
  }, [autoAnimate, gridSize]);

  const totalBlocks = gridSize * gridSize;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center p-8 bg-slate-950 rounded-xl">
      <div 
        className="grid gap-2 w-full h-full max-w-2xl max-h-[400px]"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          perspective: '800px'
        }}
      >
        {Array.from({ length: totalBlocks }).map((_, idx) => {
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;
          const distanceFromWave = Math.abs((row + col) - pulseWave);
          
          // Determine structural transform scale shifts
          const isWaving = autoAnimate && distanceFromWave === 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-full h-full rounded transition-all duration-300 ease-out cursor-pointer relative"
              style={{
                backgroundColor: isHovered ? rippleColor : faceColor,
                border: `1.5px dashed ${borderColor}`,
                transform: isHovered 
                  ? 'translateZ(20px) rotateX(10deg)' 
                  : isWaving 
                  ? 'translateZ(10px) scale(1.05)' 
                  : 'translateZ(0px)',
                boxShadow: isHovered ? `0 10px 20px ${rippleColor}40` : 'none',
                opacity: isWaving ? 0.9 : 0.6
              }}
            />
          );
        })}
      </div>
    </div>
  );
}