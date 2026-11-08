'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type FigureProps = {
  ink: string
  red: string
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

function drawFace(red: string, font: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(220, 200, 40, 256, 256, 256)
    grad.addColorStop(0, '#f4f2ee')
    grad.addColorStop(1, '#a9a6a2')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `128px ${font}`
    ctx.fillStyle = '#111'
    ctx.fillText('KLEIN', 256, 138)
    ctx.fillText('STADT', 256, 256)
    ctx.fillStyle = red
    ctx.fillText('SOUND', 256, 374)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// The logo face: KLEIN / STADT in black, SOUND in red, on a pale disc.
// Redrawn once the display font has loaded.
function useFaceTexture(red: string, font: string) {
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
  return useMemo(() => drawFace(red, font), [red, font, fontsReady])
}

type Limb = {
  points: [number, number, number][]
  from: number
  to: number
  swing: number
  phase: number
}

// Shoulders and hips meet in one core, the limbs flow out of it and taper to a point.
const CORE: [number, number, number] = [0, 1.62, 0]
const LIMBS: Limb[] = [
  { points: [CORE, [-0.45, 1.78, 0.04], [-0.95, 1.62, 0.1], [-1.35, 1.2, 0.18]], from: 0.24, to: 0.05, swing: 0.22, phase: 0 },
  { points: [CORE, [0.45, 1.8, 0.04], [0.95, 1.66, 0.1], [1.3, 1.25, 0.18]], from: 0.24, to: 0.05, swing: 0.22, phase: Math.PI },
  { points: [CORE, [-0.3, 1.0, 0.02], [-0.55, 0.45, 0.05], [-0.78, 0.04, 0.12]], from: 0.28, to: 0.06, swing: 0.06, phase: Math.PI / 2 },
  { points: [CORE, [0.3, 1.0, 0.02], [0.58, 0.45, 0.05], [0.8, 0.04, 0.12]], from: 0.28, to: 0.06, swing: 0.06, phase: -Math.PI / 2 },
]

export default function Figure({ ink, red, font, still = false }: FigureProps) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const limbRefs = useRef<(THREE.Group | null)[]>([])
  const face = useFaceTexture(red, font)

  const limbs = useMemo(() => LIMBS.map((l) => taperedTube(l.points, l.from, l.to)), [])
  const torso = useMemo(() => taperedTube([[0, 2.12, 0], [0, 1.9, 0.01], CORE], 0.16, 0.28), [])

  // A disc bent onto the head so the logo sits on the sphere, planar UVs kept.
  const faceGeo = useMemo(() => {
    const ring = new THREE.RingGeometry(0.0001, 0.36, 64, 16)
    const pos = ring.attributes.position
    const uv = ring.attributes.uv
    const R = 0.506
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.sqrt(Math.max(R * R - x * x - y * y, 0)))
      uv.setXY(i, x / 0.72 + 0.5, y / 0.72 + 0.5)
    }
    ring.computeVertexNormals()
    return ring
  }, [])

  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ink, metalness: 1, roughness: 0.08 }),
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
    body.current.rotation.z = sway * 0.05
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
    <group ref={body} scale={1.22}>
      <mesh geometry={torso.geo} material={chrome} />
      <mesh position={CORE} material={chrome}>
        <sphereGeometry args={[0.3, 32, 32]} />
      </mesh>

      {limbs.map((limb, i) => (
        <group key={i} position={CORE} ref={(el) => { limbRefs.current[i] = el }}>
          <group position={[-CORE[0], -CORE[1], -CORE[2]]}>
            <mesh geometry={limb.geo} material={chrome} />
            <mesh position={limb.tip} material={chrome}>
              <sphereGeometry args={[limb.tipRadius, 16, 16]} />
            </mesh>
          </group>
        </group>
      ))}

      <group ref={head} position={[0, 2.55, 0]}>
        <mesh material={chrome}>
          <sphereGeometry args={[0.5, 64, 64]} />
        </mesh>
        <mesh geometry={faceGeo}>
          <meshStandardMaterial map={face} metalness={0.25} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
