'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type SceneColors = {
  ink: string
  red: string
  vinyl: string
  groove: string
}

type RecordTownProps = {
  colors: SceneColors
  still?: boolean
}

const RECORD_RADIUS = 2
const RECORD_HEIGHT = 0.05
const LABEL_RADIUS = 0.72
const BPM = 124
const BASE_SPIN = 0.55 // rad/s, a slow 33 rpm feel
const DECK_TILT = 0.42

// Deterministic pseudo random so the town is the same on every render.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Gable roof: a triangle extruded along the house depth.
function useRoofGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.5, 0)
    shape.lineTo(0.5, 0)
    shape.lineTo(0, 0.55)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false })
    geo.translate(0, 0, -0.5)
    return geo
  }, [])
}

type House = {
  angle: number
  radius: number
  width: number
  height: number
  depth: number
  band: number
}

function useTown(): House[] {
  return useMemo(() => {
    const houses: House[] = []
    const rings = [
      { radius: 1.08, count: 13 },
      { radius: 1.62, count: 19 },
    ]
    let i = 0
    for (const ring of rings) {
      for (let n = 0; n < ring.count; n++) {
        i++
        const angle = (n / ring.count) * Math.PI * 2 + rand(i) * 0.15
        houses.push({
          angle,
          radius: ring.radius + (rand(i + 50) - 0.5) * 0.12,
          width: 0.2 + rand(i + 100) * 0.12,
          height: 0.12 + rand(i + 200) * 0.14,
          depth: 0.18 + rand(i + 300) * 0.06,
          band: rand(i + 400),
        })
      }
    }
    return houses
  }, [])
}

function Grooves({ color }: { color: string }) {
  const lines = useMemo(() => {
    const out: THREE.BufferGeometry[] = []
    for (let r = LABEL_RADIUS + 0.12; r < RECORD_RADIUS - 0.05; r += 0.07) {
      const pts: THREE.Vector3[] = []
      for (let a = 0; a <= 128; a++) {
        const t = (a / 128) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(t) * r, 0, Math.sin(t) * r))
      }
      out.push(new THREE.BufferGeometry().setFromPoints(pts))
    }
    return out
  }, [])

  return (
    <group position={[0, RECORD_HEIGHT / 2 + 0.001, 0]}>
      {lines.map((geo, i) => (
        <lineLoop key={i} geometry={geo}>
          <lineBasicMaterial color={color} transparent opacity={0.55} />
        </lineLoop>
      ))}
    </group>
  )
}

const ARM_PIVOT = new THREE.Vector3(2.35, 0.3, -1.25)
const ARM_TIP = new THREE.Vector3(1.25, 0.12, 1.05)

