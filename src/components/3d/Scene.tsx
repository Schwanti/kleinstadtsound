'use client'

import { useState, useSyncExternalStore } from 'react'
import { Canvas } from '@react-three/fiber'
import RecordTown from './RecordTown'

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
  }))

  return (
    <Canvas
      camera={{ position: [0, 2.4, 5.6], fov: 42 }}
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 2]}
      onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 6, 4]} intensity={1.6} color={colors.ink} />
      <pointLight position={[-4, 1.5, 2]} intensity={14} color={colors.red} />
      <pointLight position={[3.5, 0.5, -3]} intensity={8} color={colors.red} />
      <RecordTown colors={colors} still={still} />
    </Canvas>
  )
}
