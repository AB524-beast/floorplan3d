"use client";
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

// Helper component that transforms 2D coordinates into an extruded 3D Box Mesh
function Wall3D({ wall }) {
  const { start, end } = wall;

  // 1. Calculate dimensions using simple Euclidean distance formulas
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  // 2. Define standard architectural variables (Height and Thickness)
  const wallHeight = 40;
  const wallThickness = 4;

  // 3. Find the center position point to place the mesh pivot
  // Shift coordinates so that (0,0) centers nicely around the canvas area
  const posX = (start.x + end.x) / 2 - 300; 
  const posZ = (start.y + end.y) / 2 - 250; 
  const posY = wallHeight / 2; // Sit walls flush on top of the ground grid

  // 4. Calculate rotation angle using trigonometry (Y-axis rotation)
  const angle = Math.atan2(dy, dx);

  return (
    <mesh position={[posX, posY, posZ]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, wallHeight, wallThickness]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

export default function Viewer3D({ walls }) {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 w-full h-full">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">3D Real-time Viewport</h2>
      </div>

      <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
        <Canvas camera={{ position: [0, 350, 400], fov: 50 }}>
          {/* Ambient Lighting + Positional Shadows */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[100, 300, 200]} intensity={2.0} castShadow />
          <pointLight position={[-100, 200, -200]} intensity={0.5} />

          {/* Render individual extruded wall geometries */}
          {walls.map((wall, idx) => (
            <Wall3D key={idx} wall={wall} />
          ))}

          {/* Infinite Perspective Environment Floor Grid */}
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

          {/* Mouse Orbit, Rotation, and Zoom control parameters */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={100}
            maxDistance={800}
            maxPolarAngle={Math.PI / 2.1} // Prevent orbiting below the floor
          />
        </Canvas>
      </div>
    </div>
  );
}