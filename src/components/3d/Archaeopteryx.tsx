'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Easter egg: the Urvogel from the Jura-Museum on the Willibaldsburg.
// Every half minute it glides across the scene, flapping, with its long feathered tail.
const PERIOD = 30
const FLIGHT = 9

export default function Archaeopteryx({ color, still = false }: { color: string; still?: boolean }) {
  const bird = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)

  useFrame((state) => {
    const g = bird.current
    if (!g || !left.current || !right.current) return
    const t = (state.clock.elapsedTime + 12) % PERIOD
    if (still || t > FLIGHT) {
      g.visible = false
      return
    }
    g.visible = true
    const p = t / FLIGHT
    g.position.set(THREE.MathUtils.lerp(-4.2, 4.2, p), 3.1 + Math.sin(p * Math.PI) * 0.5 + Math.sin(t * 2) * 0.08, -1.2 + p * 0.8)
    g.rotation.set(0, -0.15, Math.sin(t * 2) * 0.06)
    const flap = Math.sin(t * 9) * 0.7
    left.current.rotation.x = flap
    right.current.rotation.x = -flap
  })

  const feather = { color, roughness: 0.7 }
  return (
    <group ref={bird} visible={false} scale={0.55}>
      {/* body and head along +x, the direction of flight */}
      <mesh scale={[0.28, 0.09, 0.09]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial {...feather} />
      </mesh>
      <mesh position={[0.3, 0.05, 0]} scale={[0.09, 0.06, 0.06]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial {...feather} />
      </mesh>
      <mesh position={[0.42, 0.04, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.025, 0.1, 8]} />
        <meshStandardMaterial {...feather} />
      </mesh>
      {/* the long bony tail with feathers on both sides */}
      <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.5, 4]} />
        <meshStandardMaterial {...feather} />
      </mesh>
      {/* wings, with the clawed fingers that make it a dinosaur */}
      <group ref={left} position={[0.02, 0.03, 0.06]}>
        <mesh position={[0, 0, 0.3]} scale={[0.22, 0.012, 0.32]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshStandardMaterial {...feather} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.18, 0, 0.16]} rotation={[0, 0.6, Math.PI / 2]}>
          <coneGeometry args={[0.012, 0.08, 6]} />
          <meshStandardMaterial {...feather} />
        </mesh>
      </group>
      <group ref={right} position={[0.02, 0.03, -0.06]}>
        <mesh position={[0, 0, -0.3]} scale={[0.22, 0.012, 0.32]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshStandardMaterial {...feather} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.18, 0, -0.16]} rotation={[0, -0.6, Math.PI / 2]}>
          <coneGeometry args={[0.012, 0.08, 6]} />
          <meshStandardMaterial {...feather} />
        </mesh>
      </group>
    </group>
  )
}
