'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type FigureProps = {
  ink: string
  collar: string
  font: string
  still?: boolean
}

const BPM = 124

// A tube whose radius tapers from `from` at the root to `to` at the tip.
function taperedTube(points: [number, number, number][], from: number, to: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  const tubular = 48
  const radial = 20
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let j = 0; j <= tubular; j++) {
    const t = j / tubular
    const center = curve.getPointAt(t)
    const r = THREE.MathUtils.lerp(from, to, Math.pow(t, 0.8))
    for (let k = 0; k <= radial; k++) {
      const i = j * (radial + 1) + k
      v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(r).add(center)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
  }
  geo.computeVertexNormals()
  return { geo, tip: curve.getPointAt(1), tipRadius: to }
}

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
}

// Proportions measured from the collective's artwork: a sphere head on a dark collar,
// a short torso, two long arms that spike down and out, two long legs in an uneven stride.
const HEAD_Y = 2.89
const HEAD_R = 0.42
const SHOULDER: Point = [0, 2.3, 0]
const CROTCH: Point = [-0.04, 1.62, 0]
const LIMBS: Limb[] = [
  // left arm
  { points: [[-0.1, 2.34, 0], [-0.45, 2.2, 0.05], [-0.85, 1.95, 0.1], [-1.25, 1.68, 0.14]], from: 0.22, to: 0.022, swing: 0.16, phase: 0 },
  // right arm
  { points: [[0.12, 2.36, 0], [0.52, 2.22, 0.05], [0.97, 1.9, 0.1], [1.34, 1.46, 0.14]], from: 0.22, to: 0.022, swing: 0.16, phase: Math.PI },
  // left leg, rooted high on the hip
  { points: [[-0.18, 1.98, 0], [-0.5, 1.45, 0.03], [-0.72, 0.75, 0.06], [-0.98, 0.02, 0.1]], from: 0.21, to: 0.06, swing: 0.03, phase: Math.PI / 2 },
  // right leg, from the crotch
  { points: [[0.0, 1.66, 0], [0.2, 1.1, 0.03], [0.36, 0.55, 0.05], [0.5, 0.02, 0.08]], from: 0.21, to: 0.06, swing: 0.03, phase: -Math.PI / 2 },
]

export default function Figure({ ink, collar, font, still = false }: FigureProps) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const limbRefs = useRef<(THREE.Group | null)[]>([])
  const face = useFaceTexture(font)

  const limbs = useMemo(() => LIMBS.map((l) => taperedTube(l.points, l.from, l.to)), [])
  const torso = useMemo(() => taperedTube([[0, 2.55, 0], SHOULDER, [-0.02, 1.95, 0], CROTCH], 0.27, 0.2), [])

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

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ink, metalness: 0.92, roughness: 0.15, envMapIntensity: 1.8 }),
    [ink],
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

    // The head follows the pointer.
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, state.pointer.x * 0.5, 5, dt)
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -state.pointer.y * 0.3, 5, dt)

    limbRefs.current.forEach((g, i) => {
      if (!g) return
      const l = LIMBS[i]
      g.rotation.z = Math.sin(beat * Math.PI + l.phase) * l.swing
    })
  })

  return (
    <group ref={body} scale={1.08}>
      <mesh geometry={torso.geo} material={chrome} />
      <mesh position={SHOULDER} scale={[1.45, 0.85, 1]} material={chrome}>
        <sphereGeometry args={[0.27, 32, 32]} />
      </mesh>
      <mesh position={CROTCH} material={chrome}>
        <sphereGeometry args={[0.2, 32, 32]} />
      </mesh>

      {limbs.map((limb, i) => {
        const root = LIMBS[i].points[0]
        return (
          <group key={i} position={root} ref={(el) => { limbRefs.current[i] = el }}>
            <group position={[-root[0], -root[1], -root[2]]}>
              <mesh geometry={limb.geo} material={chrome} />
              <mesh position={limb.tip} material={chrome}>
                <sphereGeometry args={[limb.tipRadius, 16, 16]} />
              </mesh>
            </group>
          </group>
        )
      })}

      <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.045, 16, 48]} />
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
