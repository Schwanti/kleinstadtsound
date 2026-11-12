'use client'

import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneState } from './sceneState'
import { showToast } from '@/components/ui/toast'

export type SceneColors = {
  ink: string
  red: string
  vinyl: string
  groove: string
  facades: string[]
  roof: string
  window: string
  metal: string
  limestone: string
  sandstone: string
  copper: string
  gold: string
  hill: string
  river: string
  neon: string
  fossil: string
  bone: string
  font: string
}

type RecordTownProps = {
  colors: SceneColors
  still?: boolean
  children?: React.ReactNode
}

const RECORD_RADIUS = 2
const RECORD_HEIGHT = 0.05
const TOP = RECORD_HEIGHT / 2
const LABEL_RADIUS = 0.72
const BPM = 124
const BASE_SPIN = 0.55 // rad/s, a slow 33 rpm feel
const DECK_TILT = 0.42

// The two rings of the old town, and the Altmühl flowing in the groove between them.
const INNER = 1.32
const OUTER = 1.64
const RIVER = 1.48

// Landmarks take a slot on a ring; the houses leave room for them.
const LANDMARKS = {
  burg: { ring: OUTER, angle: -2.2, clear: 0.55 },
  dom: { ring: INNER, angle: -1.0, clear: 0.42 },
  kellerbar: { ring: OUTER, angle: 1.25, clear: 0.24 },
  mariensaeule: { ring: INNER, angle: 2.05, clear: 0.2 },
}

// Deterministic pseudo random so the town is the same on every render.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function polar(radius: number, angle: number): [number, number, number] {
  return [Math.cos(angle) * radius, TOP, Math.sin(angle) * radius]
}

// Local +z points away from the label, so a gable faces the street.
const facing = (angle: number): [number, number, number] => [0, -angle + Math.PI / 2, 0]

function gable(pitch: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-0.58, 0)
  shape.lineTo(0.58, 0)
  shape.lineTo(0, pitch)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false })
  geo.translate(0, 0, -0.5)
  return geo
}

// Shared roof shapes: steep baroque tiles, a cathedral nave, low Jura limestone slabs.
const ROOFS = {
  steep: gable(0.8),
  nave: gable(0.7),
  jura: gable(0.34),
}

type HouseStyle = 'barock' | 'jura'

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
  style: HouseStyle
}

function angularDistance(a: number, b: number) {
  const d = Math.abs(((a - b + Math.PI) % (Math.PI * 2)) - Math.PI)
  return Math.min(d, Math.PI * 2 - d)
}

// Baroque town houses in pastel with steep tile roofs, and Jura houses: white walls
// under the low roofs of stacked limestone slabs that the Altmühl valley is known for.
function useTown(): House[] {
  return useMemo(() => {
    const houses: House[] = []
    const rings = [
      { radius: INNER, count: 16 },
      { radius: OUTER, count: 22 },
    ]
    let i = 0
    for (const ring of rings) {
      for (let n = 0; n < ring.count; n++) {
        i++
        const angle = (n / ring.count) * Math.PI * 2 + rand(i) * 0.08
        const blocked = Object.values(LANDMARKS).some(
          (l) => l.ring === ring.radius && angularDistance(angle, l.angle) < l.clear,
        )
        if (blocked) continue
        const style: HouseStyle = rand(i + 700) < 0.4 ? 'jura' : 'barock'
        const floors = style === 'jura' ? 2 : 2 + Math.floor(rand(i + 200) * 2.2)
        houses.push({
          angle,
          radius: ring.radius + (rand(i + 50) - 0.5) * 0.05,
          width: style === 'jura' ? 0.22 + rand(i + 100) * 0.06 : 0.16 + rand(i + 100) * 0.08,
          height: 0.1 + floors * 0.075,
          depth: 0.17 + rand(i + 300) * 0.04,
          floors,
          cols: style === 'jura' ? 3 : rand(i + 500) > 0.6 ? 3 : 2,
          facade: Math.floor(rand(i + 600) * 4),
          band: rand(i + 400),
          style,
        })
      }
    }
    return houses
  }, [])
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
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
  return { map: canvasTexture(wall), emissiveMap: canvasTexture(glow) }
}

