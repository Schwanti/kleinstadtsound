'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const CAMERA_HOME = new THREE.Vector3(0, 2.7, 7.6)
export const CAMERA_TARGET = new THREE.Vector3(0, 1.35, 0)
const DRIFT = new THREE.Vector2(1.5, 0.9)

// The camera drifts a little with the pointer, so the scene has depth.
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
