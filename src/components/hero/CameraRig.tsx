'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

// Subtle camera dolly + parallax that follows the pointer for cinematic depth.
export default function CameraRig() {
  const { camera, pointer } = useThree();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    // gentle dolly in/out
    const dolly = 6 + Math.sin(t.current * 0.4) * 0.4;
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.05;
    camera.position.z += (dolly - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