// The label, printed like a real pressing.
function drawLabel(red: string, font: string) {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (ctx) {
    const mid = size / 2
    ctx.fillStyle = red
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(mid, mid, mid - 40, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // the name around the rim
    const ring = 'KLEINSTADTSOUND   EICHSTÄTT   '
    ctx.font = `30px ${font}`
    const step = (Math.PI * 2) / ring.length
    for (let i = 0; i < ring.length; i++) {
      ctx.save()
      ctx.translate(mid, mid)
      ctx.rotate(i * step)
      ctx.translate(0, -(mid - 72))
      ctx.fillText(ring[i], 0, 0)
      ctx.restore()
    }
    ctx.font = `44px ${font}`
    ctx.fillText('SEITE A', mid, mid - 110)
    ctx.font = `26px ${font}`
    ctx.fillText('33 1/3', mid - 120, mid)
    ctx.fillText('KSS 001', mid + 120, mid)
    ctx.fillText('MIT MUSIK KÖNNEN MENSCHEN', mid, mid + 96)
    ctx.fillText('NICHT UNSYMPATHISCH SEIN', mid, mid + 128)
  }
  return canvasTexture(c)
}

// The famous slab: an Archaeopteryx skeleton in Solnhofen limestone, head thrown back,
// wings spread with their feather prints, the long tail feathered on both sides.
function drawFossil(stone: string, bone: string) {
  const w = 320
  const h = 240
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.fillStyle = stone
    ctx.fillRect(0, 0, w, h)
    // limestone grain
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rand(i) * 0.06})`
      ctx.fillRect(rand(i + 1) * w, rand(i + 2) * h, 2, 2)
    }
    ctx.strokeStyle = bone
    ctx.fillStyle = bone
    ctx.lineCap = 'round'
    const line = (pts: number[][], width: number) => {
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y)
      ctx.stroke()
    }
    // feather prints of both wings, fanned
    ctx.globalAlpha = 0.45
    for (let i = 0; i < 11; i++) {
      line([[150, 110], [40 + i * 6, 40 + i * 9]], 2)
      line([[170, 105], [250 + i * 5, 30 + i * 8]], 2)
    }
    ctx.globalAlpha = 1
    // spine, curved neck thrown back, skull with snout
    line([[200, 150], [170, 120], [150, 100], [140, 75], [150, 55], [168, 50]], 4)
    ctx.beginPath()
    ctx.ellipse(176, 48, 12, 8, -0.3, 0, Math.PI * 2)
    ctx.fill()
    line([[184, 46], [204, 52]], 3)
    // arm bones and clawed fingers
    line([[150, 100], [105, 80], [70, 60]], 3)
    line([[165, 98], [210, 72], [250, 52]], 3)
    for (const [x, y, dx] of [[70, 60, -1], [250, 52, 1]]) {
      for (let k = 0; k < 3; k++) line([[x, y], [x + dx * (10 + k * 4), y - 8 + k * 6]], 2)
    }
    // ribs, pelvis, legs
    for (let k = 0; k < 5; k++) line([[160 + k * 7, 112 + k * 6], [150 + k * 7, 128 + k * 6]], 2)
    line([[200, 150], [185, 185], [200, 210], [188, 225]], 3)
    line([[205, 152], [225, 180], [215, 205], [228, 220]], 3)
    // the long tail with its feather pairs
    const tail = [[200, 150], [230, 160], [258, 168], [284, 174], [308, 178]]
    line(tail, 3)
    ctx.globalAlpha = 0.5
    for (const [x, y] of tail.slice(1)) {
      line([[x, y], [x + 8, y - 16]], 2)
      line([[x, y], [x + 8, y + 16]], 2)
    }
    ctx.globalAlpha = 1
  }
  return canvasTexture(c)
}

// A neon sign: the glyphs are the only lit pixels.
function drawSign(text: string, font: string) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `44px ${font}`
    ctx.fillText(text, 128, 34)
  }
  return canvasTexture(c)
}

function Grooves({ color, river }: { color: string; river: string }) {
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
    <group position={[0, TOP + 0.001, 0]}>
      {lines.map((geo, i) => (
        <lineLoop key={i} geometry={geo}>
          <lineBasicMaterial color={color} transparent opacity={0.55} />
        </lineLoop>
      ))}
      {/* the Altmühl, running in the groove between the two rings of houses */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
        onClick={(e) => {
          e.stopPropagation()
          showToast('I ♥ Altmühltal')
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <ringGeometry args={[RIVER - 0.035, RIVER + 0.035, 160]} />
        <meshStandardMaterial color={river} emissive={river} emissiveIntensity={0.35} roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

// The cathedral: a sandstone nave, an apse, and the two west towers with pointed helmets.
function Dom({ colors }: { colors: SceneColors }) {
  const stone = { color: colors.sandstone, roughness: 0.8 }
  const helm = { color: colors.copper, roughness: 0.5, metalness: 0.3 }
  return (
    <group position={polar(LANDMARKS.dom.ring, LANDMARKS.dom.angle)} rotation={facing(LANDMARKS.dom.angle)}>
      <mesh position={[0, 0.16, -0.06]}>
        <boxGeometry args={[0.22, 0.32, 0.46]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      <mesh position={[0, 0.32, -0.06]} rotation={[0, Math.PI / 2, 0]} scale={[0.48, 0.2, 0.24]} geometry={ROOFS.nave}>
        <meshStandardMaterial color={colors.roof} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.16, -0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.3, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      {[-0.075, 0.075].map((x) => (
        <group key={x} position={[x, 0, 0.2]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial {...stone} />
          </mesh>
          <mesh position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.075, 0.26, 4]} />
            <meshStandardMaterial {...helm} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Willibaldsburg on its hill: the long Gemmingen wing with lit windows and two domed towers.
function Burg({
  colors,
  facade,
  windowsRef,
}: {
  colors: SceneColors
  facade: ReturnType<typeof drawFacade>
  windowsRef: React.RefObject<THREE.MeshStandardMaterial | null>
}) {
  return (
    <group position={polar(LANDMARKS.burg.ring, LANDMARKS.burg.angle)} rotation={facing(LANDMARKS.burg.angle)}>
      <mesh scale={[0.62, 0.2, 0.34]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={colors.hill} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[0.64, 0.16, 0.16]} />
        <meshStandardMaterial
          ref={windowsRef}
          color={colors.sandstone}
          map={facade.map}
          emissive={colors.window}
          emissiveMap={facade.emissiveMap}
          emissiveIntensity={0.9}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.35, 0]} scale={[0.64, 0.12, 0.17]} geometry={ROOFS.steep}>
        <meshStandardMaterial color={colors.roof} roughness={0.65} />
      </mesh>
      <Fossil colors={colors} />
      {[-0.34, 0.34].map((x) => (
        <group key={x} position={[x, 0.18, 0]}>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.07, 0.075, 0.34, 20]} />
            <meshStandardMaterial color={colors.sandstone} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <sphereGeometry args={[0.075, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={colors.copper} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <coneGeometry args={[0.02, 0.1, 8]} />
            <meshStandardMaterial color={colors.copper} roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Easter egg: the Archaeopteryx slab, leaning against the castle hill (the Jura-Museum is up there).
function Fossil({ colors }: { colors: SceneColors }) {
  const texture = useMemo(() => drawFossil(colors.fossil, colors.bone), [colors.fossil, colors.bone])
  return (
    <mesh position={[0.12, 0.12, 0.33]} rotation={[-0.9, 0, 0]}>
      <boxGeometry args={[0.3, 0.22, 0.02]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  )
}

// The Marian column from the Residenzplatz, gilded figure on top.
function Mariensaeule({ colors }: { colors: SceneColors }) {
  return (
    <group position={polar(LANDMARKS.mariensaeule.ring, LANDMARKS.mariensaeule.angle)}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color={colors.sandstone} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.42, 12]} />
        <meshStandardMaterial color={colors.sandstone} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.51, 0]}>
        <capsuleGeometry args={[0.022, 0.05, 4, 10]} />
        <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.25} emissive={colors.gold} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.57, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.03, 0.005, 6, 20]} />
        <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.25} emissive={colors.gold} emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// Easter egg: the home venue, a red neon sign over the stairs down to the cellar.
function Kellerbar({ colors, signRef }: { colors: SceneColors; signRef: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  const sign = useMemo(() => drawSign('KELLERBAR', colors.font), [colors.font])
  return (
    <group position={polar(LANDMARKS.kellerbar.ring, LANDMARKS.kellerbar.angle)} rotation={facing(LANDMARKS.kellerbar.angle)}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.32, 0.3, 0.2]} />
        <meshStandardMaterial color={colors.facades[1]} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]} scale={[0.32, 0.26, 0.21]} geometry={ROOFS.steep}>
        <meshStandardMaterial color={colors.roof} roughness={0.65} />
      </mesh>
      {/* the cellar door, half sunk into the street */}
      <mesh position={[0, 0.04, 0.101]}>
        <boxGeometry args={[0.1, 0.08, 0.004]} />
        <meshStandardMaterial color={colors.vinyl} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0.104]}>
        <planeGeometry args={[0.3, 0.075]} />
        <meshStandardMaterial
          ref={signRef}
          color={colors.vinyl}
          emissive={colors.neon}
          emissiveMap={sign}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// The tonearm stands right of the platter; its stylus sits in the run-out groove,
// outside the ring of houses. Easter egg: click it to lift the needle.
const ARM_PIVOT = new THREE.Vector3(2.38, 0, 0.98)
const STYLUS = new THREE.Vector3(1.92, 0, -0.17)
const ARM_HEIGHT = 0.2
// From the cartridge down to the record surface.
const STYLUS_LENGTH = ARM_HEIGHT + 0.01 - 0.085 - TOP
const LIFT = 0.12

function Tonearm({
  colors,
  armRef,
  onToggle,
}: {
  colors: SceneColors
  armRef: React.RefObject<THREE.Group | null>
  onToggle: (e: ThreeEvent<MouseEvent>) => void
}) {
  const { yaw, length } = useMemo(() => {
    const d = new THREE.Vector3().subVectors(STYLUS, ARM_PIVOT)
    return { yaw: -Math.atan2(d.z, d.x), length: Math.hypot(d.x, d.z) }
  }, [])
  const metal = { color: colors.metal, metalness: 0.9, roughness: 0.22 }
  const dark = { color: colors.vinyl, metalness: 0.5, roughness: 0.45 }
  const pointer = {
    onClick: onToggle,
    onPointerOver: () => (document.body.style.cursor = 'pointer'),
    onPointerOut: () => (document.body.style.cursor = ''),
  }

  return (
    <group position={[ARM_PIVOT.x, 0, ARM_PIVOT.z]} {...pointer}>
      <mesh position={[0, TOP / 2, 0]}>
        <cylinderGeometry args={[0.24, 0.26, TOP + 0.04, 40]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[0, ARM_HEIGHT / 2 + 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.065, ARM_HEIGHT, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0.3, ARM_HEIGHT / 2, -0.12]}>
        <cylinderGeometry args={[0.018, 0.022, ARM_HEIGHT, 12]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      <group position={[0, ARM_HEIGHT + 0.02, 0]} rotation={[0, yaw, 0]}>
        <group ref={armRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.085, 0.016, 12, 32]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.075, 0.14, 32]} />
            <meshStandardMaterial {...dark} />
          </mesh>
          <mesh position={[(length - 0.3) / 2 - 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.017, 0.017, length + 0.12, 16]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          {/* a generous invisible hit area along the arm */}
          <mesh position={[length / 2 - 0.1, 0, 0]} visible={false}>
            <boxGeometry args={[length + 0.5, 0.18, 0.22]} />
          </mesh>
          <group position={[length - 0.04, -0.01, 0]} rotation={[0, 0.38, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.024, 0.09]} />
              <meshStandardMaterial {...metal} />
            </mesh>
            <mesh position={[0.13, 0.025, 0.035]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.09, 0.01, 0.018]} />
              <meshStandardMaterial {...metal} />
            </mesh>
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
    </group>
  )
}

// Kleinstadt on a record: Eichstätt's old town riding the grooves, bouncing to the beat.
export default function RecordTown({ colors, still = false, children }: RecordTownProps) {
  const deck = useRef<THREE.Group>(null)
  const platter = useRef<THREE.Group>(null)
  const houseRefs = useRef<(THREE.Group | null)[]>([])
  const armRef = useRef<THREE.Group>(null)
  const signRef = useRef<THREE.MeshStandardMaterial>(null)
  const burgRef = useRef<THREE.MeshStandardMaterial>(null)
  const scrollState = useRef({ last: 0, velocity: 0 })
  const town = useTown()

  const label = useMemo(() => drawLabel(colors.red, colors.font), [colors.red, colors.font])

  // One facade texture per floor and column count, shared by the houses that use it.
  const facades = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof drawFacade>>()
    const get = (floors: number, cols: number) => {
      const key = `${floors}-${cols}`
      if (!cache.has(key)) cache.set(key, drawFacade(floors, cols))
      return cache.get(key)!
    }
    return { houses: town.map((h) => get(h.floors, h.cols)), burg: get(2, 8) }
  }, [town])

  // One material per house; the windows' glow pulses with the kick.
  const houseMaterials = useMemo(
    () =>
      town.map(
        (h, i) =>
          new THREE.MeshStandardMaterial({
            color: h.style === 'jura' ? colors.facades[0] : colors.facades[h.facade % colors.facades.length],
            map: facades.houses[i].map,
            emissive: colors.window,
            emissiveMap: facades.houses[i].emissiveMap,
            emissiveIntensity: 0.9,
            roughness: 0.75,
          }),
      ),
    [town, facades, colors.facades, colors.window],
  )
  const roofMaterials = useMemo(
    () => ({
      barock: new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.65 }),
      jura: new THREE.MeshStandardMaterial({ color: colors.limestone, roughness: 0.9 }),
    }),
    [colors.roof, colors.limestone],
  )

  const toggleNeedle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    sceneState.playing = !sceneState.playing
  }

  const windowColor = useMemo(() => new THREE.Color(), [])
  const baseWindow = useMemo(() => new THREE.Color(colors.window), [colors.window])

  useFrame((state, delta) => {
    if (still || !deck.current || !platter.current) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const playing = sceneState.playing

    // Scroll scratches the record.
    const y = window.scrollY
    const s = scrollState.current
    s.velocity = THREE.MathUtils.damp(s.velocity, (y - s.last) * 0.02, 8, dt)
    s.last = y
    platter.current.rotation.y -= (BASE_SPIN + s.velocity * 6) * dt

    // Houses pump like an equalizer while the needle is down; party mode paints the windows.
    const beat = (t * BPM) / 60
    const kick = Math.pow(1 - (beat % 1), 3)
    const off = Math.pow(1 - ((beat + 0.5) % 1), 4)
    if (sceneState.party) windowColor.setHSL((t * 0.25) % 1, 1, 0.6)
    else windowColor.copy(baseWindow)
    houseRefs.current.forEach((g, i) => {
      if (!g) return
      const band = town[i].band
      const level = playing ? (band < 0.5 ? kick * (1 - band) : off * band) : 0
      g.scale.y = THREE.MathUtils.damp(g.scale.y, 1 + level * 0.35, 18, dt)
      const m = houseMaterials[i]
      m.emissive.copy(windowColor)
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, playing ? 0.7 + level * 1.6 : 0.25, 6, dt)
    })
    if (burgRef.current) burgRef.current.emissiveIntensity = playing ? 0.8 + kick * 0.6 : 0.25

    // The Kellerbar sign flickers now and then, like an old neon tube.
    if (signRef.current) {
      const flicker = Math.sin(t * 7.3) > 0.97 || (t % 11 > 10.6 && Math.sin(t * 60) > 0)
      signRef.current.emissiveIntensity = flicker ? 0.3 : 2.2
    }

    // The needle lifts and lowers; while down it rides the record's slight warp.
    if (armRef.current) {
      const target = playing ? Math.sin(t * BASE_SPIN) * 0.006 : LIFT
      armRef.current.rotation.z = THREE.MathUtils.damp(armRef.current.rotation.z, target, 5, dt)
    }
  })

  return (
    <group ref={deck} rotation={[DECK_TILT, 0, 0]} position={[0, 0, 0]}>
      <group ref={platter}>
        <mesh>
          <cylinderGeometry args={[RECORD_RADIUS, RECORD_RADIUS, RECORD_HEIGHT, 128]} />
          <meshStandardMaterial color={colors.vinyl} roughness={0.28} metalness={0.4} />
        </mesh>
        <Grooves color={colors.groove} river={colors.river} />
        <mesh position={[0, TOP + 0.002, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[LABEL_RADIUS, LABEL_RADIUS, 0.004, 64]} />
          <meshStandardMaterial map={label} roughness={0.6} />
        </mesh>

        <Dom colors={colors} />
        <Burg colors={colors} facade={facades.burg} windowsRef={burgRef} />
        <Mariensaeule colors={colors} />
        <Kellerbar colors={colors} signRef={signRef} />

        {town.map((h, i) => (
          <group key={i} position={polar(h.radius, h.angle)} rotation={facing(h.angle)}>
            <group ref={(el) => { houseRefs.current[i] = el }}>
              <mesh position={[0, h.height / 2, 0]} material={houseMaterials[i]}>
                <boxGeometry args={[h.width, h.height, h.depth]} />
              </mesh>
              <mesh
                position={[0, h.height, 0]}
                scale={[h.width, h.width, h.depth * (h.style === 'jura' ? 1.14 : 1.06)]}
                geometry={h.style === 'jura' ? ROOFS.jura : ROOFS.steep}
                material={roofMaterials[h.style]}
              />
            </group>
          </group>
        ))}
      </group>

      <Tonearm colors={colors} armRef={armRef} onToggle={toggleNeedle} />
      {children}
    </group>
  )
}
