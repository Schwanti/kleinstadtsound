'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Environment, Lightformer } from '@react-three/drei'
import RecordTown from './RecordTown'
import Figure from './Figure'
import Archaeopteryx from './Archaeopteryx'
const CAMERA_HOME = new THREE.Vector3(0, 2.7, 7.6)
const CAMERA_TARGET = new THREE.Vector3(0, 1.35, 0)
import { sceneState } from './sceneState'

const BPM = 124

// Party mode (Konami code): a white strobe on every beat.
function Strobe() {
  const light = useRef<THREE.PointLight>(null)
  useFrame((state) => {
    if (!light.current) return
    const beat = (state.clock.elapsedTime * BPM) / 60
    light.current.intensity = sceneState.party && beat % 1 < 0.12 ? 60 : 0
  })
  return <pointLight ref={light} position={[0, 4, 3]} intensity={0} />
}

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
    limestone: readToken('--color-scene-limestone', 'gray'),
    sandstone: readToken('--color-scene-sandstone', 'beige'),
    copper: readToken('--color-scene-copper', 'teal'),
    gold: readToken('--color-scene-gold', 'gold'),
    hill: readToken('--color-scene-hill', 'darkgreen'),
    river: readToken('--color-scene-river', 'blue'),
    neon: readToken('--color-scene-neon', 'red'),
    fossil: readToken('--color-scene-fossil', 'beige'),
    feather: readToken('--color-scene-feather', 'tan'),
    bone: readToken('--color-scene-bone', 'brown'),
  }))

  return (
    <Canvas
      camera={{ position: CAMERA_HOME.toArray(), fov: 42 }}
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 2]}
      onCreated={({ camera }) => camera.lookAt(CAMERA_TARGET)}
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

      <RecordTown colors={colors} still={still} />
      <Archaeopteryx color={colors.feather} teeth={colors.fossil} still={still} />
      {!still && <Strobe />}
      <Figure ink={colors.ink} collar={colors.vinyl} font={colors.font} still={still} />
    </Canvas>
  )
}
