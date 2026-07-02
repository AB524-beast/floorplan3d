"use client";
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function ArchitecturalWall({ wall, isHovered, onHover, onUnhover }) {
  const { start, end } = wall;

  // Recenter coordinates around Three.js viewport center points
  const startX = start.x - 300;
  const startZ = start.y - 250;
  const endX = end.x - 300;
  const endZ = end.y - 250;

  const dx = endX - startX;
  const dz = endZ - startZ;
  const wallLength = Math.hypot(dx, dz);

  const wallHeight = 35;
  const wallThickness = 6; 

  const midX = (startX + endX) / 2;
  const midZ = (startZ + endZ) / 2;
  const posY = wallHeight / 2; 
  const angleY = Math.atan2(dz, dx);

  return (
    <mesh 
      position={[midX, posY, midZ]} 
      rotation={[0, -angleY, 0]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
      onPointerOut={() => onUnhover()}
    >
      <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
      <meshStandardMaterial 
        color={isHovered ? "#6366f1" : "#e2e8f0"} 
        roughness={0.4} 
        metalness={0.1} 
      />
    </mesh>
  );
}

export default function Viewer3D({ walls }) {
  const [hoveredWall, setHoveredWall] = useState(null);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 w-full h-full">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Continuous 3D Architectural Model
        </h2>
      </div>

      <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
        <Canvas camera={{ position: [150, 300, 350], fov: 45 }}>
          <ambientLight intensity={1.3} />
          <directionalLight position={[200, 400, 250]} intensity={1.6} castShadow />
          <pointLight position={[-200, 200, -200]} intensity={0.5} />

          {/* Render continuous interconnected panels */}
          {walls.map((wall, idx) => (
            <ArchitecturalWall 
              key={idx} 
              wall={wall} 
              isHovered={hoveredWall === idx}
              onHover={() => setHoveredWall(idx)}
              onUnhover={() => setHoveredWall(null)}
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
            minDistance={50}
            maxDistance={800}
            autoRotate={true}
            autoRotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 2.1} 
          />
        </Canvas>
      </div>
    </div>
  );
}