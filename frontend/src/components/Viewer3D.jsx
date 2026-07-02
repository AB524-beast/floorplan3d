"use client";
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function ArchitecturalWall({ wall, isHovered, onHover, onUnhover }) {
  const { start, end } = wall;

  const startX = start.x - 300;
  const startZ = start.y - 250;
  const endX = end.x - 300;
  const endZ = end.y - 250;

  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.hypot(dx, dz);

  const wallHeight = 35;
  const wallThickness = 7;

  return (
    <mesh 
      position={[(startX + endX) / 2, wallHeight / 2, (startZ + endZ) / 2]} 
      rotation={[0, -Math.atan2(dz, dx), 0]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
      onPointerOut={() => onUnhover()}
    >
      <boxGeometry args={[length, wallHeight, wallThickness]} />
      <meshStandardMaterial 
        color={isHovered ? "#4f46e5" : "#f1f5f9"} 
        roughness={0.3} 
        metalness={0.1} 
      />
    </mesh>
  );
}

export default function Viewer3D({ walls }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full w-full">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">3D Composite Spatial Engine</h2>
      </div>

      <div className="w-full h-[544px] bg-slate-950 rounded-xl overflow-hidden border border-slate-900 shadow-inner relative group">
        <Canvas camera={{ position: [200, 320, 400], fov: 42 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[300, 500, 200]} intensity={1.8} castShadow />
          <pointLight position={[-300, 200, -300]} intensity={0.6} />

          {walls.map((wall, idx) => (
            <ArchitecturalWall 
              key={idx} 
              wall={wall} 
              isHovered={hoveredIdx === idx}
              onHover={() => setHoveredIdx(idx)}
              onUnhover={() => setHoveredIdx(null)}
            />
          ))}

          <Grid
            position={[0, -0.05, 0]}
            args={[1200, 1200]}
            cellSize={25}
            cellThickness={0.8}
            cellColor="#1e293b"
            sectionSize={100}
            sectionThickness={1.2}
            sectionColor="#334155"
            fadeDistance={700}
          />

          <OrbitControls 
            enableDamping 
            dampingFactor={0.06}
            minDistance={60}
            maxDistance={900}
            autoRotate={walls.length > 0}
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2.1} 
          />
        </Canvas>
      </div>
    </div>
  );
}