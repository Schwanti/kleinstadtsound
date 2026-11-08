'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Easter egg: the Urvogel of the Altmühl valley, kept in the Jura-Museum on the Willibaldsburg.
// Every half minute it glides across the scene. What makes it an Archaeopteryx and not just a
// bird: the long bony tail with a pair of feathers on every vertebra, three clawed fingers on
// each wing, and a toothed snout.
const PERIOD = 30
const FLIGHT = 10
const TAIL_SEGMENTS = 9

// A single feather: a flat leaf, base at the origin, pointing along +x.
function useFeatherGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.quadraticCurveTo(0.5, 0.16, 1, 0)
    shape.quadraticCurveTo(0.5, -0.12, 0, 0)
    return new THREE.ShapeGeometry(shape, 8)
  }, [])
}

function Wing({ side, feather, material, wingRef }: {
  side: 1 | -1
  feather: THREE.BufferGeometry
  material: THREE.Material
  wingRef: React.RefObject<THREE.Group | null>
}) {
  // Primary and secondary flight feathers fan out from the arm bones.
  const feathers = Array.from({ length: 8 }, (_, i) => ({
    x: 0.05 + i * 0.045,
    yaw: side * (0.35 + i * 0.16),
    length: 0.34 - Math.abs(i - 3.5) * 0.025,
  }))
  return (
    <group ref={wingRef} position={[0.04, 0.02, side * 0.05]}>
      {/* the arm, a thin bone running out to the fingers */}
      <mesh position={[0.08, 0, side * 0.22]} rotation={[0, side * 1.2, 0]}>
        <boxGeometry args={[0.46, 0.022, 0.03]} />
        <primitive object={material} attach="material" />
      </mesh>
      {feathers.map((f, i) => (
        <mesh
          key={i}
          geometry={feather}
          material={material}
          position={[f.x - 0.1, -0.005, side * (0.06 + i * 0.045)]}
          rotation={[-Math.PI / 2, 0, f.yaw - Math.PI / 2 - side * Math.PI / 2]}
          scale={[f.length, f.length * 0.9, 1]}
        />
      ))}
      {/* three clawed fingers on the leading edge */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.26 + i * 0.025, 0.01, side * (0.4 + i * 0.02)]} rotation={[0, 0, -Math.PI / 2 - 0.4]}>
          <coneGeometry args={[0.009, 0.07, 6]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

export default function Archaeopteryx({ color, teeth, still = false }: { color: string; teeth: string; still?: boolean }) {
  const bird = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const feather = useFeatherGeometry()
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide }),
    [color],
  )

  useFrame((state) => {
    const g = bird.current
    if (!g || !left.current || !right.current || !tail.current) return
    const t = (state.clock.elapsedTime + 14) % PERIOD
    if (still || t > FLIGHT) {
      g.visible = false
      return
    }
    g.visible = true
    const p = t / FLIGHT
    g.position.set(THREE.MathUtils.lerp(-4.6, 4.6, p), 3.0 + Math.sin(p * Math.PI) * 0.45 + Math.sin(t * 2.2) * 0.07, -0.6 + p * 0.6)
    g.rotation.set(0.35, -0.1, Math.sin(t * 2.2) * 0.08)
    const flap = Math.sin(t * 8) * 0.6
    left.current.rotation.x = -flap
    right.current.rotation.x = flap
    tail.current.rotation.y = Math.sin(t * 3) * 0.12
  })

  const vertebrae = Array.from({ length: TAIL_SEGMENTS }, (_, i) => i)
  return (
    <group ref={bird} visible={false} scale={0.95}>
      {/* body */}
      <mesh scale={[0.2, 0.08, 0.08]} material={material}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      {/* neck, head and the long, toothed snout */}
      <mesh position={[0.22, 0.05, 0]} rotation={[0, 0, -0.9]} material={material}>
        <cylinderGeometry args={[0.025, 0.035, 0.12, 8]} />
      </mesh>
      <mesh position={[0.29, 0.1, 0]} scale={[0.055, 0.04, 0.04]} material={material}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      <mesh position={[0.37, 0.09, 0]} rotation={[0, 0, -Math.PI / 2 - 0.1]} material={material}>
        <coneGeometry args={[0.022, 0.12, 8]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.33 + i * 0.022, 0.075, 0]}>
          <coneGeometry args={[0.004, 0.014, 4]} />
          <meshStandardMaterial color={teeth} />
        </mesh>
      ))}
      {/* the long bony tail, a pair of feathers on every vertebra */}
      <group ref={tail} position={[-0.18, 0, 0]}>
        {vertebrae.map((i) => (
          <group key={i} position={[-i * 0.055, -i * 0.004, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={material}>
              <cylinderGeometry args={[0.012 - i * 0.0009, 0.014 - i * 0.0009, 0.05, 6]} />
            </mesh>
            {[1, -1].map((side) => (
              <mesh
                key={side}
                geometry={feather}
                material={material}
                rotation={[-Math.PI / 2, 0, Math.PI - side * 0.55]}
                scale={[0.14 + i * 0.004, 0.12, 1]}
              />
            ))}
          </group>
        ))}
      </group>
      {/* legs tucked under, with claws */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[-0.04, -0.09, side * 0.04]} rotation={[0, 0, 0.6]} material={material}>
          <cylinderGeometry args={[0.008, 0.01, 0.1, 6]} />
        </mesh>
      ))}
      <Wing side={1} feather={feather} material={material} wingRef={left} />
      <Wing side={-1} feather={feather} material={material} wingRef={right} />
    </group>
  )
}
