'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type SceneColors = {
  ink: string
  red: string
  vinyl: string
  groove: string
  facades: string[]
  roof: string
  window: string
  metal: string
}

type RecordTownProps = {
  colors: SceneColors
  still?: boolean
  towers?: boolean
  children?: React.ReactNode
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

// Steep gable roof: a triangle extruded along the house depth, gable facing the street.
function useRoofGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.56, 0)
    shape.lineTo(0.56, 0)
    shape.lineTo(0, 0.8)
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
  floors: number
  cols: number
  facade: number
  band: number
}

// Two rows of narrow old-town houses around the label, clear of the figure's feet.
function useTown(): House[] {
  return useMemo(() => {
    const houses: House[] = []
    const rings = [
      { radius: 1.32, count: 16 },
      { radius: 1.64, count: 22 },
    ]
    let i = 0
    for (const ring of rings) {
      for (let n = 0; n < ring.count; n++) {
        i++
        const floors = 2 + Math.floor(rand(i + 200) * 2.2)
        houses.push({
          angle: (n / ring.count) * Math.PI * 2 + rand(i) * 0.08,
          radius: ring.radius + (rand(i + 50) - 0.5) * 0.06,
          width: 0.16 + rand(i + 100) * 0.08,
          height: 0.1 + floors * 0.075,
          depth: 0.17 + rand(i + 300) * 0.04,
          floors,
          cols: rand(i + 500) > 0.6 ? 3 : 2,
          facade: Math.floor(rand(i + 600) * 4),
          band: rand(i + 400),
        })
      }
    }
    return houses
  }, [])
}

// A facade with a window grid: `map` keeps the wall white (tinted by the material colour)
// and the panes dark; `emissiveMap` lights only the panes, so the windows glow at night.
function drawFacade(floors: number, cols: number) {
  const w = 96
  const h = 64 + floors * 48
  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const wall = make()
  const glow = make()
  const a = wall.getContext('2d')
  const b = glow.getContext('2d')
  if (a && b) {
    a.fillStyle = '#ffffff'
    a.fillRect(0, 0, w, h)
    b.fillStyle = '#000000'
    b.fillRect(0, 0, w, h)
    // a plinth line under the first floor
    a.fillStyle = '#c9c9c9'
    a.fillRect(0, h - 18, w, 18)
    const gap = w / cols
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const x = c * gap + gap / 2 - 10
        const y = 18 + f * 48
        a.fillStyle = '#3a3f46'
        a.fillRect(x - 3, y - 3, 26, 36)
        a.fillStyle = '#1b1d22'
        a.fillRect(x, y, 20, 30)
        b.fillStyle = '#ffffff'
        b.fillRect(x, y, 20, 30)
      }
    }
  }
  const toTexture = (canvas: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }
  return { map: toTexture(wall), emissiveMap: toTexture(glow) }
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

// The tonearm stands right of the platter; its stylus sits in the run-out groove,
// outside the ring of houses.
const ARM_PIVOT = new THREE.Vector3(2.38, 0, 0.98)
const STYLUS = new THREE.Vector3(1.92, 0, -0.17)
const ARM_HEIGHT = 0.2
// From the cartridge down to the record surface.
const STYLUS_LENGTH = ARM_HEIGHT + 0.01 - 0.085 - RECORD_HEIGHT / 2

