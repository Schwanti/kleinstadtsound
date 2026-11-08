'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MarchingCubes } from 'three-stdlib'

type FigureProps = {
  ink: string
  collar: string
  font: string
  still?: boolean
}

const BPM = 124

function drawFace(font: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // A bright silver sheen behind the letters, fading into the chrome at the rim.
    const sheen = ctx.createRadialGradient(236, 220, 20, 256, 256, 256)
    sheen.addColorStop(0, 'rgba(250, 249, 246, 1)')
    sheen.addColorStop(0.6, 'rgba(214, 211, 206, 0.95)')
    sheen.addColorStop(1, 'rgba(160, 156, 150, 0)')
    ctx.fillStyle = sheen
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#0b0b0b'
    ctx.font = `124px ${font}`
    ctx.fillText('KLEIN', 256, 142)
    ctx.fillText('STADT', 256, 256)
    ctx.fillText('SOUND', 256, 370)
    ctx.fillRect(72, 252, 40, 10)
    ctx.fillRect(400, 252, 40, 10)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// The logo on the head, redrawn once the display font has loaded.
function useFaceTexture(font: string) {
  const [fontsReady, setFontsReady] = useState(0)

  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) setFontsReady((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => drawFace(font), [font, fontsReady])
}

type Point = [number, number, number]

type Limb = {
  points: Point[]
  from: number
  to: number
}

// Proportions measured from the collective's artwork: a sphere head on a dark collar,
// a short torso with a wide yoke, two long arms that spike down and out,
// two long legs in an uneven stride.
const HEAD_Y = 2.89
const HEAD_R = 0.42
const TORSO: Limb = { points: [[0, 2.55, 0], [0, 2.32, 0.02], [-0.02, 1.95, 0.02], [-0.04, 1.62, 0]], from: 0.27, to: 0.22 }
const ARMS: (Limb & { phase: number })[] = [
  { points: [[-0.02, 2.4, 0], [-0.5, 2.2, 0.05], [-0.9, 1.94, 0.1], [-1.3, 1.6, 0.15]], from: 0.21, to: 0.004, phase: 0 },
  { points: [[0.02, 2.42, 0], [0.55, 2.22, 0.05], [1.0, 1.88, 0.1], [1.38, 1.42, 0.15]], from: 0.21, to: 0.004, phase: Math.PI },
]
// The left leg rooted high on the hip, the right from the crotch.
const LEGS: Limb[] = [
  { points: [[-0.16, 1.98, 0], [-0.48, 1.45, 0.03], [-0.72, 0.75, 0.06], [-0.98, 0.08, 0.1]], from: 0.21, to: 0.1 },
  { points: [[0.0, 1.66, 0], [0.2, 1.1, 0.03], [0.36, 0.55, 0.05], [0.5, 0.08, 0.08]], from: 0.21, to: 0.1 },
]
const ARM_SWING = 0.06
// How much of each arm melts into the liquid shoulders.
const ARM_ROOT = 0.2

// The liquid body (torso, shoulders, legs) is one metaball surface, built once.
const CENTER = new THREE.Vector3(0, 1.45, 0.05)
const HALF = 1.6
const ISOLATION = 80
const SUBTRACT = 12
const STEP = 0.04
const DENSITY = 0.3

function curveOf(limb: Limb) {
  return new THREE.CatmullRomCurve3(limb.points.map((p) => new THREE.Vector3(...p)))
}

function radiusAt(limb: Limb, t: number) {
  return THREE.MathUtils.lerp(limb.from, limb.to, Math.pow(t, 0.75))
}

// A smooth tube that tapers to a point: the arms, crisp at any size.
function taperedTube(limb: Limb) {
  const curve = curveOf(limb)
  const tubular = 96
  const radial = 32
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let j = 0; j <= tubular; j++) {
    const t = j / tubular
    const center = curve.getPointAt(t)
    const r = radiusAt(limb, t)
    for (let k = 0; k <= radial; k++) {
      const i = j * (radial + 1) + k
      v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(r).add(center)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
  }
  geo.computeVertexNormals()
  return geo
}

function buildLiquid(material: THREE.Material, resolution: number) {
  const mc = new MarchingCubes(resolution, material, false, false, 200000)
  mc.isolation = ISOLATION
  mc.position.copy(CENTER)
  mc.scale.setScalar(HALF)
  const add = (p: THREE.Vector3, r: number) => {
    const rn = r / (2 * HALF)
    mc.addBall(
      (p.x - CENTER.x) / (2 * HALF) + 0.5,
      (p.y - CENTER.y) / (2 * HALF) + 0.5,
      (p.z - CENTER.z) / (2 * HALF) + 0.5,
      DENSITY * rn * rn * (ISOLATION + SUBTRACT),
      SUBTRACT,
    )
  }
  const chain = (limb: Limb, until = 1, scale = 1) => {
    const curve = curveOf(limb)
    const count = Math.max(2, Math.ceil((curve.getLength() * until) / STEP))
    for (let i = 0; i <= count; i++) {
      const t = (i / count) * until
      add(curve.getPointAt(t), radiusAt(limb, t) * scale)
    }
  }
  mc.reset()
  chain(TORSO)
  LEGS.forEach((leg) => chain(leg))
  ARMS.forEach((arm) => chain(arm, ARM_ROOT, 1.04))
  mc.update()
  return mc
}

export default function Figure({ ink, collar, font, still = false }: FigureProps) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const armRefs = useRef<(THREE.Group | null)[]>([])
  const face = useFaceTexture(font)

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ink, metalness: 0.92, roughness: 0.15, envMapIntensity: 1.8 }),
    [ink],
  )

  const liquid = useMemo(() => {
    const small = typeof window !== 'undefined' && window.innerWidth < 640
    return buildLiquid(chrome, small ? 64 : 96)
  }, [chrome])
  useEffect(() => () => liquid.geometry.dispose(), [liquid])

  // Each arm pivots where it leaves the torso, so the joint stays closed while it swings.
  const arms = useMemo(
    () =>
      ARMS.map((arm) => {
        const p = curveOf(arm).getPointAt(ARM_ROOT * 0.6)
        return { geo: taperedTube(arm), root: [p.x, p.y, p.z] as Point }
      }),
    [],
  )

  useFrame((state, delta) => {
    if (still || !body.current || !head.current) return
    const dt = Math.min(delta, 0.05)
    const beat = (state.clock.elapsedTime * BPM) / 60
    const kick = Math.pow(1 - (beat % 1), 3)
    const sway = Math.sin(beat * Math.PI)

    // Bounce on the kick, sway on the bar, turn with the scroll.
    body.current.position.y = kick * 0.08
    body.current.rotation.z = sway * 0.04
    const scrollTurn = window.scrollY * 0.003
    body.current.rotation.y = THREE.MathUtils.damp(body.current.rotation.y, state.pointer.x * 0.35 + Math.sin(scrollTurn) * 0.6, 3, dt)

    // Arms swing from the shoulder, in opposite phase.
    armRefs.current.forEach((g, i) => {
      if (g) g.rotation.z = Math.sin(beat * Math.PI + ARMS[i].phase) * ARM_SWING
    })

    // The head follows the pointer.
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, state.pointer.x * 0.5, 5, dt)
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -state.pointer.y * 0.3, 5, dt)
  })

  // A disc bent onto the head so the logo sits on the sphere, planar UVs kept.
  const faceGeo = useMemo(() => {
    const size = 0.37
    const ring = new THREE.RingGeometry(0.0001, size, 64, 16)
    const pos = ring.attributes.position
    const uv = ring.attributes.uv
    const R = HEAD_R + 0.004
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.sqrt(Math.max(R * R - x * x - y * y, 0)))
      uv.setXY(i, x / (size * 2) + 0.5, y / (size * 2) + 0.5)
    }
    ring.computeVertexNormals()
    return ring
  }, [])

  return (
    <group ref={body} scale={1.08}>
      <primitive object={liquid} />

      {arms.map(({ geo, root }, i) => (
        <group key={i} position={root} ref={(el) => { armRefs.current[i] = el }}>
          <mesh geometry={geo} material={chrome} position={[-root[0], -root[1], -root[2]]} />
        </group>
      ))}

      <mesh position={[0, 2.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.045, 16, 48]} />
        <meshStandardMaterial color={collar} metalness={0.5} roughness={0.4} />
      </mesh>

      <group ref={head} position={[0, HEAD_Y, 0]}>
        <mesh material={chrome}>
          <sphereGeometry args={[HEAD_R, 64, 64]} />
        </mesh>
        <mesh geometry={faceGeo}>
          <meshStandardMaterial
            map={face}
            transparent
            metalness={0.2}
            roughness={0.5}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      </group>
    </group>
  )
}
