'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Brand-coloured floating particles (bubbles / splash / fruit motes).
export default function Particles({ color }: { color: string }) {
  const points = useRef<THREE.Points>(null);
  const count = 260;

  const { positions, geometry } = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return { positions: arr, geometry: geo };
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.05;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * 0.5;
      if (y > 4) y = -4;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}
