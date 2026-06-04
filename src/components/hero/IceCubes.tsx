'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating translucent ice cubes drifting around the can.
export default function IceCubes() {
  const group = useRef<THREE.Group>(null);
  const cubes = useMemo(
    () =>
      Array.from({ length: 10 }).map(() => ({
        pos: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 4,
        ] as [number, number, number],
        scale: 0.2 + Math.random() * 0.3,
        speed: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.rotation.x += delta * cubes[i].speed;
      child.rotation.y += delta * cubes[i].speed;
      child.position.y += delta * 0.3;
      if (child.position.y > 3) child.position.y = -3;
    });
  });

  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <boxGeometry args={[1, 1, 1]} />
          {/* Use meshStandardMaterial instead of meshPhysicalMaterial with transmission
              — transmission requires a special render pass that can fail on hosting */}
          <meshStandardMaterial
            color="#cfe8ff"
            transparent
            opacity={0.45}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
