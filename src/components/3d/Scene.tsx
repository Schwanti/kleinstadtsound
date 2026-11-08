'use client'

import { useState, useSyncExternalStore } from 'react'
import { Canvas } from '@react-three/fiber'
import Character from './Character'

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
  }))

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color={colors.ink} />
      <pointLight position={[-4, -1, 2]} intensity={18} color={colors.red} />
      <pointLight position={[4, -3, -2]} intensity={10} color={colors.red} />
      <Character color={colors.ink} still={still} />
    </Canvas>
  )
}
