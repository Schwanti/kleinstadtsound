'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { showToast } from '@/components/ui/toast'

// The camera drifts a little with the pointer, so the scene has depth.
export const CAMERA_HOME = new THREE.Vector3(0, 2.7, 7.6)
export const CAMERA_TARGET = new THREE.Vector3(0, 1.35, 0)
const DRIFT = new THREE.Vector2(1.5, 0.9)

// Easter egg: "MAKE A MOVE" in gaffer tape, each word stuck somewhere else in the room.
// Only from one spot do the three words line up, like the original on the wall.
// The spot is reached with the pointer low on the right of the scene.
const SWEET_POINTER = new THREE.Vector2(0.72, -0.5)
const SWEET_SPOT = CAMERA_HOME.clone().add(new THREE.Vector3(SWEET_POINTER.x * DRIFT.x, SWEET_POINTER.y * DRIFT.y, 0))
const PLANE_DISTANCE = 7
const WORD_HEIGHT = 0.62
const WORDS = [
  { text: 'MAKE', x: -1.75, depth: 0.42 },
  { text: 'A', x: -0.78, depth: 0.58 },
  { text: 'MOVE', x: 1.05, depth: 0.76 },
]
const ALIGNED = 0.35

// Letters cut from gaffer tape: silver cloth with a woven texture, each one stuck a bit askew.
function drawTapeWord(text: string, font: string, tape: string, edge: string, outline: string) {
  const h = 160
  const probe = document.createElement('canvas').getContext('2d')
  if (probe) probe.font = `140px ${font}`
  const w = Math.ceil((probe?.measureText(text).width ?? text.length * 70) + 56)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.font = `140px ${font}`
    ctx.textBaseline = 'middle'
    let x = 28
    ;[...text].forEach((ch, i) => {
      const cw = ctx.measureText(ch).width
      ctx.save()
      ctx.translate(x + cw / 2, h / 2)
      ctx.rotate(Math.sin(i * 2.7 + text.length) * 0.06)
      ctx.lineWidth = 16
      ctx.lineJoin = 'round'
      ctx.strokeStyle = outline
      ctx.strokeText(ch, -cw / 2, 0)
      ctx.lineWidth = 5
      ctx.strokeStyle = edge
      ctx.strokeText(ch, -cw / 2, 0)
      ctx.fillStyle = tape
      ctx.fillText(ch, -cw / 2, 0)
      ctx.restore()
      x += cw
    })
    // the woven cloth of the tape, only where there is tape
    ctx.globalCompositeOperation = 'source-atop'
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 1
    for (let i = -h; i < w; i += 5) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + h, h)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { texture, aspect: w / h }
}

export function CameraRig({ still = false }: { still?: boolean }) {
  const goal = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, delta) => {
    if (still) return
    const camera = state.camera
    const dt = Math.min(delta, 0.05)
    goal.set(CAMERA_HOME.x + state.pointer.x * DRIFT.x, CAMERA_HOME.y + state.pointer.y * DRIFT.y, CAMERA_HOME.z)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goal.x, 3, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goal.y, 3, dt)
    camera.lookAt(CAMERA_TARGET)
  })
  return null
}

export default function MakeAMove({
  font,
  tape,
  edge,
  outline,
  still = false,
}: {
  font: string
  tape: string
  edge: string
  outline: string
  still?: boolean
}) {
  const camera = useThree((s) => s.camera)
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const found = useRef(false)

  // Place each word on the ray from the sweet spot, at its own depth, scaled so that
  // all three look the same size from there.
  const words = useMemo(() => {
    const forward = CAMERA_TARGET.clone().sub(SWEET_SPOT).normalize()
    const right = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
    const up = right.clone().cross(forward).normalize()
    const lineCenter = SWEET_SPOT.clone().addScaledVector(forward, PLANE_DISTANCE).addScaledVector(up, 1.95)
    const helper = new THREE.Object3D()
    return WORDS.map((word) => {
      const onPlane = lineCenter.clone().addScaledVector(right, word.x)
      const position = SWEET_SPOT.clone().lerp(onPlane, word.depth)
      helper.position.copy(position)
      helper.up.copy(up)
      helper.lookAt(SWEET_SPOT)
      const { texture, aspect } = drawTapeWord(word.text, font, tape, edge, outline)
      return {
        position,
        quaternion: helper.quaternion.clone(),
        scale: [WORD_HEIGHT * aspect * word.depth, WORD_HEIGHT * word.depth, 1] as [number, number, number],
        texture,
      }
    })
  }, [font, tape, edge, outline])

  useFrame(() => {
    const aligned = camera.position.distanceTo(SWEET_SPOT) < ALIGNED
    materials.current.forEach((m) => {
      if (m) m.opacity = THREE.MathUtils.lerp(m.opacity, aligned ? 1 : 0.3, 0.12)
    })
    if (aligned && !found.current) {
      found.current = true
      showToast('Make A Move')
    }
  })

  if (still) return null
  return (
    <group>
      {words.map((w, i) => (
        <mesh key={i} position={w.position} quaternion={w.quaternion} scale={w.scale} renderOrder={10}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[i] = m
            }}
            map={w.texture}
            transparent
            opacity={0.3}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
