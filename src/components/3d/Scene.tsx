'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function Particles({ count = 500 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom(i * 3) - 0.5) * 20
      positions[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * 20
      positions[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 20

      const color = new THREE.Color()
      color.setHSL(seededRandom(i * 3 + 3) * 0.2 + 0.95, 0.8, 0.5 + seededRandom(i * 3 + 4) * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return [positions, colors]
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03

      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.002
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

function FloatingRing({ position, scale, speed }: { position: [number, number, number], scale: number, speed: number }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * speed
      mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.5
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 16, 100]} />
      <meshStandardMaterial 
        color="#FF001A" 
        emissive="#FF001A"
        emissiveIntensity={0.5}
        transparent 
        opacity={0.6} 
      />
    </mesh>
  )
}

function FloatingSphere({ position, scale, speed }: { position: [number, number, number], scale: number, speed: number }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5
      mesh.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color="#6C0009"
        emissive="#6C0009"
        emissiveIntensity={0.3}
        transparent 
        opacity={0.4}
        wireframe
      />
    </mesh>
  )
}

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <Particles count={300} />
        <FloatingRing position={[-3, 0, -2]} scale={1.5} speed={0.3} />
        <FloatingRing position={[3, 1, -3]} scale={1} speed={0.2} />
        <FloatingRing position={[0, -1, -4]} scale={2} speed={0.15} />
        <FloatingSphere position={[-2, 2, -2]} scale={0.8} speed={0.4} />
        <FloatingSphere position={[2, -1, -3]} scale={0.6} speed={0.3} />
        <FloatingSphere position={[0, 2, -5]} scale={1} speed={0.25} />
      </Canvas>
    </div>
  )
}
