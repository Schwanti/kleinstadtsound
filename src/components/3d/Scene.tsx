'use client'

import { useState, useSyncExternalStore } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import RecordTown from './RecordTown'
import Figure from './Figure'

function readToken(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia(MOTION_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// Rendered client-only (dynamic import with ssr: false), so the DOM is available here.
export default function Scene() {
  const still = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  )
  const [colors] = useState(() => ({
    ink: readToken('--color-scene-ink', 'white'),
    red: readToken('--color-scene-red', 'red'),
    vinyl: readToken('--color-scene-vinyl', 'black'),
    groove: readToken('--color-scene-groove', 'gray'),
    font: readToken('--font-display', 'Impact, sans-serif'),
    envGrey: readToken('--color-scene-env', 'gray'),
    facades: [1, 2, 3, 4].map((n) => readToken(`--color-scene-facade-${n}`, 'white')),
    roof: readToken('--color-scene-roof', 'brown'),
    window: readToken('--color-scene-window', 'orange'),
    metal: readToken('--color-scene-metal', 'silver'),
  }))

  return (
    <Canvas
      camera={{ position: [0, 2.7, 7.6], fov: 42 }}
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 2]}
      onCreated={({ camera }) => camera.lookAt(0, 1.35, 0)}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 6, 4]} intensity={1.6} color={colors.ink} />
      <pointLight position={[-4, 1.5, 2]} intensity={6} color={colors.red} />
      <pointLight position={[3.5, 0.5, -3]} intensity={5} color={colors.red} />

      {/* Studio light for the chrome, built locally: no environment files are fetched. */}
      <Environment resolution={256}>
        <color attach="background" args={[colors.envGrey]} />
        <Lightformer form="rect" intensity={5} color={colors.ink} position={[0, 5, 3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={3} color={colors.ink} position={[0, 1, 6]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={2} color={colors.ink} position={[-5, 1, 3]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.5} color={colors.ink} position={[0, -3, 2]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="circle" intensity={6} color={colors.ink} position={[-2, 3, 4]} scale={1.2} />
        <Lightformer form="rect" intensity={2} color={colors.red} position={[5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} color={colors.red} position={[0, 1, -6]} scale={4} />
      </Environment>

      <RecordTown colors={colors} still={still} towers={false} />
      <Figure ink={colors.ink} collar={colors.vinyl} font={colors.font} still={still} />
    </Canvas>
  )
}
