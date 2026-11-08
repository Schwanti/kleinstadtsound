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
  swing: number
  phase: number
  spike?: boolean
}

// Proportions measured from the collective's artwork: a sphere head on a dark collar,
// a short torso with a wide yoke, two long arms that spike down and out,
// two long legs in an uneven stride. The body is one liquid chrome surface.
const HEAD_Y = 2.89
const HEAD_R = 0.42
const TORSO: Limb = { points: [[0, 2.55, 0], [0, 2.32, 0.02], [-0.02, 1.95, 0.02], [-0.04, 1.62, 0]], from: 0.27, to: 0.22, swing: 0, phase: 0 }
const LIMBS: Limb[] = [
  // arms
  { points: [[-0.12, 2.34, 0], [-0.5, 2.2, 0.05], [-0.88, 1.95, 0.1], [-1.25, 1.66, 0.14]], from: 0.23, to: 0.06, swing: 0.16, phase: 0, spike: true },
  { points: [[0.14, 2.36, 0], [0.55, 2.22, 0.05], [0.98, 1.9, 0.1], [1.34, 1.46, 0.14]], from: 0.23, to: 0.06, swing: 0.16, phase: Math.PI, spike: true },
  // legs: the left rooted high on the hip, the right from the crotch
  { points: [[-0.16, 1.98, 0], [-0.48, 1.45, 0.03], [-0.72, 0.75, 0.06], [-0.98, 0.08, 0.1]], from: 0.21, to: 0.095, swing: 0.03, phase: Math.PI / 2 },
  { points: [[0.0, 1.66, 0], [0.2, 1.1, 0.03], [0.36, 0.55, 0.05], [0.5, 0.08, 0.08]], from: 0.21, to: 0.095, swing: 0.03, phase: -Math.PI / 2 },
]

// The metaball volume: a cube of 2 * HALF world units around CENTER.
const CENTER = new THREE.Vector3(0, 1.45, 0.05)
const HALF = 1.6
const ISOLATION = 80
const SUBTRACT = 12
// Calibrated so a chain of balls spaced at STEP renders close to the given radius.
const STEP = 0.055
const DENSITY = 0.3

type Sample = { p: THREE.Vector3; r: number; phase: number }

function sampleLimb(limb: Limb): Sample[] {
  const curve = new THREE.CatmullRomCurve3(limb.points.map((p) => new THREE.Vector3(...p)))
  const count = Math.max(2, Math.ceil(curve.getLength() / STEP))
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count
    return { p: curve.getPointAt(t), r: THREE.MathUtils.lerp(limb.from, limb.to, Math.pow(t, 0.7)), phase: t * 6 }
  })
}

function tipFrame(limb: Limb) {
  const curve = new THREE.CatmullRomCurve3(limb.points.map((p) => new THREE.Vector3(...p)))
  return { tip: curve.getPointAt(1), dir: curve.getTangentAt(1).normalize() }
}

const UP = new THREE.Vector3(0, 1, 0)

export default function Figure({ ink, collar, font, still = false }: FigureProps) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const spikeRefs = useRef<(THREE.Mesh | null)[]>([])
  const face = useFaceTexture(font)

  const torso = useMemo(() => sampleLimb(TORSO), [])
  const limbs = useMemo(() => LIMBS.map(sampleLimb), [])
  const tips = useMemo(() => LIMBS.map(tipFrame), [])

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ink, metalness: 0.92, roughness: 0.15, envMapIntensity: 1.8 }),
    [ink],
  )

  // Lower resolution on small screens keeps the per-frame rebuild cheap.
  const liquid = useMemo(() => {
    const resolution = typeof window !== 'undefined' && window.innerWidth < 640 ? 48 : 76
    const mc = new MarchingCubes(resolution, chrome, false, false, 90000)
    mc.isolation = ISOLATION
    mc.position.copy(CENTER)
    mc.scale.setScalar(HALF)
    return mc
  }, [chrome])

  useEffect(() => () => liquid.geometry.dispose(), [liquid])

  // Rebuilds the liquid body for the given pose.
  const pose = useMemo(() => {
    const tmp = new THREE.Vector3()
    const axis = new THREE.Vector3(0, 0, 1)
    const add = (p: THREE.Vector3, r: number) => {
      const rn = r / (2 * HALF)
      liquid.addBall(
        (p.x - CENTER.x) / (2 * HALF) + 0.5,
        (p.y - CENTER.y) / (2 * HALF) + 0.5,
        (p.z - CENTER.z) / (2 * HALF) + 0.5,
        DENSITY * rn * rn * (ISOLATION + SUBTRACT),
        SUBTRACT,
      )
    }
    return (time: number, beat: number) => {
      liquid.reset()
      for (const s of torso) add(s.p, s.r * (1 + 0.03 * Math.sin(time * 2.4 + s.phase)))
      LIMBS.forEach((limb, i) => {
        const angle = Math.sin(beat * Math.PI + limb.phase) * limb.swing
        const root = limbs[i][0].p
        for (const s of limbs[i]) {
          tmp.copy(s.p).sub(root).applyAxisAngle(axis, angle).add(root)
          add(tmp, s.r * (1 + 0.04 * Math.sin(time * 3 + s.phase + i)))
        }
        const spike = spikeRefs.current[i]
        if (spike) {
          const { tip, dir } = tips[i]
          spike.position.copy(tip).sub(root).applyAxisAngle(axis, angle).add(root)
          spike.quaternion.setFromUnitVectors(UP, tmp.copy(dir).applyAxisAngle(axis, angle))
          spike.translateY(0.15 - 0.04)
        }
      })
      liquid.update()
    }
  }, [liquid, torso, limbs, tips])

  // Build the resting pose once, so the figure also stands when motion is reduced.
  useEffect(() => {
    pose(0, 0.5)
  }, [pose])

  // The liquid is rebuilt at 30 fps; the transforms below still run every frame.
  const sinceRebuild = useRef(1)

  useFrame((state, delta) => {
    if (still || !body.current || !head.current) return
    const dt = Math.min(delta, 0.05)
    const beat = (state.clock.elapsedTime * BPM) / 60
    const kick = Math.pow(1 - (beat % 1), 3)
    const sway = Math.sin(beat * Math.PI)

    sinceRebuild.current += delta
    if (sinceRebuild.current >= 1 / 30) {
      sinceRebuild.current = 0
      pose(state.clock.elapsedTime, beat)
    }

    // Bounce on the kick, sway on the bar, turn with the scroll.
    body.current.position.y = kick * 0.08
    body.current.rotation.z = sway * 0.04
    const scrollTurn = window.scrollY * 0.003
    body.current.rotation.y = THREE.MathUtils.damp(body.current.rotation.y, state.pointer.x * 0.35 + Math.sin(scrollTurn) * 0.6, 3, dt)

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

      {LIMBS.map((limb, i) =>
        limb.spike ? (
          <mesh key={i} ref={(el) => { spikeRefs.current[i] = el }} material={chrome}>
            <coneGeometry args={[0.036, 0.3, 24]} />
          </mesh>
        ) : null,
      )}

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