function Tonearm({ colors, armRef }: { colors: SceneColors; armRef: React.RefObject<THREE.Group | null> }) {
  const { yaw, length } = useMemo(() => {
    const d = new THREE.Vector3().subVectors(STYLUS, ARM_PIVOT)
    return { yaw: -Math.atan2(d.z, d.x), length: Math.hypot(d.x, d.z) }
  }, [])
  const top = RECORD_HEIGHT / 2
  const metal = { color: colors.metal, metalness: 0.9, roughness: 0.22 }
  const dark = { color: colors.vinyl, metalness: 0.5, roughness: 0.45 }

  return (
    <group position={[ARM_PIVOT.x, 0, ARM_PIVOT.z]}>
      {/* plinth and pillar */}
      <mesh position={[0, top / 2, 0]}>
        <cylinderGeometry args={[0.24, 0.26, top + 0.04, 40]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[0, ARM_HEIGHT / 2 + 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.065, ARM_HEIGHT, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* arm rest post */}
      <mesh position={[0.3, ARM_HEIGHT / 2, -0.12]}>
        <cylinderGeometry args={[0.018, 0.022, ARM_HEIGHT, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      <group ref={armRef} position={[0, ARM_HEIGHT + 0.02, 0]} rotation={[0, yaw, 0]}>
        {/* gimbal */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.016, 12, 32]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        {/* counterweight behind the pivot */}
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.14, 32]} />
          <meshStandardMaterial {...dark} />
        </mesh>
        {/* the arm tube */}
        <mesh position={[(length - 0.3) / 2 - 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.017, 0.017, length + 0.12, 16]} />
          <meshStandardMaterial {...metal} />
        </mesh>
        {/* headshell, angled like a real offset, with a finger lift */}
        <group position={[length - 0.04, -0.01, 0]} rotation={[0, 0.38, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 0.024, 0.09]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[0.13, 0.025, 0.035]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.09, 0.01, 0.018]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          {/* the red cartridge and its stylus, touching the groove */}
          <mesh position={[0.03, -0.05, 0]}>
            <boxGeometry args={[0.1, 0.07, 0.07]} />
            <meshStandardMaterial color={colors.red} metalness={0.2} roughness={0.4} />
          </mesh>
          {/* headshell sits at y = ARM_HEIGHT + 0.01; the cartridge bottom is 0.085 below it */}
          <mesh position={[0.05, -0.085 - STYLUS_LENGTH / 2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.012, STYLUS_LENGTH, 12]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// Kleinstadt on a record: a ring of gabled houses riding the grooves,
// the twin cathedral towers on the label, bouncing to the beat.
export default function RecordTown({ colors, still = false, towers = true, children }: RecordTownProps) {
  const deck = useRef<THREE.Group>(null)
  const platter = useRef<THREE.Group>(null)
  const houseRefs = useRef<(THREE.Group | null)[]>([])
  const armRef = useRef<THREE.Group>(null)
  const scrollState = useRef({ last: 0, velocity: 0 })
  const roof = useRoofGeometry()
  const town = useTown()

  // One facade texture per floor and column count, shared by the houses that use it.
  const facades = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof drawFacade>>()
    return town.map((h) => {
      const key = `${h.floors}-${h.cols}`
      if (!cache.has(key)) cache.set(key, drawFacade(h.floors, h.cols))
      return cache.get(key)!
    })
  }, [town])

  // One material per facade colour; the windows' glow pulses with the kick.
  const houseMaterials = useMemo(
    () =>
      town.map(
        (h, i) =>
          new THREE.MeshStandardMaterial({
            color: colors.facades[h.facade % colors.facades.length],
            map: facades[i].map,
            emissive: colors.window,
            emissiveMap: facades[i].emissiveMap,
            emissiveIntensity: 0.9,
            roughness: 0.75,
          }),
      ),
    [town, facades, colors.facades, colors.window],
  )
  const roofMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.65 }),
    [colors.roof],
  )

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
      g.scale.y = 1 + level * 0.35
      houseMaterials[i].emissiveIntensity = 0.7 + level * 1.6
    })

    // The stylus rides the record's slight warp.
    if (armRef.current) armRef.current.rotation.z = Math.sin(state.clock.elapsedTime * BASE_SPIN) * 0.006
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
        {towers && [-0.2, 0.2].map((x) => (
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
        {towers && (
          <>
            <mesh position={[0, RECORD_HEIGHT / 2 + 0.25, -0.12]}>
              <boxGeometry args={[0.24, 0.5, 0.28]} />
              <meshStandardMaterial color={colors.ink} roughness={0.55} />
            </mesh>
            <mesh position={[0, RECORD_HEIGHT / 2 + 0.5, -0.12]} rotation={[0, Math.PI / 2, 0]} scale={[0.28, 0.4, 0.24]} geometry={roof}>
              <meshStandardMaterial color={colors.ink} roughness={0.55} />
            </mesh>
          </>
        )}

        {town.map((h, i) => (
          <group
            key={i}
            position={[Math.cos(h.angle) * h.radius, RECORD_HEIGHT / 2, Math.sin(h.angle) * h.radius]}
            rotation={[0, -h.angle + Math.PI / 2, 0]}
          >
            <group ref={(el) => { houseRefs.current[i] = el }}>
              <mesh position={[0, h.height / 2, 0]} material={houseMaterials[i]}>
                <boxGeometry args={[h.width, h.height, h.depth]} />
              </mesh>
              <mesh
                position={[0, h.height, 0]}
                scale={[h.width, h.width, h.depth * 1.06]}
                geometry={roof}
                material={roofMaterial}
              />
            </group>
          </group>
        ))}
      </group>

      <Tonearm colors={colors} armRef={armRef} />
      {children}
    </group>
  )
}
