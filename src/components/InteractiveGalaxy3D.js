'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const GALAXY_NODES = [
  { id: 'transformers', name: 'Attention Is All You Need', coords: [-2.8, 1.2, 0.5], color: '#6366f1', year: 2017 },
  { id: 'ddpm', name: 'Diffusion Probabilistic Models', coords: [2.5, 2.1, -1.2], color: '#f43f5e', year: 2020 },
  { id: 'lora', name: 'LoRA: Low-Rank Adaptation', coords: [-1.4, -1.8, 1.6], color: '#22c55e', year: 2021 },
  { id: 'mamba', name: 'Mamba: Linear State Space', coords: [2.8, -1.2, 1.0], color: '#38bdf8', year: 2023 },
  { id: 'deepseek', name: 'DeepSeek-V3 Multi-Head Latent', coords: [0.5, 2.6, 1.8], color: '#a855f7', year: 2024 },
  { id: 'alphafold', name: 'AlphaFold 3 Biomolecular', coords: [-2.2, -0.6, -2.1], color: '#eab308', year: 2024 },
  { id: 'whitespace', name: '⚡ DISCOVERED RESEARCH WHITE SPACE', coords: [0.2, -0.3, 0.4], color: '#4ade80', isGap: true }
];

// Interactive 3D Paper Node
function PaperGalaxyNode({ node, isSelected, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current && node.isGap) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={node.coords}>
      <Sphere 
        ref={meshRef} 
        args={[node.isGap ? 0.35 : 0.22, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={node.color} 
          emissive={node.color} 
          emissiveIntensity={isSelected || hovered ? 3.5 : (node.isGap ? 2.5 : 1)}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Floating 3D Label */}
      <Html center distanceFactor={12} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          background: node.isGap 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(99, 102, 241, 0.95))' 
            : (isSelected ? 'rgba(30, 36, 60, 0.95)' : 'rgba(10, 12, 22, 0.8)'),
          border: `1px solid ${node.color}`,
          borderRadius: node.isGap ? 14 : 8,
          padding: node.isGap ? '5px 12px' : '3px 9px',
          color: '#ffffff',
          fontSize: node.isGap ? '0.74rem' : '0.68rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 20px ${node.color}88`,
          transform: hovered || isSelected ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.2s ease',
          backdropFilter: 'blur(8px)'
        }}>
          {node.isGap && '✨ '}
          {node.name}
          {!node.isGap && <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>({node.year})</span>}
        </div>
      </Html>
    </group>
  );
}

// 3D Connecting Force Lines
function GalaxyConstellationLines() {
  const lineGeo = useMemo(() => {
    const points = [];
    // Connect transformers to lora, mamba, and gap
    const t = GALAXY_NODES[0].coords;
    const d = GALAXY_NODES[1].coords;
    const l = GALAXY_NODES[2].coords;
    const m = GALAXY_NODES[3].coords;
    const ds = GALAXY_NODES[4].coords;
    const af = GALAXY_NODES[5].coords;
    const g = GALAXY_NODES[6].coords;

    points.push(new THREE.Vector3(...t), new THREE.Vector3(...g));
    points.push(new THREE.Vector3(...l), new THREE.Vector3(...g));
    points.push(new THREE.Vector3(...m), new THREE.Vector3(...g));
    points.push(new THREE.Vector3(...d), new THREE.Vector3(...ds));
    points.push(new THREE.Vector3(...t), new THREE.Vector3(...l));
    points.push(new THREE.Vector3(...af), new THREE.Vector3(...g));

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  return (
    <lineSegments geometry={lineGeo}>
      <lineBasicMaterial color="#818cf8" transparent opacity={0.4} />
    </lineSegments>
  );
}

export default function InteractiveGalaxy3D({ selectedNode, onSelectNode }) {
  return (
    <div style={{ width: '100%', height: '440px', position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="#4ade80" />

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxDistance={12}
          minDistance={4}
        />

        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
          <GalaxyConstellationLines />
          {GALAXY_NODES.map((node) => (
            <PaperGalaxyNode 
              key={node.id} 
              node={node} 
              isSelected={selectedNode === node.id}
              onSelect={onSelectNode}
            />
          ))}
        </Float>

        <Stars radius={50} depth={30} count={1200} factor={3} saturation={0.8} fade speed={1} />
      </Canvas>

      {/* Floating 3D Galaxy Controller Tooltip */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        background: 'rgba(10, 12, 22, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        padding: '5px 12px',
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none'
      }}>
        🖱️ Rotate: Drag • Zoom: Scroll • Select: Click Node
      </div>
    </div>
  );
}