function Tonearm({ color }: { color: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(ARM_TIP, ARM_PIVOT)
    const len = dir.length()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    const mid = new THREE.Vector3().addVectors(ARM_PIVOT, ARM_TIP).multiplyScalar(0.5)
    return { position: mid, quaternion: q, length: len }
  }, [])

  return (
    <group>
      <mesh position={[ARM_PIVOT.x, ARM_PIVOT.y / 2, ARM_PIVOT.z]}>
        <cylinderGeometry args={[0.14, 0.16, ARM_PIVOT.y, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={position} quaternion={quaternion}>
        <cylinderGeometry args={[0.025, 0.025, length, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={ARM_TIP} quaternion={quaternion}>
        <boxGeometry args={[0.16, 0.14, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Kleinstadt on a record: a ring of gabled houses riding the grooves,
// the twin cathedral towers on the label, bouncing to the beat.
export default function RecordTown({ colors, still = false }: RecordTownProps) {
  const deck = useRef<THREE.Group>(null)
  const platter = useRef<THREE.Group>(null)
  const houseRefs = useRef<(THREE.Group | null)[]>([])
  const scrollState = useRef({ last: 0, velocity: 0 })
  const roof = useRoofGeometry()
  const town = useTown()

  useFrame((state, delta) => {
    if (still || !deck.current || !platter.current) return
    const dt = Math.min(delta, 0.05)

    // Scroll scratches the record.
    const y = window.scrollY
    const s = scrollState.current
    s.velocity = THREE.MathUtils.damp(s.velocity, (y - s.last) * 0.02, 8, dt)
    s.last = y
    platter.current.rotation.y -= (BASE_SPIN + s.velocity * 6) * dt

    // Pointer tilts the deck.
    deck.current.rotation.x = THREE.MathUtils.damp(deck.current.rotation.x, DECK_TILT - state.pointer.y * 0.18, 4, dt)
    deck.current.rotation.z = THREE.MathUtils.damp(deck.current.rotation.z, -state.pointer.x * 0.18, 4, dt)

    // Houses pump like an equalizer: a kick on every beat, offbeat for the higher bands.
    const beat = (state.clock.elapsedTime * BPM) / 60
    const kick = Math.pow(1 - (beat % 1), 3)
    const off = Math.pow(1 - ((beat + 0.5) % 1), 4)
    houseRefs.current.forEach((g, i) => {
      if (!g) return
      const band = town[i].band
      const level = band < 0.5 ? kick * (1 - band) : off * band
      g.scale.y = 1 + level * 0.9
    })
  })

  return (
    <group ref={deck} rotation={[DECK_TILT, 0, 0]} position={[0, 0, 0]}>
      <group ref={platter}>
        <mesh>
          <cylinderGeometry args={[RECORD_RADIUS, RECORD_RADIUS, RECORD_HEIGHT, 128]} />
          <meshStandardMaterial color={colors.vinyl} roughness={0.28} metalness={0.4} />
        </mesh>
        <Grooves color={colors.groove} />
        <mesh position={[0, RECORD_HEIGHT / 2 + 0.002, 0]}>
          <cylinderGeometry args={[LABEL_RADIUS, LABEL_RADIUS, 0.004, 64]} />
          <meshStandardMaterial color={colors.red} roughness={0.6} />
        </mesh>

        {/* The cathedral's twin towers on the label, the spindle between them. */}
        {[-0.2, 0.2].map((x) => (
          <group key={x} position={[x, RECORD_HEIGHT / 2, 0.05]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.2, 0.9, 0.2]} />
              <meshStandardMaterial color={colors.ink} roughness={0.55} />
            </mesh>
            <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.15, 0.42, 4]} />
              <meshStandardMaterial color={colors.ink} roughness={0.55} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, RECORD_HEIGHT / 2 + 0.25, -0.12]}>
          <boxGeometry args={[0.24, 0.5, 0.28]} />
          <meshStandardMaterial color={colors.ink} roughness={0.55} />
        </mesh>
        <mesh position={[0, RECORD_HEIGHT / 2 + 0.5, -0.12]} rotation={[0, Math.PI / 2, 0]} scale={[0.28, 0.4, 0.24]} geometry={roof}>
          <meshStandardMaterial color={colors.ink} roughness={0.55} />
        </mesh>

        {town.map((h, i) => (
          <group
            key={i}
            position={[Math.cos(h.angle) * h.radius, RECORD_HEIGHT / 2, Math.sin(h.angle) * h.radius]}
            rotation={[0, -h.angle + Math.PI / 2, 0]}
          >
            <group ref={(el) => { houseRefs.current[i] = el }}>
              <mesh position={[0, h.height / 2, 0]}>
                <boxGeometry args={[h.width, h.height, h.depth]} />
                <meshStandardMaterial color={colors.ink} roughness={0.6} />
              </mesh>
              <mesh position={[0, h.height, 0]} scale={[h.width * 1.08, h.width * 0.9, h.depth * 1.08]} geometry={roof}>
                <meshStandardMaterial color={i % 5 === 0 ? colors.red : colors.ink} roughness={0.6} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      <Tonearm color={colors.ink} />
    </group>
  )
}
