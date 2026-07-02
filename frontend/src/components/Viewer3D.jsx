"use client";
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function ContinuousWall({ wall, isHovered, onHover, onUnhover }) {
  const { start, end } = wall;

  // Center coordinate mappings around the workspace viewport bounds
  const startX = start.x - 300;
  const startZ = start.y - 250;
  const endX = end.x - 300;
  const endZ = end.y - 250;

  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.hypot(dx, dz);

  const wallHeight = 45;
  const wallThickness = 6; // Thicker walls to form connected panels

  const midX = (startX + endX) / 2;
  const midZ = (startZ + endZ) / 2;
  const posY = wallHeight / 2; 
  const angleY = Math.atan2(dz, dx);

  return (
    <mesh 
      position={[midX, posY, midZ]} 
      rotation={[0, -angleY, 0]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
      onPointerOut={(e) => onUnhover()}
    >
      <boxGeometry args={[length, wallHeight, wallThickness]} />
      <meshStandardMaterial 
        color={isHovered ? "#4f46e5" : "#cbd5e1"} 
        roughness={0.2} 
        metalness={0.1} 
      />
    </mesh>
  );
}

export default function Viewer3D({ walls }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 w-full h-full">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Interactive 3D Architectural Viewport</h2>
      </div>

      <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
        <Canvas camera={{ position: [0, 300, 400], fov: 45 }}>
          <ambientLight intensity={1.4} />
          <directionalLight position={[200, 400, 200]} intensity={1.8} castShadow />
          <pointLight position={[-200, 200, -200]} intensity={0.5} />

          {/* Render clean unified continuous wall boundaries */}
          {walls.map((wall, idx) => (
            <ContinuousWall 
              key={idx} 
              wall={wall} 
              isHovered={hoveredIdx === idx}
              onHover={() => setHoveredIdx(idx)}
              onUnhover={() => setHoveredIdx(null)}
            />
          ))}

          <Grid
            renderOrder={-1}
            position={[0, -0.1, 0]}
            args={[1000, 1000]}
            cellSize={20}
            cellThickness={1}
            cellColor="#334155"
            sectionSize={100}
            sectionThickness={1.5}
            sectionColor="#475569"
            fadeDistance={800}
          />

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={100}
            maxDistance={750}
            autoRotate={false} // Disabled default auto-rotation to let users select and inspect panels manually
            maxPolarAngle={Math.PI / 2.05} 
          />
        </Canvas>
      </div>
    </div>
  );
}