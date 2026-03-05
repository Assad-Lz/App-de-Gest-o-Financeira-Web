'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GlobeModel = () => {
  const globeRef = useRef<THREE.Mesh>(null);

  // Animação de Rotação do Globo
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  // Linhas representando conexões financeiras globais (mock aleatório para visual high-tech)
  const curves = Array.from({ length: 15 }).map(() => {
    const startLat = (Math.random() - 0.5) * Math.PI;
    const startLng = (Math.random() - 0.5) * Math.PI * 2;
    const endLat = (Math.random() - 0.5) * Math.PI;
    const endLng = (Math.random() - 0.5) * Math.PI * 2;

    const start = new THREE.Vector3().setFromSphericalCoords(2, startLat, startLng);
    const end = new THREE.Vector3().setFromSphericalCoords(2, endLat, endLng);
    // Control point to simulate arc
    const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.5);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  });

  return (
    <group ref={globeRef}>
      {/* Globo Esfera Principal */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#0f172a" 
          emissive="#10b981" 
          emissiveIntensity={0.2}
          wireframe={true} 
          transparent={true}
          opacity={0.3}
        />
      </Sphere>
      
      {/* Esfera central sólida escondendo backface wireframe */}
      <Sphere args={[1.98, 32, 32]}>
         <meshStandardMaterial color="#020617" />
      </Sphere>

      {/* Linhas de conexão (Transações High-Tech) */}
      {curves.map((points, idx) => (
        <Line 
          key={idx} 
          points={points} 
          color="#eab308" /* Amarelo FinEasy */
          lineWidth={1.5} 
          transparent 
          opacity={0.6}
        />
      ))}
    </group>
  );
};

export const GlobeThree = () => {
  return (
    <div className="w-full h-full absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#eab308" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <GlobeModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};
