'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import gsap from 'gsap';
import * as THREE from 'three';

export default function CanModel({
  image,
  brandKey,
  onCycleEnd,
}: {
  image: string;
  brandKey: string;
  onCycleEnd: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, image);

  useEffect(() => {
    // Proper texture mapping for cylinder wrap
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    texture.center.set(0.5, 0.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  // Continuous slow spin
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.5;
  });

  // Slide in → hold → slide out loop
  useEffect(() => {
    if (!group.current) return;
    const g = group.current;
    g.position.set(-8, 0, 0);
    g.scale.setScalar(0.5);

    const tl = gsap.timeline({ onComplete: onCycleEnd });
    tl.to(g.position, { x: 0, duration: 1.1, ease: 'power3.out' }, 0)
      .to(g.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'power3.out' }, 0)
      .to(g.position, { x: 8, duration: 1, ease: 'power3.in' }, 3.5)
      .to(g.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: 'power3.in' }, 3.5);

    return () => { tl.kill(); };
  }, [brandKey, onCycleEnd]);

  const R = 1.0;          // radius
  const H = 2.8;          // body height
  const SEG = 128;        // smoothness

  return (
    <group ref={group}>

      {/* ── BODY with label texture ── */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, H, SEG, 1, true]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.4}
          roughness={0.35}
          side={THREE.FrontSide}
          envMapIntensity={1}
        />
      </mesh>

      {/* ── TOP NECK — tapers inward ── */}
      <mesh position={[0, H / 2 + 0.18, 0]} castShadow>
        <cylinderGeometry args={[R * 0.72, R, 0.36, SEG]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* ── TOP LID flat disc ── */}
      <mesh position={[0, H / 2 + 0.38, 0]} castShadow>
        <cylinderGeometry args={[R * 0.72, R * 0.72, 0.06, SEG]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* ── PULL TAB base ── */}
      <mesh position={[0, H / 2 + 0.42, 0]}>
        <cylinderGeometry args={[R * 0.22, R * 0.22, 0.04, 32]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── PULL TAB ring ── */}
      <mesh position={[0.28, H / 2 + 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.035, 12, 32]} />
        <meshStandardMaterial color="#999999" metalness={0.88} roughness={0.22} />
      </mesh>

      {/* ── BOTTOM NECK — tapers inward ── */}
      <mesh position={[0, -H / 2 - 0.1, 0]} castShadow>
        <cylinderGeometry args={[R * 0.88, R, 0.2, SEG]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* ── BOTTOM LID ── */}
      <mesh position={[0, -H / 2 - 0.22, 0]} castShadow>
        <cylinderGeometry args={[R * 0.88, R * 0.88, 0.06, SEG]} />
        <meshStandardMaterial color="#bebebe" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* ── BOTTOM INDENT dome ── */}
      <mesh position={[0, -H / 2 - 0.19, 0]}>
        <sphereGeometry args={[R * 0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.95} roughness={0.1} side={THREE.BackSide} />
      </mesh>

      {/* ── TOP RIM shine ring ── */}
      <mesh position={[0, H / 2, 0]}>
        <torusGeometry args={[R, 0.025, 8, SEG]} />
        <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.05} />
      </mesh>

      {/* ── BOTTOM RIM shine ring ── */}
      <mesh position={[0, -H / 2, 0]}>
        <torusGeometry args={[R, 0.025, 8, SEG]} />
        <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.05} />
      </mesh>

    </group>
  );
}
