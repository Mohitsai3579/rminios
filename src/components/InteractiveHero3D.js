'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, Float, Sphere, Torus, Icosahedron, 
  MeshDistortMaterial, Sparkles, Stars, Html, PerspectiveCamera 
} from '@react-three/drei';
import * as THREE from 'three';

// Orbiting Frontier Model Satellite
function ModelSatellite({ position, name, color, delay = 0, speed = 1, onSelect, isSelected }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * 0.4 * speed + delay;
      const radius = 4.2;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = Math.sin(t * 2) * 0.8;
      meshRef.current.rotation.y = t;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Satellite Core */}
      <Sphere args={[0.24, 32, 32]} onClick={onSelect}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isSelected ? 3 : 1.2} 
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Orbit Ring around satellite */}
      <Torus args={[0.38, 0.02, 16, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </Torus>

      {/* 3D Floating HTML Label */}
      <Html 
        center 
        distanceFactor={10} 
        style={{ 
          pointerEvents: 'none',
          userSelect: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          background: isSelected ? 'rgba(15, 20, 35, 0.95)' : 'rgba(8, 10, 18, 0.82)',
          border: `1px solid ${color}`,
          borderRadius: 14,
          padding: '4px 10px',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 16px ${color}88`,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
          <span>{name}</span>
        </div>
      </Html>
    </group>
  );
}

// Orbiting Research Paper Node in 3D Space
function ResearchPaperCard3D({ position, title, year, color = '#38bdf8', speed = 0.8, delay = 0 }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.25 * speed + delay;
      const radius = 6.2;
      groupRef.current.position.x = Math.sin(t) * radius;
      groupRef.current.position.z = Math.cos(t) * radius;
      groupRef.current.position.y = Math.cos(t * 1.5) * 1.4;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[0.15, 16, 16]}>
        <meshBasicMaterial color={color} />
      </Sphere>
      <Html center distanceFactor={14} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          background: 'rgba(10, 14, 25, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
          padding: '3px 8px',
          color: '#e2e8f0',
          fontSize: '0.65rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(6px)'
        }}>
          📄 {title} <span style={{ color: color, fontSize: '0.6rem' }}>({year})</span>
        </div>
      </Html>
    </group>
  );
}

// Central Morphing Cybernetic Plasma Core
function QuantumNeuralCore({ selectedModel }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = t * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.45;
      ring1Ref.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.35;
      ring2Ref.current.rotation.z = t * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.4;
      ring3Ref.current.rotation.x = t * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
      {/* 1. Inner Plasma Pulsing Light */}
      <Sphere args={[0.9, 32, 32]}>
        <meshBasicMaterial color="#6366f1" transparent opacity={0.8} />
      </Sphere>

      {/* 2. Liquid-Metal Distorting Cybernetic Shell */}
      <Sphere ref={coreRef} args={[1.65, 64, 64]}>
        <MeshDistortMaterial
          color="#3730a3"
          emissive="#4338ca"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          distort={0.38}
          speed={2.2}
          wireframe={false}
        />
      </Sphere>

      {/* 3. Wireframe Aura */}
      <Icosahedron args={[1.9, 2]}>
        <meshStandardMaterial 
          color="#818cf8" 
          wireframe={true} 
          transparent 
          opacity={0.35} 
        />
      </Icosahedron>

      {/* 4. Counter-Rotating Gyroscopic Neon Rings */}
      <Torus ref={ring1Ref} args={[2.5, 0.025, 16, 120]}>
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
      </Torus>

      <Torus ref={ring2Ref} args={[3.1, 0.025, 16, 120]}>
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
      </Torus>

      <Torus ref={ring3Ref} args={[3.7, 0.03, 16, 120]}>
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.8} />
      </Torus>
    </Float>
  );
}

// Background Celestial Nebula Lighting
function CyberLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 8]} intensity={2.2} color="#818cf8" />
      <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#ec4899" />
      <pointLight position={[0, 0, 0]} intensity={4} color="#6366f1" distance={15} />
      <pointLight position={[5, -5, 5]} intensity={2} color="#38bdf8" distance={18} />
    </>
  );
}

export default function InteractiveHero3D() {
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const [isOrbiting, setIsOrbiting] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas 3D */}
      <Canvas
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 9.5], fov: 45 }}
        onPointerDown={() => setIsOrbiting(true)}
        onPointerUp={() => setIsOrbiting(false)}
      >
        <PerspectiveCamera makeDefault position={[0, 1.2, 9.5]} fov={45} />
        
        {/* Full 3D Camera Controls: Drag to Orbit in 360° */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={!isOrbiting}
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.6}
          rotateSpeed={0.7}
          dampingFactor={0.08}
        />

        <CyberLighting />
        
        {/* Central Morphing Core */}
        <QuantumNeuralCore selectedModel={selectedModel} />

        {/* Orbiting 4 Frontier Model Satellites */}
        <ModelSatellite 
          name="Gemini 2.5 Flash" 
          color="#38bdf8" 
          delay={0} 
          speed={1} 
          isSelected={selectedModel === 'Gemini'}
          onSelect={() => setSelectedModel('Gemini')} 
        />
        <ModelSatellite 
          name="OpenAI GPT-4o" 
          color="#34d399" 
          delay={Math.PI / 2} 
          speed={1} 
          isSelected={selectedModel === 'OpenAI'}
          onSelect={() => setSelectedModel('OpenAI')} 
        />
        <ModelSatellite 
          name="Claude 3.5 Sonnet" 
          color="#fbbf24" 
          delay={Math.PI} 
          speed={1} 
          isSelected={selectedModel === 'Claude'}
          onSelect={() => setSelectedModel('Claude')} 
        />
        <ModelSatellite 
          name="xAI Grok 2" 
          color="#f87171" 
          delay={(Math.PI * 3) / 2} 
          speed={1} 
          isSelected={selectedModel === 'Grok'}
          onSelect={() => setSelectedModel('Grok')} 
        />

        {/* Orbiting Landmark Research Papers */}
        <ResearchPaperCard3D title="Attention Is All You Need" year="2017" color="#818cf8" delay={0.8} speed={0.7} />
        <ResearchPaperCard3D title="Denoising Diffusion (DDPM)" year="2020" color="#f43f5e" delay={2.4} speed={0.65} />
        <ResearchPaperCard3D title="LoRA Rank Adaptation" year="2021" color="#4ade80" delay={4.0} speed={0.75} />
        <ResearchPaperCard3D title="FlashAttention-3" year="2024" color="#38bdf8" delay={5.5} speed={0.8} />

        {/* Floating Sparkles & 3D Starfield */}
        <Sparkles count={180} scale={14} size={3} speed={0.4} color="#818cf8" opacity={0.6} />
        <Stars radius={90} depth={40} count={2800} factor={4} saturation={0.8} fade speed={1.2} />
      </Canvas>

      {/* Floating 3D Interaction HUD Badge */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 18px',
        borderRadius: 30,
        background: 'rgba(10, 13, 24, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        zIndex: 20,
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        fontSize: '0.78rem',
        color: '#e2e8f0',
        pointerEvents: 'auto'
      }}>
        <span style={{ display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
        <span style={{ fontWeight: 600 }}>Interactive 3D Engine:</span>
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Click & Drag anywhere to Orbit in 360°</span>
      </div>
    </div>
  );
}
