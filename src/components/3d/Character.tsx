'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

type CharacterProps = {
  color: string
  still?: boolean
}

// Placeholder for the Kleinstadtsound figure: turns with scroll, leans toward the pointer.
export default function Character({ color, still = false }: CharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh || still) return

    const scroll = typeof window !== 'undefined' ? window.scrollY : 0
    const targetY = scroll * 0.004 + state.pointer.x * 0.6
    const targetX = -state.pointer.y * 0.4

    mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, targetY + state.clock.elapsedTime * 0.15, 4, delta)
    mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, targetX, 4, delta)
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08
  })

  return (
    <mesh ref={meshRef} scale={1.6}>
      <icosahedronGeometry args={[1, 6]} />
      <MeshDistortMaterial
        color={color}
        speed={still ? 0 : 1.6}
        distort={0.32}
        roughness={0.35}
        metalness={0.55}
      />
    </mesh>
  )
}
